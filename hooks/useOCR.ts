import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { parsePrescription, type ParsedMedication } from '@utils/ocrParser';

interface OCRState {
  isProcessing: boolean;
  medications: ParsedMedication[] | null;
  error: string | null;
}

// expo-text-extractor is a native module installed via:
//   npx expo install expo-text-extractor
// It is lazily required so the app does not crash if the native module
// is not yet linked (e.g. running in plain Expo Go without a dev build).
function getExtractor(): {
  extractTextFromImage: (uri: string) => Promise<string[]>;
  isSupported: boolean;
} | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-text-extractor');
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

    const extractor = getExtractor();
    if (!extractor) {
      setState({
        isProcessing: false,
        medications: null,
        error: 'OCR module not available. Please use a development build.',
      });
      return;
    }

    if (!extractor.isSupported) {
      setState({
        isProcessing: false,
        medications: null,
        error: 'OCR not supported on this device.',
      });
      return;
    }

    try {
      const lines = await extractor.extractTextFromImage(imageUri);
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
