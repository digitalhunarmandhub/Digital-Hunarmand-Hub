@echo off
set "TARGET_DIR=%~dp0Digital-Hunarmand-Hub-main"
if not exist "%TARGET_DIR%" set "TARGET_DIR=%~dp0"

cd /d "%TARGET_DIR%"
echo ===================================================
echo Copying Images & Banners to 'thumb' subfolder...
echo Target Directory: %TARGET_DIR%
echo (Originals are kept safely in the main folder)
echo ===================================================

:: Create thumb folder if it doesn't exist
if not exist "%TARGET_DIR%\thumb" (
    mkdir "%TARGET_DIR%\thumb"
    echo [OK] Created subfolder: thumb\
) else (
    echo [OK] Subfolder 'thumb\' already exists.
)

echo.
echo ---------------------------------------------------
echo 1. Copying Partners Logos into thumb\...
echo ---------------------------------------------------
copy /y "%TARGET_DIR%\nojawan logo.png" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\OGISS.png" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\SKYN Digital.png" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\Jamia Islamia Tafheem-ul-Quran Korthi Mitiari.png" "%TARGET_DIR%\thumb\"

echo.
echo ---------------------------------------------------
echo 2. Copying Partners Representatives Images into thumb\...
echo ---------------------------------------------------
copy /y "%TARGET_DIR%\nidal.png" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\muhammad islam.png" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\from OGISS DR Nisar Khan.jpeg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\from SKYN Sudais khan.jpeg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\from Madrasa Tafheem ul quran Molana Samiullah Bukhari.png" "%TARGET_DIR%\thumb\"

echo.
echo ---------------------------------------------------
echo 3. Copying Our Projects Section Banners (4 Projects) into thumb\...
echo ---------------------------------------------------
copy /y "%TARGET_DIR%\abr_emporium_banner.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\ecom_world_banner.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\sarhad_furniture_banner.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\helman_ngo_banner.jpg" "%TARGET_DIR%\thumb\"

echo.
echo ---------------------------------------------------
echo 4. Copying Course & Program Thumbnails into thumb\...
echo ---------------------------------------------------
copy /y "%TARGET_DIR%\thumb_graphic_design.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_uiux_web_dev.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_app_game_dev.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_video_editing.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_digital_marketing.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_facebook_monetization.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_ai_chatgpt.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_ms_office.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_research_writing.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_windows_troubleshooting.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_networking_it.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_autocad.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_freelancing_pm.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_entrepreneurship.svg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_logo_branding.svg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_internship_program.jpg" "%TARGET_DIR%\thumb\"
copy /y "%TARGET_DIR%\thumb_career_mentorship.jpg" "%TARGET_DIR%\thumb\"

echo.
echo ===================================================
echo [SUCCESS] All Images & Banners Copied to 'thumb\'!
echo All original files remain intact in the main folder.
echo ===================================================
pause
