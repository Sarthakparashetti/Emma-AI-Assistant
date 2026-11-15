import webbrowser
from urllib.parse import quote_plus


WEBSITES = {
    "google": "https://www.google.com",
    "youtube": "https://www.youtube.com",
    "github": "https://github.com",
    "gmail": "https://mail.google.com",
    "linkedin": "https://www.linkedin.com",
    "stackoverflow": "https://stackoverflow.com",
    "reddit": "https://www.reddit.com",
    "chatgpt": "https://chat.openai.com",
}


def open_website(site):

    site = site.lower().strip()

    if site not in WEBSITES:
        return f"Website '{site}' not supported."

    webbrowser.open(WEBSITES[site])

    return f"Opening {site.title()}..."


def google_search(query):

    webbrowser.open(
        f"https://www.google.com/search?q={quote_plus(query)}"
    )

    return f"Searching Google for '{query}'..."


def youtube_search(query):

    webbrowser.open(
        f"https://www.youtube.com/results?search_query={quote_plus(query)}"
    )

    return f"Searching YouTube for '{query}'..."


# =====================================================
# Dispatcher
# =====================================================

def dispatch(action, parsed):

    if action == "website":
        return open_website(parsed["site"])

    if action == "google_search":
        return google_search(parsed["query"])

    if action == "youtube_search":
        return youtube_search(parsed["query"])

    return None