import sys
import time
import requests
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_pipeline(audio_file_path: str):
    p = Path(audio_file_path)
    if not p.exists():
        print(f"File {audio_file_path} not found!")
        return

    print(f"1. Uploading {p.name} to {BASE_URL}/api/upload...")
    with open(p, "rb") as f:
        response = requests.post(f"{BASE_URL}/api/upload", files={"file": (p.name, f)})
    
    if response.status_code != 200:
        print(f"Upload failed: {response.text}")
        return

    data = response.json()
    job_id = data["job_id"]
    print(f"Upload successful! Job ID: {job_id}")

    print("2. Polling status until completion...")
    while True:
        status_res = requests.get(f"{BASE_URL}/api/status/{job_id}").json()
        status = status_res.get("status")
        progress = status_res.get("progress", 0)
        print(f"Status: {status} ({progress}%)")

        if status == "completed":
            print("Processing complete!")
            print(f"Instrumental URL: {BASE_URL}{status_res['instrumental_url']}")
            print(f"Vocals URL: {BASE_URL}{status_res['vocals_url']}")
            
            # Download instrumental to verify
            inst_data = requests.get(f"{BASE_URL}{status_res['instrumental_url']}").content
            out_file = f"test_output_instrumental_{p.name}"
            with open(out_file, "wb") as out_f:
                out_f.write(inst_data)
            print(f"Saved instrumental to {out_file}")
            break
        elif status == "failed":
            print(f"Processing failed: {status_res.get('error')}")
            break

        time.sleep(2)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_pipeline(sys.argv[1])
    else:
        print("Usage: python test_client.py <path_to_audio_file>")
