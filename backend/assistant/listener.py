import speech_recognition as sr

recognizer = sr.Recognizer()
recognizer.dynamic_energy_threshold = True
recognizer.pause_threshold = 0.8
recognizer.energy_threshold = 300


mic = sr.Microphone()

with mic as source:
    recognizer.adjust_for_ambient_noise(source, duration=1)


def listen():

    try:

        with mic as source:

            print("Listening...")

            audio = recognizer.listen(
                source,
                timeout=None,
                phrase_time_limit=6
            )

        text = recognizer.recognize_google(audio)

        print("You:", text)

        return text.lower()

    except sr.UnknownValueError:
        return ""

    except sr.RequestError:
        return ""

    except Exception:
        return ""