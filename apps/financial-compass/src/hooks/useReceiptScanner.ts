import { useState, useCallback, useRef } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

export interface ScannedReceipt {
  id: string;
  company_id: string;
  image_data: string; // Base64 encoded image
  image_name: string;
  scan_date: string;
  status: 'pending' | 'processing' | 'analyzed' | 'saved' | 'error';
  extracted_data?: ExtractedReceiptData;
  confidence_score?: number;
  error_message?: string;
  created_at: string;
}

export interface ExtractedReceiptData {
  vendor_name?: string;
  vendor_address?: string;
  vendor_tax_id?: string;
  receipt_date?: string;
  receipt_number?: string;
  total_amount?: number;
  net_amount?: number;
  tax_amount?: number;
  tax_rate?: number;
  currency?: string;
  payment_method?: string;
  items?: ExtractedItem[];
  category?: string;
}

export interface ExtractedItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate?: number;
}

export interface ScannerSettings {
  auto_analyze: boolean;
  auto_save: boolean;
  default_category: string;
  preferred_camera: 'environment' | 'user';
  image_quality: 'low' | 'medium' | 'high';
  enable_flash: boolean;
  crop_to_receipt: boolean;
}

const SCANNED_RECEIPTS_KEY = 'fintutto_scanned_receipts';
const SCANNER_SETTINGS_KEY = 'fintutto_scanner_settings';

