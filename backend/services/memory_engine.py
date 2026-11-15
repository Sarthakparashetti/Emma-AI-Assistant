import re


def normalize_key(text: str) -> str:
    text = text.lower().strip()

    text = (
        text.replace("favourite", "favorite")
            .replace("colour", "color")
    )

    text = re.sub(r"[^a-z0-9 ]", "", text)

    text = text.replace(" ", "_")

    return text


def extract_memory(message: str):

    patterns = [

        r"my (.+?) is (.+)",

        r"my (.+?) are (.+)",

        r"i live in (.+)",

        r"i am from (.+)",

    ]

    msg = message.strip()

    # my laptop is Dell
    # my favourite IDE is VS Code

    m = re.search(patterns[0], msg, re.IGNORECASE)

    if m:

        key = normalize_key(m.group(1))
        value = m.group(2).strip()

        return key, value

    # my hobbies are ...

    m = re.search(patterns[1], msg, re.IGNORECASE)

    if m:

        key = normalize_key(m.group(1))

        value = m.group(2).strip()

        return key, value

    # i live in Pune

    m = re.search(patterns[2], msg, re.IGNORECASE)

    if m:

        return "city", m.group(1).strip()

    # i am from Mumbai

    m = re.search(patterns[3], msg, re.IGNORECASE)

    if m:

        return "hometown", m.group(1).strip()

    return None


def detect_memory_question(message: str):

    msg = message.lower().strip()

    if msg == "who am i":
        return "name"

    m = re.search(r"what is my (.+)", msg)

    if m:

        key = normalize_key(m.group(1))

        return key

    m = re.search(r"where do i live", msg)

    if m:
        return "city"

    m = re.search(r"where am i from", msg)

    if m:
        return "hometown"

    return None