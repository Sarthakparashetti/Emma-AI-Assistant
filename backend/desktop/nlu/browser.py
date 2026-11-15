import re

WEBSITES = [
    "google",
    "youtube",
    "github",
    "gmail",
    "linkedin",
    "stackoverflow",
    "reddit",
    "chatgpt",
]


def parse_browser(text: str):

    text = text.strip().lower()

    match = re.fullmatch(r"search google for (.+)", text)

    if match:
        return {
            "intent": "browser_action",
            "action": "google_search",
            "entities": {
                "query": match.group(1).strip()
            }
        }

    match = re.fullmatch(r"search youtube for (.+)", text)

    if match:
        return {
            "intent": "browser_action",
            "action": "youtube_search",
            "entities": {
                "query": match.group(1).strip()
            }
        }

    for site in WEBSITES:

        if text == f"open {site}":

            return {
                "intent": "browser_action",
                "action": "website",
                "entities": {
                    "site": site
                }
            }

    return None