export function useReceiptScanner() {
  const { currentCompany } = useCompany();
  const [scannedReceipts, setScannedReceipts] = useState<ScannedReceipt[]>([]);
  const [settings, setSettings] = useState<ScannerSettings>(getDefaultSettings());
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load data from localStorage
  const loadData = useCallback(() => {
    if (!currentCompany) return;

    const storedReceipts = localStorage.getItem(`${SCANNED_RECEIPTS_KEY}_${currentCompany.id}`);
    const storedSettings = localStorage.getItem(`${SCANNER_SETTINGS_KEY}_${currentCompany.id}`);

    if (storedReceipts) {
      try { setScannedReceipts(JSON.parse(storedReceipts)); } catch { setScannedReceipts([]); }
    }

    if (storedSettings) {
      try { setSettings(JSON.parse(storedSettings)); } catch { setSettings(getDefaultSettings()); }
    }
  }, [currentCompany]);

  // Save functions
  const saveReceipts = useCallback((list: ScannedReceipt[]) => {
    if (!currentCompany) return;
    localStorage.setItem(`${SCANNED_RECEIPTS_KEY}_${currentCompany.id}`, JSON.stringify(list));
    setScannedReceipts(list);
  }, [currentCompany]);

  const saveSettings = useCallback((newSettings: ScannerSettings) => {
    if (!currentCompany) return;
    localStorage.setItem(`${SCANNER_SETTINGS_KEY}_${currentCompany.id}`, JSON.stringify(newSettings));
    setSettings(newSettings);
  }, [currentCompany]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: settings.preferred_camera,
          width: { ideal: settings.image_quality === 'high' ? 1920 : settings.image_quality === 'medium' ? 1280 : 640 },
          height: { ideal: settings.image_quality === 'high' ? 1080 : settings.image_quality === 'medium' ? 720 : 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kamera konnte nicht gestartet werden';
      setCameraError(message);
      return false;
    }
  }, [settings.preferred_camera, settings.image_quality]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  }, [cameraStream]);

  // Capture image from camera
  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const quality = settings.image_quality === 'high' ? 0.95 : settings.image_quality === 'medium' ? 0.8 : 0.6;
    return canvas.toDataURL('image/jpeg', quality);
  }, [settings.image_quality]);

  // Analyze receipt (simulated OCR/AI)
  const analyzeReceipt = useCallback(async (imageData: string): Promise<ExtractedReceiptData> => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Generate realistic German receipt data
    const vendors = [
      { name: 'REWE Markt GmbH', address: 'Domstraße 20, 50668 Köln', tax_id: 'DE123456789' },
      { name: 'EDEKA Minden-Hannover', address: 'Wittelsbacherallee 61, 32427 Minden', tax_id: 'DE987654321' },
      { name: 'dm-drogerie markt', address: 'Am Dm-Platz 1, 76227 Karlsruhe', tax_id: 'DE111222333' },
      { name: 'Media Markt', address: 'Willy-Brandt-Platz 5, 85049 Ingolstadt', tax_id: 'DE444555666' },
      { name: 'IKEA Deutschland GmbH', address: 'Am Wandersmann 2-4, 65719 Hofheim', tax_id: 'DE777888999' },
      { name: 'Büro Express GmbH', address: 'Industriestr. 15, 60327 Frankfurt', tax_id: 'DE123789456' },
    ];

    const categories = ['Büromaterial', 'Lebensmittel', 'Elektronik', 'Möbel', 'Reisekosten', 'Bewirtung'];
    const paymentMethods = ['EC-Karte', 'Kreditkarte', 'Bar', 'PayPal'];

    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items: ExtractedItem[] = [];

    const sampleItems = [
      'Druckerpapier A4', 'Kugelschreiber 10er Pack', 'Ordner breit', 'Haftnotizen gelb',
      'Kaffee gemahlen', 'Milch 1,5%', 'Brot Vollkorn', 'Butter', 'USB-Kabel',
      'Maus wireless', 'Tastatur', 'HDMI-Adapter', 'Schreibtischlampe', 'Stuhl Büro'
    ];

    let netAmount = 0;
    for (let i = 0; i < itemCount; i++) {
      const price = Math.round((Math.random() * 50 + 1) * 100) / 100;
      const quantity = Math.floor(Math.random() * 3) + 1;
      const total = Math.round(price * quantity * 100) / 100;
      netAmount += total;

      items.push({
        name: sampleItems[Math.floor(Math.random() * sampleItems.length)],
        quantity,
        unit_price: price,
        total_price: total,
        tax_rate: 19,
      });
    }

    const taxRate = 19;
    const taxAmount = Math.round(netAmount * (taxRate / 100) * 100) / 100;
    const totalAmount = Math.round((netAmount + taxAmount) * 100) / 100;

    const receiptDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    return {
      vendor_name: vendor.name,
      vendor_address: vendor.address,
      vendor_tax_id: vendor.tax_id,
      receipt_date: receiptDate.toISOString().split('T')[0],
      receipt_number: `${Math.floor(Math.random() * 9000000) + 1000000}`,
      total_amount: totalAmount,
      net_amount: netAmount,
      tax_amount: taxAmount,
      tax_rate: taxRate,
      currency: 'EUR',
      payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      items,
      category: categories[Math.floor(Math.random() * categories.length)],
    };
  }, []);

  // Scan and process receipt
  const scanReceipt = useCallback(async (): Promise<ScannedReceipt | null> => {
    if (!currentCompany) return null;

    const imageData = captureImage();
    if (!imageData) return null;

    const newReceipt: ScannedReceipt = {
      id: `scan-${Date.now()}`,
      company_id: currentCompany.id,
      image_data: imageData,
      image_name: `beleg_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`,
      scan_date: new Date().toISOString(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const updatedReceipts = [newReceipt, ...scannedReceipts];
    saveReceipts(updatedReceipts);

    // Auto-analyze if enabled
    if (settings.auto_analyze) {
      setIsAnalyzing(true);
      try {
        const extractedData = await analyzeReceipt(imageData);
        const analyzedReceipt: ScannedReceipt = {
          ...newReceipt,
          status: 'analyzed',
          extracted_data: extractedData,
          confidence_score: 0.85 + Math.random() * 0.14,
        };

        const finalReceipts = updatedReceipts.map(r =>
          r.id === newReceipt.id ? analyzedReceipt : r
        );
        saveReceipts(finalReceipts);
        setIsAnalyzing(false);
        return analyzedReceipt;
      } catch (error) {
        const errorReceipt: ScannedReceipt = {
          ...newReceipt,
          status: 'error',
          error_message: 'Analyse fehlgeschlagen',
        };
        const errorReceipts = updatedReceipts.map(r =>
          r.id === newReceipt.id ? errorReceipt : r
        );
        saveReceipts(errorReceipts);
        setIsAnalyzing(false);
        return errorReceipt;
      }
    }

    return newReceipt;
  }, [currentCompany, captureImage, scannedReceipts, settings.auto_analyze, analyzeReceipt, saveReceipts]);

  // Process uploaded image
  const processUploadedImage = useCallback(async (file: File): Promise<ScannedReceipt | null> => {
    if (!currentCompany) return null;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        const newReceipt: ScannedReceipt = {
          id: `scan-${Date.now()}`,
          company_id: currentCompany.id,
          image_data: imageData,
          image_name: file.name,
          scan_date: new Date().toISOString(),
          status: 'pending',
          created_at: new Date().toISOString(),
        };

        const updatedReceipts = [newReceipt, ...scannedReceipts];
        saveReceipts(updatedReceipts);

        if (settings.auto_analyze) {
          setIsAnalyzing(true);
          try {
            const extractedData = await analyzeReceipt(imageData);
            const analyzedReceipt: ScannedReceipt = {
              ...newReceipt,
              status: 'analyzed',
              extracted_data: extractedData,
              confidence_score: 0.85 + Math.random() * 0.14,
            };

            const finalReceipts = updatedReceipts.map(r =>
              r.id === newReceipt.id ? analyzedReceipt : r
            );
            saveReceipts(finalReceipts);
            setIsAnalyzing(false);
            resolve(analyzedReceipt);
          } catch {
            setIsAnalyzing(false);
            resolve(newReceipt);
          }
        } else {
          resolve(newReceipt);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [currentCompany, scannedReceipts, settings.auto_analyze, analyzeReceipt, saveReceipts]);

  // Manually analyze a pending receipt
  const analyzeExistingReceipt = useCallback(async (receiptId: string): Promise<boolean> => {
    const receipt = scannedReceipts.find(r => r.id === receiptId);
    if (!receipt) return false;

    setIsAnalyzing(true);
    try {
      const extractedData = await analyzeReceipt(receipt.image_data);
      const updatedReceipts = scannedReceipts.map(r =>
        r.id === receiptId
          ? {
              ...r,
              status: 'analyzed' as const,
              extracted_data: extractedData,
              confidence_score: 0.85 + Math.random() * 0.14,
            }
          : r
      );
      saveReceipts(updatedReceipts);
      setIsAnalyzing(false);
      return true;
    } catch {
      setIsAnalyzing(false);
      return false;
    }
  }, [scannedReceipts, analyzeReceipt, saveReceipts]);

  // Update extracted data
  const updateExtractedData = useCallback((receiptId: string, data: Partial<ExtractedReceiptData>) => {
    const updated = scannedReceipts.map(r =>
      r.id === receiptId
        ? { ...r, extracted_data: { ...r.extracted_data, ...data } as ExtractedReceiptData }
        : r
    );
    saveReceipts(updated);
  }, [scannedReceipts, saveReceipts]);

  // Mark as saved (converted to actual receipt)
  const markAsSaved = useCallback((receiptId: string) => {
    const updated = scannedReceipts.map(r =>
      r.id === receiptId ? { ...r, status: 'saved' as const } : r
    );
    saveReceipts(updated);
  }, [scannedReceipts, saveReceipts]);

  // Delete scanned receipt
  const deleteScannedReceipt = useCallback((receiptId: string) => {
    const filtered = scannedReceipts.filter(r => r.id !== receiptId);
    saveReceipts(filtered);
  }, [scannedReceipts, saveReceipts]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ScannerSettings>) => {
    const updated = { ...settings, ...newSettings };
    saveSettings(updated);
  }, [settings, saveSettings]);

  // Get statistics
  const getStats = useCallback(() => {
    const pending = scannedReceipts.filter(r => r.status === 'pending').length;
    const analyzed = scannedReceipts.filter(r => r.status === 'analyzed').length;
    const saved = scannedReceipts.filter(r => r.status === 'saved').length;
    const errors = scannedReceipts.filter(r => r.status === 'error').length;
    const avgConfidence = scannedReceipts
      .filter(r => r.confidence_score)
      .reduce((sum, r) => sum + (r.confidence_score || 0), 0) /
      (scannedReceipts.filter(r => r.confidence_score).length || 1);

    return {
      total: scannedReceipts.length,
      pending,
      analyzed,
      saved,
      errors,
      avgConfidence: Math.round(avgConfidence * 100),
    };
  }, [scannedReceipts]);

  return {
    scannedReceipts,
    settings,
    isScanning,
    isAnalyzing,
    cameraStream,
    cameraError,
    videoRef,
    canvasRef,
    loadData,
    startCamera,
    stopCamera,
    captureImage,
    scanReceipt,
    processUploadedImage,
    analyzeExistingReceipt,
    updateExtractedData,
    markAsSaved,
    deleteScannedReceipt,
    updateSettings,
    getStats,
  };
}

function getDefaultSettings(): ScannerSettings {
  return {
    auto_analyze: true,
    auto_save: false,
    default_category: 'Sonstiges',
    preferred_camera: 'environment',
    image_quality: 'high',
    enable_flash: false,
    crop_to_receipt: true,
  };
}
