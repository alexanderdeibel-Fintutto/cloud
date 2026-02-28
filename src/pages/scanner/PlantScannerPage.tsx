import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ScanLine,
  Camera,
  Upload,
  X,
  Leaf,
  Droplets,
  Sun,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Calendar,
  FlowerIcon,
  Clock,
  ShieldAlert,
  MapPin,
  Zap,
  Settings,
  Brain,
  Search,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';
import {
  identifyPlant,
  analyzeImageColors,
  generateCareProtocol,
  type ScanResult,
  type CareProtocol,
  type ImageAnalysis,
} from '@/lib/plant-scanner';
import {
  identifyWithPlantId,
  isPlantIdConfigured,
  getApiKey,
  setApiKey,
  type PlantIdSuggestion,
} from '@/lib/plant-id-api';
import { PLANT_SPECIES } from '@/data/plants';
import { PlantSpecies } from '@/types';
import { toast } from 'sonner';

type ScanStep = 'capture' | 'identifying' | 'results' | 'protocol';
const steps: ScanStep[] = ['capture', 'identifying', 'results', 'protocol'];

/** Extended scan result that can come from Plant.id or local scanner */
interface ExtendedScanResult {
  species: PlantSpecies | null;
  confidence: number;
  matchedFeatures: string[];
  // Plant.id specific data (when species not in local DB)
  plantIdName?: string;
  plantIdCommonNames?: string[];
  plantIdDescription?: string;
  plantIdImageUrl?: string;
  plantIdUrl?: string;
  plantIdFamily?: string;
}

