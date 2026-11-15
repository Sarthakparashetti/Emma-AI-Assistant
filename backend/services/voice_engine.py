import speech_recognition as sr
import traceback


def listen():
    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("Listening...")
            recognizer.adjust_for_ambient_noise(source, duration=1)
            audio = recognizer.listen(source, timeout=10)

        text = recognizer.recognize_google(audio)

        return {
            "success": True,
            "text": text
        }

    except Exception:
        return {
            "success": False,
            "text": traceback.format_exc()
        }