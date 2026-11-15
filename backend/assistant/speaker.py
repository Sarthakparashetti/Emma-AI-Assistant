import pyttsx3

engine = pyttsx3.init()

voices = engine.getProperty("voices")

# Try to select a female voice
for voice in voices:
    name = voice.name.lower()
    if "zira" in name or "female" in name or "hazel" in name:
        engine.setProperty("voice", voice.id)
        break

engine.setProperty("rate", 180)
engine.setProperty("volume", 1.0)


def speak(text: str):
    print(f"Emma: {text}")
    engine.say(text)
    engine.runAndWait()