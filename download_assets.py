import urllib.request
import urllib.parse
import os

files = [
    "from OGISS DR Nisar Khan.jpeg",
    "from SKYN Sudais khan.jpeg",
    "from Madrasa Tafheem ul quran Molana Samiullah Bukhari.png",
    "mentorship_desktop_banner.jpg",
    "mentorship_mobile_banner.jpg"
]

base_url = "https://raw.githubusercontent.com/digitalhunarmandhub/Digital-Hunarmand-Hub/main/"
dir_path = os.path.dirname(os.path.abspath(__file__))

print("Downloading missing image assets from GitHub repository...")
for f in files:
    target = os.path.join(dir_path, f)
    url = base_url + urllib.parse.quote(f)
    print(f"Fetching: {f}")
    try:
        urllib.request.urlretrieve(url, target)
        size = os.path.getsize(target)
        print(f" -> SUCCESS: {f} ({size:,} bytes saved)")
    except Exception as e:
        print(f" -> FAILED: {f}: {e}")

print("\nAll assets processed successfully!")
