"""
Emma AI OS — Floating Assistant Overlay

Always-on-top desktop widget that visualizes Emma's current state
(idle / listening / thinking / speaking) as a glowing AI core, inspired
by the same neon-cyan glassmorphism language used in the web dashboard.

Public API is unchanged from the previous version so nothing that imports
this module needs to change:

    start_overlay()        -> boots the overlay on a background thread
    show(message)           -> reveals the widget with a message
    hide()                   -> hides the widget

New, additive API (safe to ignore if you don't need it):

    set_state(state)                 -> "idle" | "listening" | "thinking" | "speaking"
    show(message, state=None)        -> now optionally accepts a state
    set_chat_id(chat_id)             -> lets the expanded panel pull real conversation history
"""

import math
import random
import threading
import tkinter as tk

import customtkinter as ctk

try:
    import win32gui

    _HAS_WIN32 = True
except ImportError:
    _HAS_WIN32 = False

ctk.set_appearance_mode("dark")

# ---------------------------------------------------------------------------
# Design tokens — mirrors src/index.css in the web frontend
# ---------------------------------------------------------------------------

COLOR_BG = "#0f1115"
COLOR_PANEL = "#161a20"
COLOR_PANEL_RAISED = "#1b212a"
COLOR_CYAN = "#00e5c4"
COLOR_AQUA = "#00ffd5"
COLOR_BLUE = "#4cc9f0"
COLOR_TEXT = "#eafffb"
COLOR_MUTED = "#6d8386"
COLOR_BORDER = "#22303a"

STATE_ACCENT = {
    "idle": COLOR_CYAN,
    "listening": COLOR_AQUA,
    "thinking": COLOR_BLUE,
    "speaking": COLOR_AQUA,
}

STATE_LABEL = {
    "idle": "Standing by",
    "listening": "Listening",
    "thinking": "Thinking",
    "speaking": "Speaking",
}

SUGGESTIONS = [
    "\"Emma, open Chrome\"",
    "\"Emma, what's my CPU usage?\"",
    "\"Emma, refresh apps\"",
    "\"Emma, remember my name is...\"",
]

ACTIVE_MODULES = [
    "Voice Recognition",
    "Text Command Router",
    "AI Planner + Executor",
    "Memory Engine",
]

MINI_SIZE = 96
PANEL_SIZE = (360, 500)
FRAME_MS = 33  # ~30fps


def _blend(hex_a: str, hex_b: str, t: float) -> str:
    """Linearly blend two hex colors. t=0 -> hex_a, t=1 -> hex_b."""

    t = max(0.0, min(1.0, t))

    a = tuple(int(hex_a[i : i + 2], 16) for i in (1, 3, 5))
    b = tuple(int(hex_b[i : i + 2], 16) for i in (1, 3, 5))

    mixed = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

    return f"#{mixed[0]:02x}{mixed[1]:02x}{mixed[2]:02x}"


