import cv2
import mediapipe as mp
import numpy as np
import math
import whisper
import librosa
import sounddevice as sd
import soundfile as sf
import threading
import queue
import warnings
import json
import os
import time
from collections import deque

warnings.filterwarnings("ignore")

# ── PATHS ─────────────────────────────────────────────
_HERE          = os.path.dirname(os.path.abspath(__file__))
STOP_FLAG      = os.path.join(_HERE, "stop.flag")
RESULT_JSON    = os.path.join(_HERE, "result.json")
AUDIO_FILENAME = os.path.join(_HERE, "live_interview.wav")
SAMPLE_RATE    = 44100

_whisper_model = None
_face_mesh     = None


# ── LOAD MODELS ───────────────────────────────────────
def _load_models():
    global _whisper_model, _face_mesh

    if _whisper_model is None:
        print("[AV] Loading Whisper...")
        _whisper_model = whisper.load_model("base")

    if _face_mesh is None:
        print("[AV] Loading MediaPipe...")
        mp_face_mesh = mp.solutions.face_mesh
        _face_mesh = mp_face_mesh.FaceMesh(
            max_num_faces=2,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    print("[AV] Models ready")


# ── STOP FLAG ─────────────────────────────────────────
def _should_stop():
    return os.path.exists(STOP_FLAG)


def _clear_stop_flag():
    if os.path.exists(STOP_FLAG):
        os.remove(STOP_FLAG)


# ── AUDIO THREAD ──────────────────────────────────────
def _record_audio(flag):
    print("[AV] Audio thread started")

    audio_q = queue.Queue()

    def callback(indata, frames, t, status):
        if flag[0]:
            audio_q.put(indata.copy())

    try:
        with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, callback=callback):
            while flag[0]:
                sd.sleep(100)
    except Exception as e:
        print("[AV] Audio ERROR:", e)
        return

    chunks = []
    while not audio_q.empty():
        chunks.append(audio_q.get())

    print("[AV] Audio chunks:", len(chunks))

    if not chunks:
        print("[AV] No audio captured")
        return

    with sf.SoundFile(AUDIO_FILENAME, mode="w", samplerate=SAMPLE_RATE, channels=1) as f:
        for c in chunks:
            f.write(c)

    print("[AV] Audio saved")


# ── PROCESS + SAVE ────────────────────────────────────
def _compute_and_save(fc, conf, fidg, look, smile, cheat):
    if not os.path.exists(AUDIO_FILENAME):
        print("[AV] No audio file")
        return

    size = os.path.getsize(AUDIO_FILENAME)
    print("[AV] Audio size:", size)

    if size < 1000:
        print("[AV] Audio too small")
        return

    print("[AV] Running Whisper...")

    try:
        result = _whisper_model.transcribe(AUDIO_FILENAME)
        transcript = result["text"].strip()
        print("[AV] Transcript:", transcript[:80])
    except Exception as e:
        import traceback
        print("[AV] Whisper FAILED:", e)
        traceback.print_exc()
        return

    words = transcript.lower().split()
    fillers = ["um","uh","like","basically","actually"]

    # librosa.get_duration: 'path=' in v0.10+, 'filename=' in v0.9.x
    try:
        duration = librosa.get_duration(path=AUDIO_FILENAME)
    except TypeError:
        duration = librosa.get_duration(filename=AUDIO_FILENAME)
    wpm = len(words) / (duration / 60) if duration > 0 else 0

    data = {
        "vision": {
            "confidence": round((conf/fc)*100,2) if fc else 0,
            "fidgeting": round((fidg/fc)*100,2) if fc else 0,
            "looking_away": round((look/fc)*100,2) if fc else 0,
            "smiling": round((smile/fc)*100,2) if fc else 0,
            "cheating": round((cheat/fc)*100,2) if fc else 0
        },
        "audio": {
            "duration": round(duration,2),
            "wpm": round(wpm,2),
            "fillers": sum(words.count(f) for f in fillers)
        },
        "transcript": transcript
    }

    with open(RESULT_JSON, "w") as f:
        json.dump(data, f, indent=2)

    print("[AV] result.json written")


