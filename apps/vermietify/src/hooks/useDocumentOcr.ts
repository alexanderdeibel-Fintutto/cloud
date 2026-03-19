import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OcrResult {
  text: string;
  words: Array<{
    text: string;
    bounds: Array<{ x: number; y: number }>;
  }>;
  pages: Array<{
    width: number;
    height: number;
    blocks: Array<{
      type: string;
      confidence: number;
      text: string;
    }>;
  }>;
  detectedLanguages: Array<{
    languageCode: string;
    confidence: number;
  }>;
  confidence: number | null;
}

type OcrFeature = "TEXT_DETECTION" | "DOCUMENT_TEXT_DETECTION";

export function useDocumentOcr() {
  const [result, setResult] = useState<OcrResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (
    file: File,
    options: { features?: OcrFeature[]; languageHints?: string[] } = {}
  ): Promise<OcrResult | null> => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      const { data, error: fnError } = await supabase.functions.invoke("analyze-document", {
        body: {
          image: base64,
          features: options.features || ["DOCUMENT_TEXT_DETECTION"],
          languageHints: options.languageHints || ["de"],
        },
      });

      if (fnError) throw fnError;

      setResult(data);
      return data as OcrResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "OCR fehlgeschlagen";
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { processImage, result, isProcessing, error, reset };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
