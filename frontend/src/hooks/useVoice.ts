import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function useVoice(
  onResult: (text: string) => void
) {
  const recognitionRef = useRef<any>(null);

  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = true;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Listening...");
      setListening(true);
    };

    recognition.onend = () => {
      console.log("🛑 Stopped");
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      console.log(event.error);
      setListening(false);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      transcript = transcript.trim();

      console.log("Transcript:", transcript);

      if (transcript.length > 0) {
        onResult(transcript);

        recognition.stop();
      }
    };

    recognitionRef.current = recognition;
  }, [onResult]);

  function startListening() {
    if (!recognitionRef.current) return;

    recognitionRef.current.start();
  }

  function stopListening() {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
  }

  return {
    listening,
    startListening,
    stopListening,
  };
}