"""
app.py — Entry point for the AV interview engine.

All logic lives in av_service.py.
This file exists so Node.js can spawn a stable, predictable target:
    python app.py
"""

from av_service import run_interview

if __name__ == "__main__":
    run_interview()