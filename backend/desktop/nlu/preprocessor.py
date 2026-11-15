import re


PHRASES = [

    # Greetings / Assistant name
    "hey emma",
    "hi emma",
    "hello emma",
    "emma",

    # Politeness
    "would you please",
    "would you mind",
    "could you",
    "can you",
    "would you",
    "please",
    "can u",
    "could u",

    # Extra filler
    "for me",
    "me",
    "just",
    "kindly",
]


VERBS = {

    "opening": "open",
    "opens": "open",
    "opened": "open",

    "launching": "launch",
    "launches": "launch",
    "launched": "launch",

    "starting": "start",
    "starts": "start",
    "started": "start",

    "running": "run",
    "runs": "run",

    "closing": "close",
    "closes": "close",
    "closed": "close",

    "minimizing": "minimize",
    "minimizes": "minimize",
    "minimized": "minimize",

    "maximizing": "maximize",
    "maximizes": "maximize",
    "maximized": "maximize",

    "restoring": "restore",
    "restores": "restore",
    "restored": "restore",

    "switching": "switch",
    "switches": "switch",
    "switched": "switch",

    "searching": "search",
    "searches": "search",
    "searched": "search",

    "creating": "create",
    "creates": "create",
    "created": "create",

    "deleting": "delete",
    "deletes": "delete",
    "deleted": "delete",

    "renaming": "rename",
    "renames": "rename",
    "renamed": "rename",

    "moving": "move",
    "moves": "move",
    "moved": "move",

    "copying": "copy",
    "copies": "copy",
    "copied": "copy",
}


def preprocess_text(text: str) -> str:

    text = text.lower().strip()

    # Remove filler phrases
    for phrase in sorted(PHRASES, key=len, reverse=True):

        text = re.sub(
            rf"\b{re.escape(phrase)}\b",
            " ",
            text
        )

    # Normalize spaces
    text = re.sub(r"\s+", " ", text).strip()

    # Normalize verb forms
    normalized = []

    for word in text.split():
        normalized.append(VERBS.get(word, word))

    return " ".join(normalized)