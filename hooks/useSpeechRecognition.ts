import { useRef, useCallback } from "react";

type UseSpeechRecognitionProps = {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
};

export function useSpeechRecognition({
  onResult,
  onError,
}: UseSpeechRecognitionProps) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";        // Indian English
    recognition.interimResults = false; // Only final result
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      onError?.(event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  return { startListening, stopListening };
}