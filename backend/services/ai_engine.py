from google import genai
from config import GEMINI_API_KEY
import traceback

client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are Emma, a friendly desktop AI assistant.

You remember previous messages in the conversation.

Answer naturally and concisely.
"""


def ask_ai(prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=[
                SYSTEM_PROMPT,
                prompt,
            ],
        )

        if response.text:
            return response.text.strip()

        return "I couldn't generate a response."

    except Exception:
        print("\n" + "=" * 80)
        print("EMMA AI ERROR")
        traceback.print_exc()
        print("=" * 80 + "\n")

        return "Sorry, I'm having trouble reaching my AI brain."