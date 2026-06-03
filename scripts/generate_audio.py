#!/usr/bin/env python3
"""
Generates minimal valid silent MP3 placeholder files for LinGrind ambient sounds.
Replace these with real ambient sounds from freesound.org for the best experience.
"""
import os
import struct

# Minimal valid MP3 frame (128kbps, 44100Hz, stereo, silent)
# ID3v2 header + one silent MPEG frame
ID3_HEADER = bytes([
    0x49, 0x44, 0x33,  # "ID3"
    0x03, 0x00,         # version 2.3.0
    0x00,               # flags
    0x00, 0x00, 0x00, 0x0A,  # size: 10 bytes
    # COMM frame with title
    0x54, 0x49, 0x54, 0x32,  # "TIT2"
    0x00, 0x00, 0x00, 0x01,  # size: 1 byte
    0x00, 0x00,              # flags
    0x00,                    # encoding: ISO-8859-1
])

# Silent MPEG1 Layer3 frame header (128kbps, 44100Hz, stereo)
SILENT_MP3_FRAME = bytes([
    0xFF, 0xFB, 0x90, 0x00,  # frame sync + header
] + [0x00] * 413)  # 417 bytes total for this bitrate

def create_silent_mp3(path: str, title: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(ID3_HEADER)
        # Write several frames to make a ~1s file that loops cleanly
        for _ in range(40):
            f.write(SILENT_MP3_FRAME)
    print(f"Created placeholder: {path}")

if __name__ == "__main__":
    base = os.path.join(os.path.dirname(__file__), "..", "public", "sounds")
    create_silent_mp3(os.path.join(base, "cafe.mp3"), "Cafe Ambience")
    create_silent_mp3(os.path.join(base, "airport.mp3"), "Airport Ambience")
    print("\nPlaceholder audio files created.")
    print("For a better experience, replace them with real ambient sounds from:")
    print("  https://freesound.org  — search 'coffee shop ambience' or 'airport terminal'")
    print("  https://pixabay.com/sound-effects/")
