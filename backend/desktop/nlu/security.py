def parse_security(text):

    text = text.lower().strip()

    commands = [

        "is this website safe",
        "is this page safe",
        "check this website",
        "check this page",
        "analyze this website",
        "analyse this website",
        "analyze this page",
        "analyse this page",
        "detect phishing",
        "scan website",
        "scan this website",
        "scan this page",
        "check phishing",
        "is this phishing",
        "is this a scam",
        "is this malicious",

    ]

    if text in commands:

        return {
            "intent": "security_action",
            "action": "scan",
            "entities": {}
        }

    return None