# 🗺️ DIGITAL HUNARMAND HUB — PROJECT ARCHITECTURE & MAP
> **⚠️ CRITICAL AGENT INSTRUCTION (FOR ALL AI ASSISTANTS):**
> This project has been **MODULARIZED**. CSS and JavaScript are separated into `css/` and `js/`.
> Do **NOT** scan or read all lines. Always check this map first and target only the required files and lines.
> 
> **⚡ MANDATORY AUTO-UPDATE RULE:**
> If you add, delete, or modify any section, file, modal, or script logic in this project, you are **REQUIRED** to automatically update this `PROJECT_MAP.md` table before completing your turn, without waiting for user prompting.

---

## 📂 Active Modular Architecture

```text
Digital-Hunarmand-Hub-main/
│
├── .cursorrules                   # Automatic AI behavioral directives & maintenance rules
├── PROJECT_MAP.md                 # (This file) Complete line-by-line index of the codebase
├── index.html                 # Main website HTML structure (CLEAN: ~2,745 lines)
│
├── css/
│   └── style.css              # ALL CSS Styles (5,579 lines extracted cleanly)
│
├── js/
│   └── main.js                # Core JS Engine (Chatbot, Nav, Typewriter, Filters, Forms)
│
├── loading animation.mp4      # Preloader video
├── favicon.png                # Site icons
└── *.png, *.jpg               # Image assets and banners
```

---

## 📍 Line-by-Line Code Map (`index.html`)

| Section / Component | Line Range (Approx.) | File Location & Description |
|---|---|---|
| **🎨 ALL CSS STYLING** | **All lines (1 – 5780)** | `css/style.css` (Colors, 3D Buttons; Mobile Nav: ~L2406 & ~L4445; Mobile Banners & Popup Buttons: ~L3220-L3267) |
| **Meta & CSS Link** | `Lines 1 – 15` | `index.html` (`<head>`, Google Fonts, `<link rel="stylesheet">`) |
| **Preloader Video** | `Lines 18 – 28` | `index.html` (`#preloader`, `#loadingVideo`, `#preloaderSkip`) |
| **Header & Navbar** | `Lines 30 – 64` | `index.html` (`#nav`, desktop links, `#hbg` mobile toggle) |
| **Hero Section (`#home`)** | `Lines 65 – 225` | `index.html` (Live bubbles, typewriter headline, CTA buttons) |
| **Services (`#services`)** | `Lines 226 – 370` | `index.html` (12 Digital services showcase grid) |
| **About Us (`#about`)** | `Lines 375 – 410` | `index.html` (Company overview, `.cnt` numbers counter) |
| **Contact (`#contact`)** | `Lines 411 – 720` | `index.html` (Contact cards, WhatsApp link, Gmail link, inquiry form) |
| **Mission & Why Us** | `Lines 725 – 1100` | `index.html` (`#mission`, `#why`, values & vision cards) |
| **Courses (`#courses`)** | `Lines 1101 – 1800`| `index.html` (Course catalog, category filter tabs, cards) |
| **Portfolio (`#projects`)** | `Lines 1801 – 1980`| `index.html` (HELMAN NGO, Sarhad Furniture live showcases) |
| **Team Leadership (`#team`)** | `Lines 1981 – 2030`| `index.html` (Executive leadership dossier card triggers) |
| **Chatbot Modal (`#chatModal`)**| `Lines 2031 – 2064`| `index.html` (Hunarmand AI chat window, `#cin` input) |
| **⚡ CORE JS ENGINE** | **All lines (1 – 1454)** | `js/main.js` (Linked at line 2065: Gemini AI, Course Filter, Forms) |
| **Mentorship Popup** | `Lines 2067 – 2084`| `index.html` (`#popupOverlay`, admission banner, WhatsApp apply) |
| **Popup & Dossier Scripts**| `Lines 2085 – 2742`| `index.html` (Preloader timer, touch highlight, team modal dossier) |

---

## 🔄 Rules for Updating this Map (Automatic Protocol)

1. **New UI Section:** Add section name, line range, and ID in the HTML table above.
2. **Styling Changes:** Edit `css/style.css` directly.
3. **JS Feature / Chatbot:** Edit `js/main.js` directly.
4. **Auto-Update Duty:** AI is strictly bound by `.cursorrules` to keep this map updated on every change.
