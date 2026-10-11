import os
import shutil
import subprocess
import logging
from pathlib import Path
import torch
import torchaudio

logger = logging.getLogger("audio_processor")
logger.setLevel(logging.INFO)

class StemSeparator:
    def __init__(self, model_name: str = "htdemucs", device: str = None):
        """
        Initializes Demucs stem separator.
        model_name: 'htdemucs' is the high-quality Hybrid Transformer Demucs model.
        device: 'cuda' if GPU is available, else 'cpu'.
        """
        self.model_name = model_name
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using Demucs model '{self.model_name}' on device '{self.device}'")

    def separate_to_instrumental(self, input_audio_path: str, output_dir: str) -> dict:
        """
        Separates the input audio file into:
        1. Instrumental track (drums + bass + other instruments, vocals removed)
        2. Vocals track (acapella)
        3. All 4 individual stems (vocals, drums, bass, other)

        Returns dictionary with file paths of generated tracks.
        """
        input_path = Path(input_audio_path).resolve()
        out_dir = Path(output_dir).resolve()
        out_dir.mkdir(parents=True, exist_ok=True)

        if not input_path.exists():
            raise FileNotFoundError(f"Input file {input_path} does not exist")

        # Command to run demucs
        # --two-stems=vocals will isolate vocals and generate an accompaniment (instrumental) directly!
        # -n htdemucs selects the high-accuracy model
        # -d specifies cuda or cpu
        # --mp3 outputs clean MP3 format
        cmd = [
            "python", "-m", "demucs.separate",
            "-n", self.model_name,
            "-d", self.device,
            "--two-stems", "vocals",
            "--mp3",
            "--mp3-bitrate", "320",
            "-o", str(out_dir),
            str(input_path)
        ]

        logger.info(f"Running separation command: {' '.join(cmd)}")
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if result.returncode != 0:
            logger.error(f"Demucs failed with error: {result.stderr}")
            raise RuntimeError(f"Demucs execution failed: {result.stderr}")

        # Demucs saves files under output_dir / model_name / track_basename /
        track_stem_name = input_path.stem
        demucs_out_folder = out_dir / self.model_name / track_stem_name

        if not demucs_out_folder.exists():
            # Sometimes demucs replaces spaces or special chars
            candidates = list((out_dir / self.model_name).glob("*"))
            if candidates:
                demucs_out_folder = candidates[0]
            else:
                raise RuntimeError(f"Could not find Demucs output in {out_dir / self.model_name}")

        accompaniment_path = demucs_out_folder / "no_vocals.mp3"
        vocals_path = demucs_out_folder / "vocals.mp3"

        # Copy to clean standardized destination names
        final_instrumental = out_dir / "instrumental.mp3"
        final_vocals = out_dir / "vocals.mp3"

        if accompaniment_path.exists():
            shutil.copy2(accompaniment_path, final_instrumental)
        else:
            raise FileNotFoundError(f"Expected instrumental file {accompaniment_path} not found")

        if vocals_path.exists():
            shutil.copy2(vocals_path, final_vocals)

        return {
            "instrumental": str(final_instrumental),
            "vocals": str(final_vocals),
            "demucs_folder": str(demucs_out_folder)
        }