const difficultyLabels: Record<string, { label: string; color: string }> = {
  easy: { label: 'Einfach', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  medium: { label: 'Mittel', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  hard: { label: 'Anspruchsvoll', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const lightLabels: Record<string, string> = {
  low: 'Wenig Licht',
  medium: 'Halbschatten',
  bright: 'Hell',
  direct: 'Direkte Sonne',
};

/**
 * Try to match a Plant.id suggestion to our local plant database.
 * Matches by botanical name (exact or partial).
 */
function matchToLocalPlant(suggestion: PlantIdSuggestion): PlantSpecies | null {
  const botanicalLower = suggestion.name.toLowerCase();

  // Exact botanical name match
  const exact = PLANT_SPECIES.find(
    p => p.botanical_name.toLowerCase() === botanicalLower
  );
  if (exact) return exact;

  // Genus match (first word of botanical name)
  const genus = botanicalLower.split(' ')[0];
  if (genus.length >= 4) {
    const genusMatch = PLANT_SPECIES.find(
      p => p.botanical_name.toLowerCase().startsWith(genus)
    );
    if (genusMatch) return genusMatch;
  }

  // Common name match
  if (suggestion.details?.common_names) {
    for (const cn of suggestion.details.common_names) {
      const cnLower = cn.toLowerCase();
      const match = PLANT_SPECIES.find(
        p => p.common_name.toLowerCase() === cnLower ||
             p.common_name.toLowerCase().includes(cnLower) ||
             cnLower.includes(p.common_name.toLowerCase())
      );
      if (match) return match;
    }
  }

  return null;
}

export default function PlantScannerPage() {
  const navigate = useNavigate();
  const { addPlant, apartments, getRoomsForApartment } = usePlants();

  const [step, setStep] = useState<ScanStep>('capture');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [results, setResults] = useState<ExtendedScanResult[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<PlantSpecies | null>(null);
  const [selectedResult, setSelectedResult] = useState<ExtendedScanResult | null>(null);
  const [careProtocol, setCareProtocol] = useState<CareProtocol | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [identifyingText, setIdentifyingText] = useState('Pflanze wird erkannt...');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Attach stream to video element once both are available
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().then(() => {
          setVideoReady(true);
        }).catch(() => {
          setCameraError('Video konnte nicht abgespielt werden.');
          setCameraActive(false);
        });
      };
    }
  }, [cameraActive]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      setCameraError('Kamera konnte nicht aktiviert werden. Bitte erlaube den Kamerazugriff oder lade ein Foto hoch.');
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setVideoReady(false);
  }, []);

  const captureFromCamera = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Kamera ist nicht bereit. Bitte versuche es erneut.');
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Kein Bild von der Kamera empfangen. Bitte warte einen Moment und versuche es erneut.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast.error('Canvas konnte nicht initialisiert werden.');
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    if (dataUrl.length < 1000) {
      toast.error('Das aufgenommene Bild ist leer. Bitte versuche es erneut.');
      return;
    }

    setImageUrl(dataUrl);
    stopCamera();
    toast.success('Foto aufgenommen!');
  }, [stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Bitte nur Bilddateien hochladen.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  }, [stopCamera]);

  const runIdentification = useCallback(async () => {
    setStep('identifying');
    setUsedAI(false);

    const hasApiKey = isPlantIdConfigured();
    const hasImage = !!imageUrl;

    // Plant.id API path: when we have an image and API key
    if (hasApiKey && hasImage) {
      setIdentifyingText('KI analysiert das Bild...');
      try {
        const result = await identifyWithPlantId(imageUrl);

        if (!result.is_plant) {
          // Not a plant detected
          setResults([]);
          setUsedAI(true);
          setStep('results');
          return;
        }

        // Convert Plant.id suggestions to ExtendedScanResult
        const extendedResults: ExtendedScanResult[] = result.suggestions
          .filter(s => s.probability > 0.01)
          .slice(0, 8)
          .map(suggestion => {
            const localPlant = matchToLocalPlant(suggestion);
            return {
              species: localPlant,
              confidence: Math.round(suggestion.probability * 100),
              matchedFeatures: [suggestion.name],
              plantIdName: suggestion.name,
              plantIdCommonNames: suggestion.details?.common_names,
              plantIdDescription: suggestion.details?.description?.value,
              plantIdImageUrl: suggestion.details?.image?.value,
              plantIdUrl: suggestion.details?.url,
              plantIdFamily: suggestion.details?.taxonomy?.family,
            };
          });

        setResults(extendedResults);
        setUsedAI(true);
        setStep('results');
        return;
      } catch (err: any) {
        toast.error(err.message || 'Plant.id API Fehler');
        // Fall through to local identification
      }
    }

    // Local identification path (fallback or no API key)
    setIdentifyingText('Lokale Erkennung läuft...');

    await new Promise(resolve => setTimeout(resolve, 600));

    let imageAnalysis: ImageAnalysis | undefined;

    const finalize = () => {
      const scanResults = identifyPlant(textQuery || '', imageAnalysis);
      const extendedResults: ExtendedScanResult[] = scanResults.map(r => ({
        species: r.species,
        confidence: r.confidence,
        matchedFeatures: r.matchedFeatures,
      }));
      setResults(extendedResults);
      setStep('results');
    };

    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        try {
          imageAnalysis = analyzeImageColors(img);
        } catch (e) {
          // Color analysis failed
        }
        finalize();
      };
      img.onerror = () => finalize();
      if (!imageUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = imageUrl;

      setTimeout(() => {
        if (step === 'identifying') finalize();
      }, 5000);
    } else {
      finalize();
    }
  }, [imageUrl, textQuery, step]);

  const selectResult = useCallback((result: ExtendedScanResult) => {
    setSelectedResult(result);

    if (result.species) {
      setSelectedSpecies(result.species);

      let roomLight: 'low' | 'medium' | 'bright' | 'direct' | undefined;
      if (apartments.length > 0) {
        const rooms = getRoomsForApartment(apartments[0].id);
        if (rooms.length > 0) roomLight = rooms[0].light_level;
      }

      const protocol = generateCareProtocol(result.species, roomLight);
      setCareProtocol(protocol);
    } else {
      setSelectedSpecies(null);
      setCareProtocol(null);
    }
    setStep('protocol');
  }, [apartments, getRoomsForApartment]);

  const addToMyPlants = useCallback((species: PlantSpecies) => {
    navigate(`/catalog/${species.id}`);
    toast.success(`Öffne "${species.common_name}" im Katalog zum Hinzufügen.`);
  }, [navigate]);

  const addToCarePlan = useCallback((species: PlantSpecies) => {
    navigate(`/catalog/${species.id}`);
    toast.info(
      'Füge die Pflanze zuerst zu "Meine Pflanzen" hinzu – der Pflegeplan wird automatisch erstellt.',
      { duration: 5000 }
    );
  }, [navigate]);

  const reset = useCallback(() => {
    stopCamera();
    setStep('capture');
    setImageUrl(null);
    setTextQuery('');
    setResults([]);
    setSelectedSpecies(null);
    setSelectedResult(null);
    setCareProtocol(null);
    setCameraError(null);
    setUsedAI(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [stopCamera]);

  const saveApiKey = useCallback(() => {
    setApiKey(apiKeyInput);
    setShowApiKeyInput(false);
    if (apiKeyInput.trim()) {
      toast.success('Plant.id API-Key gespeichert!');
    } else {
      toast.info('API-Key entfernt. Es wird die lokale Erkennung verwendet.');
    }
  }, [apiKeyInput]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScanLine className="h-7 w-7 text-primary" />
            Pflanzen-Scanner
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPlantIdConfigured()
              ? 'KI-gestützte Pflanzenerkennung mit Plant.id'
              : 'Fotografiere oder beschreibe eine Pflanze zur Erkennung.'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {step !== 'capture' && (
            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Neuer Scan
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setApiKeyInput(getApiKey() || '');
              setShowApiKeyInput(!showApiKeyInput);
            }}
            title="API-Einstellungen"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* API Key Configuration */}
      {showApiKeyInput && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Plant.id API-Key</span>
              {isPlantIdConfigured() && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                  Aktiv
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Für KI-basierte Erkennung benötigst du einen API-Key von{' '}
              <a
                href="https://web.plant.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center gap-1"
              >
                plant.id <ExternalLink className="h-3 w-3" />
              </a>
              . Ohne Key wird die lokale Erkennung (Textsuche + Farbanalyse) verwendet.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="Dein Plant.id API-Key..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveApiKey();
                  }}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={saveApiKey} className="gap-1">
                Speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Status Badge */}
      {step === 'capture' && (
        <div className="flex items-center gap-2">
          {isPlantIdConfigured() ? (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 gap-1">
              <Brain className="h-3 w-3" />
              KI-Erkennung aktiv (Plant.id)
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              Lokale Erkennung (ohne API-Key)
            </Badge>
          )}
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {[
          { key: 'capture', label: 'Erfassen' },
          { key: 'identifying', label: 'Erkennung' },
          { key: 'results', label: 'Ergebnis' },
          { key: 'protocol', label: 'Pflegeprotokoll' },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            <span
              className={
                step === s.key
                  ? 'font-semibold text-primary'
                  : steps.indexOf(step) > steps.indexOf(s.key as ScanStep)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-muted-foreground'
              }
            >
              {steps.indexOf(step) > steps.indexOf(s.key as ScanStep) && (
                <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
              )}
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP: Capture */}
      {step === 'capture' && (
        <div className="space-y-6">
          {/* Camera / Image preview */}
          <Card>
            <CardContent className="p-6">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Aufgenommenes Pflanzenbild"
                    className="w-full max-h-[400px] object-contain rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : cameraActive ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-[400px] object-cover rounded-lg bg-black"
                    style={{ minHeight: '300px' }}
                  />
                  {!videoReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                      <div className="w-12 h-12 rounded-full border-4 border-green-400 border-t-transparent animate-spin" />
                      <p className="text-white text-sm mt-3">Kamera wird gestartet...</p>
                    </div>
                  )}
                  {videoReady && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-green-400 rounded-2xl opacity-60 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    <Button
                      onClick={captureFromCamera}
                      disabled={!videoReady}
                      className="bg-green-600 hover:bg-green-700 gap-2 disabled:opacity-50"
                    >
                      <Camera className="h-4 w-4" />
                      {videoReady ? 'Aufnehmen' : 'Wird geladen...'}
                    </Button>
                    <Button variant="outline" onClick={stopCamera} className="bg-white/80 dark:bg-black/50">
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <ScanLine className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">Pflanze fotografieren oder Bild hochladen</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isPlantIdConfigured()
                        ? 'Die KI erkennt tausende Pflanzenarten aus einem einzigen Foto.'
                        : 'Für beste Ergebnisse: Blätter gut sichtbar, bei Tageslicht fotografieren.'
                      }
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={startCamera} className="gap-2">
                      <Camera className="h-4 w-4" />
                      Kamera öffnen
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Bild hochladen
                    </Button>
                  </div>
                  {cameraError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {cameraError}
                    </p>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>

          {/* Text description */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Beschreibung (optional – hilft bei der Erkennung)
                </label>
                <Input
                  placeholder="z.B. große grüne Blätter mit Löchern, Monstera..."
                  value={textQuery}
                  onChange={e => setTextQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (imageUrl || textQuery.trim())) {
                      runIdentification();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isPlantIdConfigured()
                    ? 'Die KI erkennt die Pflanze automatisch. Text ist optional als Zusatzinfo.'
                    : 'Beschreibe Blattform, Farbe, Größe oder den bekannten Namen.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Start scan button */}
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 gap-2 h-12 text-base"
            disabled={!imageUrl && !textQuery.trim()}
            onClick={runIdentification}
          >
            {isPlantIdConfigured() ? (
              <>
                <Brain className="h-5 w-5" />
                KI-Erkennung starten
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Pflanze erkennen
              </>
            )}
          </Button>
        </div>
      )}

      {/* STEP: Identifying */}
      {step === 'identifying' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              {isPlantIdConfigured() ? (
                <Brain className="h-8 w-8 text-primary" />
              ) : (
                <ScanLine className="h-8 w-8 text-primary" />
              )}
            </div>
            <p className="font-medium text-lg">{identifyingText}</p>
            <p className="text-sm text-muted-foreground">
              {isPlantIdConfigured()
                ? 'Bild wird an die Plant.id KI gesendet...'
                : 'Analyse von Bild und Beschreibung'
              }
            </p>
            <Progress value={65} className="w-48" />
          </CardContent>
        </Card>
      )}

      {/* STEP: Results */}
      {step === 'results' && (
        <div className="space-y-4">
          {imageUrl && (
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="Gescannte Pflanze"
                className="w-40 h-40 object-cover rounded-xl shadow-md"
              />
            </div>
          )}

          {usedAI && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 gap-1">
              <Brain className="h-3 w-3" />
              Ergebnis via Plant.id KI
            </Badge>
          )}

          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium">
                  {usedAI ? 'Keine Pflanze im Bild erkannt' : 'Keine Pflanze erkannt'}
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  {usedAI
                    ? 'Die KI konnte keine Pflanze im Bild identifizieren. Stelle sicher, dass eine Pflanze gut sichtbar ist.'
                    : 'Versuche es mit einem schärferen Foto, besserer Beleuchtung oder einer genaueren Beschreibung.'
                  }
                </p>
                <Button onClick={reset} variant="outline" className="gap-2 mt-2">
                  <RotateCcw className="h-4 w-4" />
                  Erneut versuchen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {results.length} mögliche{results.length === 1 ? 'r' : ''} Treffer gefunden. Wähle die richtige Pflanze:
              </p>
              {results.map((result, idx) => {
                const name = result.species?.common_name || result.plantIdCommonNames?.[0] || result.plantIdName || 'Unbekannt';
                const botanical = result.species?.botanical_name || result.plantIdName || '';
                const family = result.species?.family || result.plantIdFamily || '';
                const inLocalDb = !!result.species;

                return (
                  <Card
                    key={`${result.plantIdName || result.species?.id}-${idx}`}
                    className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${
                      idx === 0 ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/10' : ''
                    }`}
                    onClick={() => selectResult(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {result.plantIdImageUrl ? (
                              <img
                                src={result.plantIdImageUrl}
                                alt={name}
                                className="w-14 h-14 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                                <Leaf className="h-7 w-7 text-green-600 dark:text-green-400" />
                              </div>
                            )}
                            {idx === 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <Sparkles className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{name}</p>
                              {idx === 0 && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                  Bester Treffer
                                </Badge>
                              )}
                              {inLocalDb && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Im Katalog
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                              {botanical}{family ? ` · ${family}` : ''}
                            </p>
                            {result.species && (
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${difficultyLabels[result.species.difficulty]?.color || ''}`}
                                >
                                  {difficultyLabels[result.species.difficulty]?.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {lightLabels[result.species.light]}
                                </span>
                              </div>
                            )}
                            {!inLocalDb && result.plantIdCommonNames && result.plantIdCommonNames.length > 1 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Auch: {result.plantIdCommonNames.slice(1, 3).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {result.confidence}%
                            </span>
                          </div>
                          <Progress value={result.confidence} className="w-20 h-1.5" />
                          <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* STEP: Care Protocol */}
      {step === 'protocol' && selectedResult && (
        <div className="space-y-6">
          {/* Species header */}
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {(imageUrl || selectedResult.plantIdImageUrl) && (
                  <img
                    src={imageUrl || selectedResult.plantIdImageUrl || ''}
                    alt={selectedResult.species?.common_name || selectedResult.plantIdName || ''}
                    className="w-24 h-24 object-cover rounded-xl shadow-sm flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-xl font-bold">
                      {selectedResult.species?.common_name
                        || selectedResult.plantIdCommonNames?.[0]
                        || selectedResult.plantIdName
                        || 'Unbekannte Pflanze'}
                    </h2>
                    {selectedSpecies && (
                      <Badge
                        className={difficultyLabels[selectedSpecies.difficulty]?.color}
                      >
                        {difficultyLabels[selectedSpecies.difficulty]?.label}
                      </Badge>
                    )}
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                      {selectedResult.confidence}% Konfidenz
                    </Badge>
                  </div>
                  <p className="text-sm italic text-muted-foreground mb-2">
                    {selectedResult.species?.botanical_name || selectedResult.plantIdName}
                    {(selectedResult.species?.family || selectedResult.plantIdFamily) &&
                      ` · ${selectedResult.species?.family || selectedResult.plantIdFamily}`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {selectedResult.species?.description || selectedResult.plantIdDescription || ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plant.id-only result (not in local DB) */}
          {!selectedSpecies && selectedResult.plantIdName && (
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Pflanze nicht im lokalen Katalog</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      "{selectedResult.plantIdCommonNames?.[0] || selectedResult.plantIdName}" wurde von der KI erkannt,
                      ist aber nicht in unserem Pflanzenkatalog. Detaillierte Pflegeinfos sind daher nicht verfügbar.
                    </p>
                    {selectedResult.plantIdUrl && (
                      <a
                        href={selectedResult.plantIdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1 mt-2"
                      >
                        Mehr Informationen online <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Care Protocol (only for plants in local DB) */}
          {selectedSpecies && careProtocol && (
            <>
              {/* Weekly care tasks */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Pflegeprotokoll
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {careProtocol.weeklyTasks.map(task => {
                    const iconMap: Record<string, typeof Droplets> = {
                      water: Droplets,
                      fertilize: FlowerIcon,
                      mist: Sparkles,
                      rotate: RotateCcw,
                      prune: Leaf,
                      repot: FlowerIcon,
                    };
                    const colorMap: Record<string, string> = {
                      water: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
                      fertilize: 'text-green-500 bg-green-50 dark:bg-green-950/30',
                      mist: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
                      rotate: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
                      prune: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
                      repot: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
                    };
                    const Icon = iconMap[task.type] || Droplets;

                    return (
                      <div
                        key={task.type}
                        className={`flex items-start gap-3 p-3 rounded-lg ${colorMap[task.type] || 'bg-muted'}`}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background shadow-sm flex-shrink-0">
                          <Icon className={`h-5 w-5 ${colorMap[task.type]?.split(' ')[0] || ''}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{task.label}</span>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Alle {task.frequencyDays} Tage
                            </Badge>
                            {task.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs">Wichtig</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Placement */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Standort-Empfehlung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span>{lightLabels[selectedSpecies.light]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="h-4 w-4 text-red-400" />
                      <span>{selectedSpecies.temperature_min}–{selectedSpecies.temperature_max}°C</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span>Feuchtigkeit: {selectedSpecies.humidity === 'high' ? 'Hoch' : selectedSpecies.humidity === 'medium' ? 'Mittel' : 'Niedrig'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{careProtocol.placement}</p>
                </CardContent>
              </Card>

              {/* Seasonal notes */}
              {careProtocol.seasonalNotes.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      Saisonale Hinweise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {careProtocol.seasonalNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              {careProtocol.warnings.length > 0 && (
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
                      <ShieldAlert className="h-5 w-5" />
                      Warnhinweise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {careProtocol.warnings.map((warning, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {selectedSpecies ? (
              <>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2 h-11"
                  onClick={() => addToMyPlants(selectedSpecies)}
                >
                  <Plus className="h-4 w-4" />
                  Zu meinen Pflanzen hinzufügen
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 h-11"
                  onClick={() => addToCarePlan(selectedSpecies)}
                >
                  <Droplets className="h-4 w-4" />
                  In Pflegeplan aufnehmen
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 h-11"
                  onClick={() => navigate('/catalog')}
                >
                  <Search className="h-4 w-4" />
                  Im Katalog suchen
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 h-11"
                  onClick={reset}
                >
                  <RotateCcw className="h-4 w-4" />
                  Neuer Scan
                </Button>
              </>
            )}
          </div>

          {/* Care tips from species */}
          {selectedSpecies && selectedSpecies.care_tips.length > 0 && (
            <Card className="bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Profi-Tipps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedSpecies.care_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Leaf className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
