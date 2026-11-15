def parse_media(text: str):

    text = text.strip().lower()

    if text in [
        "play",
        "play music",
        "pause",
        "pause music",
        "resume",
        "resume music",
    ]:
        return {
            "intent": "media_action",
            "action": "play_pause",
            "entities": {}
        }

    if text in [
        "next",
        "next song",
        "next track",
        "skip",
    ]:
        return {
            "intent": "media_action",
            "action": "next",
            "entities": {}
        }

    if text in [
        "previous",
        "previous song",
        "previous track",
        "last song",
    ]:
        return {
            "intent": "media_action",
            "action": "previous",
            "entities": {}
        }

    if text in [
        "mute",
        "mute sound",
        "mute audio",
        "mute volume",
        "unmute",
        "unmute sound",
        "unmute volume",
    ]:
        return {
            "intent": "media_action",
            "action": "mute",
            "entities": {}
        }

    return None