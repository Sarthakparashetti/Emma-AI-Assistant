import re


# Words that add politeness but don't change intent
FILLER_WORDS = [
    "please",
    "kindly",
    "could you",
    "can you",
    "would you",
    "will you",
    "for me",
    "i want to",
    "i'd like to",
    "i would like to",
    "help me",
    "hey emma",
    "emma",
]


def normalize_text(text: str) -> str:
    """
    Normalize user input before intent parsing.
    """

    if not text:
        return ""

    text = text.lower().strip()

    # Remove filler words
    for phrase in sorted(FILLER_WORDS, key=len, reverse=True):
        text = re.sub(rf"\b{re.escape(phrase)}\b", " ", text)

    # Remove punctuation
    text = re.sub(r"[^\w\s.-]", " ", text)

    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()

def contains_any(text: str, words: list[str]) -> bool:
    text = text.lower()
    return any(word in text for word in words)


def first_match(text: str, words: list[str]):
    text = text.lower()

    for word in words:
        if word in text:
            return word

    return None


def remove_words(text: str, words: list[str]) -> str:
    text = text.lower()

    for word in sorted(words, key=len, reverse=True):
        text = text.replace(word, " ")

    return " ".join(text.split())