class AIOrbOverlay:
    """Floating, always-on-top AI core widget with a minimized orb and an
    expandable full assistant panel."""

    def __init__(self):
        self.window = None
        self.canvas = None
        self.message_var = None
        self.status_var = None

        self.state = "idle"
        self.message = "Emma"
        self.expanded = False
        self.visible = False

        self.chat_id = None

        self._phase = 0.0
        self._particles = []
        self._dust = self._make_dust(26)

    @staticmethod
    def _make_dust(count: int):
        rng = random.Random(7)
        return [
            {
                "angle": rng.uniform(0, 2 * math.pi),
                "radius": math.sqrt(rng.uniform(0, 1)),
                "size": rng.uniform(0.6, 1.8),
                "phase_offset": rng.uniform(0, 6.28),
            }
            for _ in range(count)
        ]

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def run(self):
        self.window = ctk.CTk()
        self.window.overrideredirect(True)
        self.window.attributes("-topmost", True)

        try:
            self.window.wm_attributes("-transparentcolor", "")
        except tk.TclError:
            pass

        self.window.configure(fg_color=COLOR_BG)

        self._position_minimized()

        self.canvas = tk.Canvas(
            self.window,
            bg=COLOR_BG,
            highlightthickness=0,
        )
        self.canvas.pack(fill="both", expand=True)
        self.canvas.bind("<Button-1>", lambda _e: self.toggle_expand())

        self._particles = [
            {
                "angle": (i / 7) * 2 * math.pi,
                "radius": 34 + (i % 3) * 6,
                "speed": 0.015 + 0.004 * i,
            }
            for i in range(7)
        ]

        self.window.withdraw()
        self._tick()
        self.window.mainloop()

    def _tick(self):
        self._phase += 1

        if self.visible and self.canvas is not None:
            if self.expanded:
                self._draw_panel()
            else:
                self._draw_mini_orb()

        if self.window is not None:
            self.window.after(FRAME_MS, self._tick)

    # ------------------------------------------------------------------
    # Public control surface
    # ------------------------------------------------------------------

    def show(self, message: str, state: str | None = None):
        self.message = message

        if state:
            self.state = state

        if self.window is None:
            return

        self.visible = True
        self.window.deiconify()
        self.window.update_idletasks()

        size = PANEL_SIZE if self.expanded else (MINI_SIZE, MINI_SIZE)
        self._apply_window_shape(size[0], size[1], circular=not self.expanded)

    def hide(self):
        self.visible = False

        if self.window is None:
            return

        self.window.withdraw()

    def set_state(self, state: str):
        if state in STATE_ACCENT:
            self.state = state

    def set_chat_id(self, chat_id: str):
        self.chat_id = chat_id

    def toggle_expand(self):
        self.expanded = not self.expanded

        if self.expanded:
            self._position_panel()
        else:
            self._position_minimized()

    # ------------------------------------------------------------------
    # Layout helpers
    # ------------------------------------------------------------------

    def _position_minimized(self):
        if self.window is None:
            return

        sw = self.window.winfo_screenwidth()
        sh = self.window.winfo_screenheight()

        x = sw - MINI_SIZE - 28
        y = sh - MINI_SIZE - 64

        self.window.geometry(f"{MINI_SIZE}x{MINI_SIZE}+{x}+{y}")
        self._apply_window_shape(MINI_SIZE, MINI_SIZE, circular=True)

    def _position_panel(self):
        if self.window is None:
            return

        sw = self.window.winfo_screenwidth()
        sh = self.window.winfo_screenheight()

        w, h = PANEL_SIZE
        x = sw - w - 28
        y = sh - h - 64

        self.window.geometry(f"{w}x{h}+{x}+{y}")
        self._apply_window_shape(w, h, circular=False)

    def _apply_window_shape(self, width: int, height: int, circular: bool):
        """
        Clips the real OS window to a circle (minimized orb) or a rounded
        rectangle (expanded panel), so the widget actually reads as a
        floating orb instead of a dark square with a circle drawn inside
        it. Windows-only (uses pywin32, already a project dependency);
        no-ops harmlessly elsewhere.
        """

        if not _HAS_WIN32 or self.window is None:
            return

        try:
            self.window.update_idletasks()
            hwnd = self.window.winfo_id()

            if circular:
                region = win32gui.CreateEllipticRgn(0, 0, width, height)
            else:
                radius = 20
                region = win32gui.CreateRoundRectRgn(
                    0, 0, width + 1, height + 1, radius, radius
                )

            win32gui.SetWindowRgn(hwnd, region, True)
        except Exception:
            # Never let a cosmetic window-shape call take down the assistant
            pass

    # ------------------------------------------------------------------
    # Rendering — minimized floating orb
    # ------------------------------------------------------------------

    def _draw_mini_orb(self):
        c = self.canvas
        c.delete("all")

        cx, cy = MINI_SIZE / 2, MINI_SIZE / 2
        accent = STATE_ACCENT[self.state]
        pulse = (math.sin(self._phase * 0.08) + 1) / 2  # 0..1
        core_r = 27

        self._draw_ai_core(cx, cy, core_r, accent, pulse, dust_scale=1.0)

        if self.state == "listening":
            self._draw_waveform(cx, cy, accent, scale=0.7)
        elif self.state == "thinking":
            self._draw_orbit_dots(cx, cy, accent, radius=15)
        else:
            r = 7 + pulse * 3.5
            c.create_oval(cx - r, cy - r, cx + r, cy + r, fill=accent, outline="")

    def _draw_ai_core(self, cx, cy, core_r, accent, pulse, dust_scale=1.0):
        """Shared AI-core visual: ambient glow, layered depth rings, a
        glass sphere with a dense twinkling particle field, and a soft
        sheen highlight — the same visual language as the web dashboard's
        AICore.tsx."""

        c = self.canvas

        # Ambient outer glow (blended rings simulate a soft halo)
        for i, t in enumerate([0.85, 0.6, 0.35]):
            r = core_r + 4 + i * 6 + pulse * 3
            color = _blend(COLOR_BG, accent, t * 0.45)
            c.create_oval(cx - r, cy - r, cx + r, cy + r, outline=color, width=1)

        # Static layered depth rings, closer to the core
        for i, frac in enumerate([1.35, 1.55]):
            r = core_r * frac
            color = _blend(COLOR_BG, accent, 0.3 - i * 0.08)
            c.create_oval(cx - r, cy - r, cx + r, cy + r, outline=color, width=1)

        # Glass sphere fill (approx radial gradient via nested ovals)
        for i, frac in enumerate([1.0, 0.75, 0.5]):
            r = core_r * frac
            color = _blend(COLOR_PANEL_RAISED, accent, 0.12 + i * 0.04)
            c.create_oval(
                cx - r, cy - r, cx + r, cy + r,
                fill=color, outline=accent if i == 0 else "", width=2,
            )

        # Dense twinkling particle field
        for p in self._dust:
            twinkle = (math.sin(self._phase * 0.05 + p["phase_offset"]) + 1) / 2
            radius = p["radius"] * core_r * 0.82 * dust_scale
            x = cx + math.cos(p["angle"]) * radius
            y = cy + math.sin(p["angle"]) * radius

            color = _blend(COLOR_PANEL_RAISED, accent, 0.3 + twinkle * 0.6)
            size = p["size"] * dust_scale

            c.create_oval(x - size, y - size, x + size, y + size, fill=color, outline="")

        # Soft sheen highlight (top-left glass reflection)
        sheen_r = core_r * 0.4
        sheen_x, sheen_y = cx - core_r * 0.28, cy - core_r * 0.32
        sheen_color = _blend(COLOR_PANEL_RAISED, "#ffffff", 0.18)
        c.create_oval(
            sheen_x - sheen_r, sheen_y - sheen_r * 0.7,
            sheen_x + sheen_r, sheen_y + sheen_r * 0.7,
            fill=sheen_color, outline="",
        )

    # ------------------------------------------------------------------
    # Rendering — expanded assistant panel
    # ------------------------------------------------------------------

    def _draw_panel(self):
        c = self.canvas
        c.delete("all")

        w, h = PANEL_SIZE
        accent = STATE_ACCENT[self.state]

        c.create_rectangle(0, 0, w, h, fill=COLOR_PANEL, outline="")
        c.create_rectangle(0, 0, w, 3, fill=accent, outline="")

        # ---- Header: AI core + status ----
        cx, cy = 46, 56
        pulse = (math.sin(self._phase * 0.08) + 1) / 2
        core_r = 14

        self._draw_ai_core(cx, cy, core_r, accent, pulse, dust_scale=0.75)

        if self.state == "listening":
            self._draw_waveform(cx, cy, accent, scale=0.5)
        elif self.state == "thinking":
            self._draw_orbit_dots(cx, cy, accent, radius=10)
        else:
            r = 4 + pulse * 2.5
            c.create_oval(cx - r, cy - r, cx + r, cy + r, fill=accent, outline="")

        c.create_text(
            80, 42, anchor="w", text="EMMA", fill=COLOR_TEXT,
            font=("Segoe UI", 15, "bold"),
        )
        c.create_text(
            80, 64, anchor="w", text=STATE_LABEL[self.state], fill=accent,
            font=("Segoe UI", 10, "bold"),
        )

        # Minimize control
        c.create_text(
            w - 22, 24, text="—", fill=COLOR_MUTED, font=("Segoe UI", 14, "bold"),
        )

        c.create_line(16, 92, w - 16, 92, fill=COLOR_BORDER)

        # ---- Current message ----
        c.create_text(
            16, 108, anchor="nw", width=w - 32, justify="left",
            text=self.message, fill=COLOR_TEXT, font=("Segoe UI", 11),
        )

        # ---- Conversation history ----
        y = 160
        c.create_text(
            16, y, anchor="nw", text="RECENT CONVERSATION", fill=COLOR_MUTED,
            font=("Segoe UI", 8, "bold"),
        )
        y += 18

        history = self._recent_history()

        if not history:
            c.create_text(
                16, y, anchor="nw", text="No conversation yet.",
                fill=COLOR_MUTED, font=("Segoe UI", 9, "italic"),
            )
            y += 20
        else:
            for item in history:
                role = item.get("role", "")
                content = item.get("content", "")
                prefix = "You: " if role.lower().startswith("user") else "Emma: "
                line = (prefix + content)[:70]

                c.create_text(
                    16, y, anchor="nw", width=w - 32,
                    text=line, fill=COLOR_TEXT if prefix == "Emma: " else COLOR_MUTED,
                    font=("Segoe UI", 9),
                )
                y += 20

        y += 6
        c.create_line(16, y, w - 16, y, fill=COLOR_BORDER)
        y += 12

        # ---- Command suggestions ----
        c.create_text(
            16, y, anchor="nw", text="TRY SAYING", fill=COLOR_MUTED,
            font=("Segoe UI", 8, "bold"),
        )
        y += 18

        for suggestion in SUGGESTIONS:
            c.create_text(
                16, y, anchor="nw", text=suggestion, fill=COLOR_BLUE,
                font=("Segoe UI", 9),
            )
            y += 18

        y += 8
        c.create_line(16, y, w - 16, y, fill=COLOR_BORDER)
        y += 12

        # ---- Active modules ----
        c.create_text(
            16, y, anchor="nw", text="ACTIVE MODULES", fill=COLOR_MUTED,
            font=("Segoe UI", 8, "bold"),
        )
        y += 18

        for module in ACTIVE_MODULES:
            c.create_oval(16, y + 4, 22, y + 10, fill=COLOR_CYAN, outline="")
            c.create_text(
                30, y, anchor="nw", text=module, fill=COLOR_TEXT,
                font=("Segoe UI", 9),
            )
            y += 18

    # ------------------------------------------------------------------
    # Shared drawing primitives
    # ------------------------------------------------------------------

    def _draw_waveform(self, cx, cy, color, scale=1.0):
        bars = 5
        gap = 6 * scale

        for i in range(bars):
            offset = (i - bars // 2) * gap
            phase = self._phase * 0.25 + i * 0.9
            height = (math.sin(phase) * 0.5 + 0.5) * 16 * scale + 3

            self.canvas.create_line(
                cx + offset, cy + height / 2,
                cx + offset, cy - height / 2,
                fill=color, width=max(1, int(3 * scale)), capstyle="round",
            )

    def _draw_orbit_dots(self, cx, cy, color, radius):
        for particle in self._particles[:5]:
            particle["angle"] += particle["speed"] * 2
            x = cx + math.cos(particle["angle"]) * radius
            y = cy + math.sin(particle["angle"]) * radius

            self.canvas.create_oval(
                x - 2, y - 2, x + 2, y + 2, fill=color, outline="",
            )

    def _recent_history(self, limit: int = 4):
        if not self.chat_id:
            return []

        try:
            from services.memory_manager import get_history

            return get_history(self.chat_id)[-limit:]
        except Exception:
            return []


# ---------------------------------------------------------------------------
# Module-level singleton + backward-compatible functional API
# ---------------------------------------------------------------------------

_overlay = AIOrbOverlay()


def start_overlay():
    threading.Thread(target=_overlay.run, daemon=True).start()


def show(message: str, state: str | None = None):
    _overlay.show(message, state=state)


def hide():
    _overlay.hide()


def set_state(state: str):
    _overlay.set_state(state)


def set_chat_id(chat_id: str):
    _overlay.set_chat_id(chat_id)
