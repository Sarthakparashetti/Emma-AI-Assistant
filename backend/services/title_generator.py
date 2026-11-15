from services.ai_engine import ask_ai


def generate_chat_title(user_message: str, assistant_reply: str) -> str:
    prompt = f"""
Generate a concise title for this conversation.

Rules:
- Maximum 4 words.
- Return ONLY the title.
- No quotes.
- No punctuation.
- Keep it meaningful.

User:
{user_message}

Assistant:
{assistant_reply}
"""

    title = ask_ai(prompt).strip()

    if (
        not title
        or title.startswith("Sorry")
        or len(title) > 40
    ):
        return user_message[:30]

    return title