# 🎵 Song to Instrument AI (Vocal Remover & Instrumental Isolator)

A full-stack mobile application that allows users to upload any song and automatically separate it into a high-quality **Instrumental track** and **Acapella/Vocals** using Meta's state-of-the-art **Hybrid Transformer Demucs (htdemucs)** AI model.

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   Flutter Mobile App (iOS/And)  │
│  - Modern Dark Studio UI        │
│  - Audio file picker            │
│  - Live upload & AI progress    │
│  - Waveform visualizer player   │
│  - Instrumental / Vocal toggle  │
│  - Save & Share MP3             │
└───────────────▲─────────────────┘
                │ HTTP REST (Multipart & Streaming)
┌───────────────▼─────────────────┐
│     FastAPI AI Backend (Python) │
│  - Asynchronous Job Processing  │
│  - Meta Demucs (htdemucs engine)│
│  - FFmpeg audio transcoding     │
│  - 320 kbps MP3 output          │
└─────────────────────────────────┘
```

---

## 📁 Project Structure

```
├── backend/
│   ├── main.py               # FastAPI server with background tasks & REST endpoints
│   ├── audio_processor.py    # Demucs AI stem isolation wrapper
│   ├── test_client.py        # Terminal test script for audio upload and separation
│   ├── requirements.txt      # PyTorch, Demucs, FastAPI, FFmpeg bindings
│   └── Dockerfile            # Container configuration with pre-downloaded weights
│
└── mobile_app/
    ├── pubspec.yaml          # Flutter dependencies (audioplayers, dio, etc.)
    └── lib/
        ├── main.dart         # Flutter app root & dark studio theme
        ├── models/
        │   └── song_job.dart # Processing state and track data model
        ├── services/
        │   ├── api_service.dart          # Backend upload, polling, download
        │   └── audio_player_service.dart # Dual-track audio engine
        ├── widgets/
        │   └── waveform_visualizer.dart  # Animated audio visualizer
        └── screens/
            ├── home_screen.dart          # Upload dropzone & conversion queue
            └── player_screen.dart        # Fullscreen playback & stems mixer
```

---

## 🚀 Getting Started

### 1. Backend Setup (Python + Demucs AI)

#### Prerequisites:
- Python 3.10+
- FFmpeg installed on your system (e.g. `winget install Gyan.FFmpeg` on Windows, or `sudo apt install ffmpeg` on Linux).

#### Install dependencies & run:
```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Start backend server on port 8000
python main.py
```

The server will be available at `http://localhost:8000`. You can inspect the interactive OpenAPI documentation at `http://localhost:8000/docs`.

#### Test with a sample song:
```bash
python test_client.py "path/to/your/song.mp3"
```

---

### 2. Mobile App Setup (Flutter)

#### Prerequisites:
- Flutter SDK 3.0+
- Android Studio / Xcode

#### Run the app:
```bash
cd mobile_app

# Fetch dependencies
flutter pub get

# Launch on connected device or emulator
flutter run
```

---

## 📱 Connecting App to Backend

1. **Android Emulator**:
   The default backend address is already set to `http://10.0.2.2:8000`, which automatically routes to your host computer's `localhost`.
2. **iOS Simulator**:
   Set backend address to `http://localhost:8000`.
3. **Physical Device (via WiFi)**:
   - Find your computer's local IP address (e.g. `192.168.1.50`).
   - In the mobile app, tap the **⚙️ (Settings)** icon in the top right corner.
   - Enter `http://192.168.1.50:8000` and tap **Save**.

---

## ⚡ Free Cloud Deployment for the AI Backend

If you want the app to work everywhere without running your PC:
- **Hugging Face Spaces (Free T4 GPU)**: Deploy the `backend/Dockerfile` as a Docker Space on Hugging Face.
- **Modal.com / RunPod**: Serverless GPU execution for ultra-fast Demucs processing (~5-10 seconds per song).
