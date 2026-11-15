def parse_ocr(text: str):

    text = text.strip().lower()

    commands = [

        "read my screen",

        "read screen",

        "read screenshot",

        "extract text",

        "extract text from screen",

        "extract text from screenshot",

        "ocr",

    ]

    if text in commands:

        return {

            "intent": "ocr_action",

            "action": "read",

            "entities": {}

        }

    return None