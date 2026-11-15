from dataclasses import dataclass, field
from typing import Any


@dataclass
class Task:
    action: str
    target: str | None = None
    params: dict[str, Any] = field(default_factory=dict)