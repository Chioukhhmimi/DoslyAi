import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { parsePrescription, type ParsedMedication } from '@utils/ocrParser';

interface OCRState {
  isProcessing: boolean;
  medications: ParsedMedication[] | null;
  error: string | null;
}

type MlkitBlock = { text: string; lines: Array<{ text: string }> };

function getMlkitOcr(): { detectFromUri: (uri: string) => Promise<MlkitBlock[]> } | null {
  try {
    // rn-mlkit-ocr ships a default export; some bundlers expose it differently
    const mod = require('rn-mlkit-ocr');
    return mod?.default ?? mod;
  } catch {
    return null;
  }
}

export function useOCR() {
  const [state, setState] = useState<OCRState>({
    isProcessing: false,
    medications: null,
    error: null,
  });

  const runOCR = useCallback(async (imageUri: string) => {
    setState({ isProcessing: true, medications: null, error: null });

    const MlkitOcr = getMlkitOcr();
    if (!MlkitOcr) {
      setState({
        isProcessing: false,
        medications: null,
        error: 'OCR module not available. Please use a development build.',
      });
      return;
    }

    try {
      const blocks = await MlkitOcr.detectFromUri(imageUri);
      const lines = blocks.flatMap((b) => b.lines.map((l) => l.text));
      const medications = parsePrescription(lines);
      setState({ isProcessing: false, medications, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR failed';
      setState({ isProcessing: false, medications: null, error: message });
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setState((s) => ({ ...s, error: 'Permission galerie refusée.' }));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      await runOCR(result.assets[0].uri);
    }
  }, [runOCR]);

  const reset = useCallback(() => {
    setState({ isProcessing: false, medications: null, error: null });
  }, []);

  return { ...state, runOCR, pickFromGallery, reset };
}
