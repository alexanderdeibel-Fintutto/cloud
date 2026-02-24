import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Upload, ArrowLeft, Loader2, Check, Edit, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MeterIcon } from '@/components/meters/MeterIcon';
import { useBuildings } from '@/hooks/useBuildings';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { METER_TYPE_LABELS, METER_TYPE_UNITS, UnitWithMeters } from '@/types/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Step = 'select' | 'capture' | 'processing' | 'confirm' | 'success';

export default function ReadMeter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { buildings, isLoading, createReading } = useBuildings();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Flatten all units across buildings
  const units: UnitWithMeters[] = buildings.flatMap(b => b.units);
  
  const [step, setStep] = useState<Step>('select');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedMeterId, setSelectedMeterId] = useState<string>(searchParams.get('meter') || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<{ value: number; confidence: number } | null>(null);
  const [editedValue, setEditedValue] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Set selected unit based on meter
  useEffect(() => {
    if (selectedMeterId && units.length > 0) {
      const unit = units.find(u => u.meters.some(m => m.id === selectedMeterId));
      if (unit) {
        setSelectedUnitId(unit.id);
      }
    }
  }, [selectedMeterId, units]);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Connect stream to video element when both are available - critical for iOS Safari
  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      const video = videoRef.current;
      
      // Set srcObject
      video.srcObject = stream;
      
      // iOS Safari requires explicit play call
      const playVideo = async () => {
        try {
          await video.play();
          setCameraReady(true);
        } catch (err) {
          console.error('Failed to play video:', err);
          // Try again after a short delay
          setTimeout(async () => {
            try {
              await video.play();
              setCameraReady(true);
            } catch (retryErr) {
              console.error('Retry play failed:', retryErr);
            }
          }, 500);
        }
      };
      
      playVideo();
    }
  }, [showCamera, stream]);

  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const selectedMeter = selectedUnit?.meters.find(m => m.id === selectedMeterId);

  const startCamera = async () => {
    setCameraReady(false);
    setShowCamera(true); // Show camera UI first
    
    // Small delay to ensure video element is mounted
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
    } catch (error) {
      console.error('Camera access error:', error);
      setShowCamera(false);
      toast({
        variant: 'destructive',
        title: 'Kamera-Fehler',
        description: error instanceof Error 
          ? `Kamerazugriff fehlgeschlagen: ${error.message}`
          : 'Die Kamera konnte nicht gestartet werden.',
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'meter-photo.jpg', { type: 'image/jpeg' });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          stopCamera();
          processImage(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    setStep('processing');
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 200);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call OCR edge function
      const { data, error } = await supabase.functions.invoke('ocr-meter', {
        body: { 
          image: base64,
          meterType: selectedMeter?.meter_type 
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data?.value !== undefined) {
        setOcrResult({
          value: data.value,
          confidence: data.confidence || 85,
        });
        setEditedValue(data.value.toString());
        setStep('confirm');
      } else {
        throw new Error('Kein Wert erkannt');
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        variant: 'destructive',
        title: 'OCR-Fehler',
        description: 'Der Zählerstand konnte nicht erkannt werden. Bitte manuell eingeben.',
      });
      setOcrResult(null);
      setEditedValue('');
      setIsEditing(true);
      setStep('confirm');
    }
  };

  const handleSave = async () => {
    if (!selectedMeterId || !editedValue || !user) return;
    
    const value = parseFloat(editedValue.replace(',', '.'));
    if (isNaN(value)) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte geben Sie einen gültigen Wert ein.',
      });
      return;
    }

    setSaving(true);

    try {
      let imageUrl: string | undefined;

      // Upload image if available
      if (imageFile) {
        const fileName = `${user.id}/${selectedMeterId}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('meter-photos')
          .upload(fileName, imageFile);

        if (!uploadError) {
          // Store only the file path - signed URLs will be generated on-demand
          // This ensures RLS is re-evaluated each time image is accessed
          imageUrl = fileName;
        }
      }

      // Create reading
      await createReading.mutateAsync({
        meter_id: selectedMeterId,
        reading_value: value,
        image_url: imageUrl,
        source: ocrResult ? 'ocr' : 'manual',
        confidence: ocrResult?.confidence,
      });

      setStep('success');
      
      setTimeout(() => {
        navigate(`/meters/${selectedMeterId}`);
      }, 2000);
    } catch (error: unknown) {
      console.error('Save reading error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: `Die Ablesung konnte nicht gespeichert werden: ${errorMessage}`,
      });
    }

    setSaving(false);
  };

  const canProceed = selectedUnitId && selectedMeterId;

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-primary" />
          </motion.div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </motion.div>
      </AppLayout>
    );
  }

  // No units
  if (units.length === 0) {
    return (
      <AppLayout title="Zähler ablesen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-accent/50 mx-auto mb-5 flex items-center justify-center shadow-soft"
          >
            <Camera className="w-10 h-10 text-muted-foreground" />
          </motion.div>
          <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
            Bitte legen Sie zuerst ein Gebäude und eine Einheit an.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => navigate('/buildings/new')}
              className="gradient-primary text-primary-foreground font-semibold px-6 rounded-xl shadow-glow"
            >
              Gebäude anlegen
            </Button>
          </motion.div>
        </motion.div>
      </AppLayout>
    );
  }

  // Camera view
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 flex justify-between items-center safe-area-pt"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={stopCamera} className="text-white rounded-xl">
              <X className="w-6 h-6" />
            </Button>
          </motion.div>
          <span className="text-white font-semibold">
            Zähler fotografieren
          </span>
          <div className="w-10" />
        </motion.div>

        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={(e) => {
              // Ensure video plays when metadata is loaded
              const video = e.currentTarget;
              video.play().catch(console.error);
            }}
            onCanPlay={() => setCameraReady(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Loading overlay while camera initializes */}
          {!cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-white text-sm">Kamera wird gestartet...</p>
            </div>
          )}
          
          {/* Viewfinder overlay - only show when camera is ready */}
          {cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: [1, 1.02, 1], opacity: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-72 h-28 border-2 border-primary rounded-2xl shadow-glow"
              />
            </div>
          )}
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: cameraReady ? 1 : 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-28 left-0 right-0 text-center text-white text-sm px-4"
          >
            Positionieren Sie die Zähleranzeige im Rahmen
          </motion.p>
        </div>

        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="p-6 bg-gradient-to-t from-black/80 to-transparent safe-area-pb"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="lg" 
              className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl shadow-glow text-base"
              onClick={capturePhoto}
              disabled={!cameraReady}
            >
              {!cameraReady ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Kamera lädt...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Foto aufnehmen
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="ghost"
          className="mb-4 -ml-2 rounded-xl hover:bg-accent/80"
          onClick={() => step === 'select' ? navigate(-1) : setStep('select')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step: Select meter */}
        {step === 'select' && (
          <motion.div 
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold mb-2">Zähler ablesen</h1>
              <p className="text-muted-foreground">
                Wählen Sie den Zähler aus, den Sie ablesen möchten.
              </p>
            </div>

            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium">Einheit</Label>
                <Select value={selectedUnitId} onValueChange={(v) => {
                  setSelectedUnitId(v);
                  setSelectedMeterId('');
                }}>
                  <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50">
                    <SelectValue placeholder="Einheit auswählen" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id} className="rounded-lg">
                        {unit.unit_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {selectedUnit && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Label className="text-sm font-medium">Zähler</Label>
                  {selectedUnit.meters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Diese Einheit hat noch keine Zähler.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUnit.meters.map((meter, index) => (
                        <motion.div
                          key={meter.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all glass-card border-0 ${
                              selectedMeterId === meter.id 
                                ? 'ring-2 ring-primary shadow-glow' 
                                : 'hover:bg-accent/50 card-elevated'
                            }`}
                            onClick={() => setSelectedMeterId(meter.id)}
                          >
                            <CardContent className="p-4 flex items-center gap-4">
                              <MeterIcon type={meter.meter_type} size="sm" />
                              <div className="flex-1">
                                <p className="font-semibold text-sm">
                                  {METER_TYPE_LABELS[meter.meter_type]}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Nr. {meter.meter_number}
                                </p>
                              </div>
                              {selectedMeterId === meter.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center"
                                >
                                  <Check className="w-4 h-4 text-primary-foreground" />
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {canProceed && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl shadow-glow text-base"
                    onClick={startCamera}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Foto aufnehmen
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-xl border-2 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Aus Galerie wählen
                  </Button>
                </motion.div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="py-12 text-center space-y-6"
          >
            <motion.div 
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
              }}
              className="w-24 h-24 mx-auto rounded-3xl gradient-primary flex items-center justify-center shadow-glow"
            >
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </motion.div>
            
            <div>
              <h2 className="text-xl font-bold mb-2">Analysiere Bild...</h2>
              <p className="text-muted-foreground">
                Die KI erkennt den Zählerstand automatisch.
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <Progress value={progress} className="h-2 rounded-full" />
              <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
            </div>
          </motion.div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedMeter && (
          <motion.div 
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Ergebnis bestätigen</h2>
              <p className="text-muted-foreground">
                Prüfen Sie den erkannten Wert und korrigieren Sie ihn bei Bedarf.
              </p>
            </div>

            {imagePreview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl overflow-hidden shadow-lg"
              >
                <img 
                  src={imagePreview} 
                  alt="Zählerfoto" 
                  className="w-full h-48 object-cover"
                />
              </motion.div>
            )}

            <Card className="glass-card border-0">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-5">
                  <MeterIcon type={selectedMeter.meter_type} />
                  <div>
                    <p className="font-semibold">
                      {METER_TYPE_LABELS[selectedMeter.meter_type]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nr. {selectedMeter.meter_number}
                    </p>
                  </div>
                </div>

                {ocrResult && !isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6 bg-gradient-to-br from-accent/50 to-accent/20 rounded-2xl"
                  >
                    <p className="text-sm text-muted-foreground mb-2">
                      Erkannter Wert ({Math.round(ocrResult.confidence)}% Konfidenz)
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-5xl font-bold text-gradient">
                        {ocrResult.value.toLocaleString('de-DE')}
                      </p>
                      <span className="text-lg text-muted-foreground">
                        {METER_TYPE_UNITS[selectedMeter.meter_type]}
                      </span>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4 rounded-xl"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Bearbeiten
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {(isEditing || !ocrResult) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <Label className="text-sm font-medium">Zählerstand eingeben</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
                        placeholder="12345.67"
                        className="h-14 text-2xl font-bold text-center rounded-xl border-border/50 bg-background/50 placeholder:text-muted-foreground/40 placeholder:font-normal"
                      />
                      {!editedValue && (
                        <p className="absolute top-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                          Zählerstand hier eingeben
                        </p>
                      )}
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      {METER_TYPE_UNITS[selectedMeter.meter_type]}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl shadow-glow text-base"
                onClick={handleSave}
                disabled={saving || !editedValue}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Ablesung speichern
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 className="w-14 h-14 text-success-foreground" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-2">Erfolgreich!</h2>
              <p className="text-muted-foreground">
                Die Ablesung wurde gespeichert.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Weiterleitung...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