# ── MAIN ──────────────────────────────────────────────
def run_interview():
    _clear_stop_flag()

    if os.path.exists(RESULT_JSON):
        os.remove(RESULT_JSON)

    # ── 1. START AUDIO IMMEDIATELY (before models load) ────────────────────
    #    Audio captures every second the user speaks, not just after Whisper loads.
    flag = [True]
    audio_thread = threading.Thread(target=_record_audio, args=(flag,), daemon=False)
    audio_thread.start()
    print("[AV] Audio recording started")

    # ── 2. OPEN CAMERA IMMEDIATELY ─────────────────────────────────────────
    #    CAP_DSHOW is required on Windows for fast camera init.
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("[AV] Camera failed to open")
        flag[0] = False
        audio_thread.join(timeout=5)
        return
    print("[AV] Camera LIVE")

    # ── 3. LOAD MODELS IN BACKGROUND ───────────────────────────────────────
    #    This way the camera window appears in ~1 s, not after 15-20 s of
    #    Whisper / MediaPipe loading.  We will wait for these before Whisper.
    model_ready = [False]

    def _bg_load():
        _load_models()
        model_ready[0] = True
        print("[AV] Models ready — face analysis now active")

    model_thread = threading.Thread(target=_bg_load, daemon=True)
    model_thread.start()

    # ── 4. FRAME LOOP ──────────────────────────────────────────────────────
    start_time = time.time()
    prev_x, prev_y = 0, 0
    movement_history = deque(maxlen=30)
    fc = conf = fidg = look = smile = cheat = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            continue

        fc += 1

        # Only analyse face landmarks once models are loaded
        if model_ready[0] and _face_mesh is not None:
            h, w, _ = frame.shape
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            res = _face_mesh.process(rgb)

            if res.multi_face_landmarks:
                if len(res.multi_face_landmarks) > 1:
                    cheat += 1
                else:
                    lm = res.multi_face_landmarks[0].landmark
                    nose        = lm[1]
                    left_edge   = lm[234]
                    right_edge  = lm[454]
                    mouth_left  = lm[61]
                    mouth_right = lm[291]

                    nx, ny = int(nose.x * w), int(nose.y * h)

                    # Fidgeting — rolling nose movement
                    if prev_x != 0:
                        mv = math.sqrt((nx - prev_x)**2 + (ny - prev_y)**2)
                        movement_history.append(mv) if mv <= 50 else movement_history.clear()
                    prev_x, prev_y = nx, ny
                    avg_mv = sum(movement_history) / len(movement_history) if movement_history else 0

                    # Head-pose deviation
                    center_x  = (left_edge.x + right_edge.x) / 2
                    deviation = abs(nose.x - center_x)

                    # Smile ratio
                    fw = math.sqrt((right_edge.x - left_edge.x)**2 + (right_edge.y - left_edge.y)**2)
                    mw = math.sqrt((mouth_right.x - mouth_left.x)**2 + (mouth_right.y - mouth_left.y)**2)
                    if fw > 0 and (mw / fw) > 0.42:
                        smile += 1

                    if deviation > 0.05:
                        look += 1
                    elif avg_mv > 2.5:
                        fidg += 1
                    else:
                        conf += 1

        cv2.imshow("AI Interview", frame)
        cv2.waitKey(1)

        # STOP — only after 2 s to ignore any stale flag from a previous session
        if _should_stop() and (time.time() - start_time > 2):
            print("[AV] STOP DETECTED")
            break

    # ── 5. TEAR DOWN CAMERA ────────────────────────────────────────────────
    cap.release()
    # Flush the OS message queue so the window actually closes on Windows
    for _ in range(10):
        cv2.waitKey(30)
    cv2.destroyAllWindows()
    for _ in range(10):
        cv2.waitKey(30)

    # ── 6. STOP AUDIO ──────────────────────────────────────────────────────
    flag[0] = False
    print("[AV] Waiting for audio to flush...")
    audio_thread.join(timeout=30)
    if audio_thread.is_alive():
        print("[AV] WARNING: audio thread did not finish")

    _clear_stop_flag()

    # ── 7. WAIT FOR MODELS (needed for Whisper) ────────────────────────────
    #    If the user stopped before models finished loading, wait now.
    if not model_ready[0]:
        print("[AV] Models still loading — waiting before Whisper...")
        model_thread.join(timeout=120)   # up to 2 min on slow machines

    # ── 8. TRANSCRIBE + SAVE ───────────────────────────────────────────────
    _compute_and_save(fc, conf, fidg, look, smile, cheat)