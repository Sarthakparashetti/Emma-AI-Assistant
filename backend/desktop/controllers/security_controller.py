from services.security_engine import analyze_security


def scan_website():
    return analyze_security()


def dispatch(action, entities):

    if action == "scan":
        return scan_website()

    return None