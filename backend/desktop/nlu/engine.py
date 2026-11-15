from desktop.nlu.common import normalize_text

from desktop.nlu.browser import parse_browser
from desktop.nlu.system import parse_system
from desktop.nlu.file import parse_file
from desktop.nlu.window import parse_window
from desktop.nlu.app import parse_app
from desktop.nlu.media import parse_media
from desktop.nlu.screenshot import parse_screenshot
from desktop.nlu.ocr import parse_ocr
from desktop.nlu.vision import parse_vision
from desktop.nlu.security import parse_security


from desktop.nlu.preprocessor import preprocess_text


PARSERS = [

    parse_browser,

    parse_system,

    parse_file,

    parse_window,

    parse_app,

    parse_media,

    parse_screenshot,

    parse_ocr,

    parse_vision,

    parse_security,

]


def parse(text: str):

    text = normalize_text(text)
    text = preprocess_text(text)

    for parser in PARSERS:

        result = parser(text)

        if result is not None:
            return result

    return None