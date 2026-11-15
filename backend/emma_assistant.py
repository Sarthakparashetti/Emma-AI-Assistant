from uuid import uuid4
import time

from assistant.listener import listen
from assistant.speaker import speak
from assistant.overlay import start_overlay, show, hide, set_chat_id
import assistant.tray as tray

from services.command_engine import execute_command


WAKE_WORD = "emma"
CHAT_ID = str(uuid4())


def main():

    # Start Overlay
    start_overlay()
    set_chat_id(CHAT_ID)

    # Start System Tray
    tray.start_tray()

    time.sleep(1)

    speak("Emma is online.")

    while tray.running:

        try:

            show("🎤 Listening...", state="listening")

            text = listen()

            hide()

            if not text:
                continue

            text = text.lower().strip()

            if not text.startswith(WAKE_WORD):
                continue

            command = text.replace(WAKE_WORD, "", 1).strip()

            if command == "":

                show("🙂 Yes?", state="speaking")

                speak("Yes?")

                time.sleep(1)

                hide()

                continue

            print(f"Command: {command}")

            show(f"⚡ {command}", state="thinking")

            response = execute_command(CHAT_ID, command)

            if response is None:

                message = "Done."

            elif isinstance(response, dict):

                if "response" in response:
                    message = str(response["response"])

                elif "message" in response:
                    message = str(response["message"])

                else:
                    message = "Done."

            else:

                message = str(response)

            print("Emma:", message)

            show(message, state="speaking")

            speak(message)

            time.sleep(2)

            hide()

        except KeyboardInterrupt:

            print("Emma stopped.")

            hide()

            speak("Goodbye.")

            break

        except Exception as e:

            print("ERROR:", e)

            show("❌ Something went wrong")

            speak("Sorry, something went wrong.")

            time.sleep(2)

            hide()

    hide()

    speak("Emma has been closed.")


if __name__ == "__main__":
    main()