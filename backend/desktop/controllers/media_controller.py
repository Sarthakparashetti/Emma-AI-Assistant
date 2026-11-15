import keyboard


# =====================================================
# Media Keys
# =====================================================

def play_pause():
    keyboard.send("play/pause media")
    return "Toggled play/pause."


def next_track():
    keyboard.send("next track")
    return "Playing next track."


def previous_track():
    keyboard.send("previous track")
    return "Playing previous track."


def mute():
    keyboard.send("volume mute")
    return "Audio muted/unmuted."


# =====================================================
# Dispatcher
# =====================================================

def dispatch(action, entities):

    if action == "play_pause":
        return play_pause()

    if action == "next":
        return next_track()

    if action == "previous":
        return previous_track()

    if action == "mute":
        return mute()

    if action == "unmute":
        return mute()

    return None