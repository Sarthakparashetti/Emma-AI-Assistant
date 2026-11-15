import re


def parse_file(text: str):

    text = text.strip().lower()

    patterns = [

        (r"create folder (.+)", "create_folder", "name"),

        (r"create file (.+)", "create_file", "name"),

        (r"delete file (.+)", "delete_file", "name"),

        (r"search file (.+)", "search_file", "name"),
    ]

    for pattern, action, field in patterns:

        match = re.fullmatch(pattern, text)

        if match:

            return {
                "intent": "file_action",
                "action": action,
                "entities": {
                    field: match.group(1).strip()
                }
            }

    match = re.fullmatch(r"rename (.+) to (.+)", text)

    if match:

        return {
            "intent": "file_action",
            "action": "rename_file",
            "entities": {
                "old": match.group(1).strip(),
                "new": match.group(2).strip(),
            }
        }

    match = re.fullmatch(
        r"move (.+) to (desktop|documents|downloads|pictures|music|videos)",
        text
    )

    if match:

        return {
            "intent": "file_action",
            "action": "move_file",
            "entities": {
                "name": match.group(1).strip(),
                "destination": match.group(2).strip(),
            }
        }

    match = re.fullmatch(
        r"copy (.+) to (desktop|documents|downloads|pictures|music|videos)",
        text
    )

    if match:

        return {
            "intent": "file_action",
            "action": "copy_file",
            "entities": {
                "name": match.group(1).strip(),
                "destination": match.group(2).strip(),
            }
        }

    return None