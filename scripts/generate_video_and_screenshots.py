import asyncio
import os
import shutil
import subprocess
import time
import urllib.request
import json
from pathlib import Path
import edge_tts
from playwright.async_api import async_playwright

FFMPEG_PATH = r"C:\Users\WALTON\bin\bin\ffmpeg.exe"

VOICEOVER_TEXT = (
    "Welcome to Ring Cerberus, the autonomous defensive swarm and zero-trust perimeter lockdown platform. "
    "Entering the Tactical HUD. Cerberus pairs edge-first MediaPipe gating with AWS Bedrock Claude 3.5 vision, cutting token costs by eighty-four percent. "
    "Scenario One: Package Poacher Detected. As loitering is flagged, deception surges to point eight five, deploying autonomous verbal warnings. "
    "Scenario Two: Armed Forced Entry. On critical breach, Cerberus seals magnetic deadbolts, engages the acoustic shield, and dispatches armed response. "
    "Scenario Three: Courier Airlock Verification. Couriers verify their offline RFC 6238 TOTP code, securely opening the delivery compartment. "
    "With official Ring Cloud integration, Cerberus delivers complete physical-cyber security."
)

async def synthesize_voiceover(audio_path: str):
    print(f"[*] Synthesizing voiceover audio with edge-tts to {audio_path}...")
    communicate = edge_tts.Communicate(VOICEOVER_TEXT, "en-US-ChristopherNeural")
    await communicate.save(audio_path)
    print("[+] Audio narration successfully generated.")

def get_media_duration(file_path: str) -> float:
    cmd = [
        FFMPEG_PATH,
        "-i", file_path
    ]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in res.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
            hours = float(parts[0])
            mins = float(parts[1])
            secs = float(parts[2])
            return hours * 3600 + mins * 60 + secs
    return 58.4

def api_post(endpoint: str):
    try:
        url = f"http://127.0.0.1:8000{endpoint}"
        req = urllib.request.Request(url, method="POST")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.read().decode()
    except Exception as e:
        print(f"[-] API call failed ({endpoint}): {e}")
        return None

async def record_walkthrough_and_screenshots(audio_duration: float):
    root_dir = Path(__file__).parent.parent
    scripts_dir = root_dir / "scripts"
    temp_video_dir = scripts_dir / "temp_video"
    temp_video_dir.mkdir(parents=True, exist_ok=True)

    public_dir = root_dir / "public"
    frontend_public_dir = root_dir / "frontend" / "public"
    (public_dir / "screenshots").mkdir(parents=True, exist_ok=True)
    (frontend_public_dir / "screenshots").mkdir(parents=True, exist_ok=True)

    print(f"[*] Target audio duration: {audio_duration:.2f} seconds")

    # Reset alarm to clean initial state
    api_post("/api/clear-alarm")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--disable-web-security",
                "--allow-running-insecure-content",
                "--window-size=1920,1080",
                "--autoplay-policy=no-user-gesture-required"
            ]
        )
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=str(temp_video_dir),
            record_video_size={"width": 1920, "height": 1080}
        )
        page = await context.new_page()

        start_time = time.time()
        def elapsed():
            return time.time() - start_time

        async def wait_until(target_sec: float):
            rem = target_sec - elapsed()
            if rem > 0:
                await asyncio.sleep(rem)

        # ----------------------------------------------------
        # Scene 1: Landing Page (0s - 8.5s)
        # ----------------------------------------------------
        print("[*] Navigating to Landing Page (http://localhost:3000)...")
        await page.goto("http://localhost:3000", wait_until="networkidle")
        await asyncio.sleep(2.0)

        # Screenshot 1: Landing Page
        s1_path = public_dir / "screenshots" / "01_landing_page.png"
        await page.screenshot(path=str(s1_path))
        shutil.copy(s1_path, frontend_public_dir / "screenshots" / "01_landing_page.png")
        print(f"[+] Captured {s1_path}")

        # Smooth scroll slightly down to show architecture/features
        await page.evaluate("window.scrollBy({ top: 450, behavior: 'smooth' })")
        await asyncio.sleep(1.8)
        await page.evaluate("window.scrollBy({ top: -450, behavior: 'smooth' })")
        await asyncio.sleep(1.0)

        await wait_until(8.5)

        # ----------------------------------------------------
        # Scene 2: Tactical HUD & Edge Gating (8.5s - 18s)
        # ----------------------------------------------------
        print("[*] Navigating to Tactical HUD (http://localhost:3000/dashboard)...")
        await page.goto("http://localhost:3000/dashboard", wait_until="networkidle")
        await asyncio.sleep(2.5)

        # Screenshot 2: Tactical HUD (Nominal State)
        s2_path = public_dir / "screenshots" / "02_tactical_hud.png"
        await page.screenshot(path=str(s2_path))
        shutil.copy(s2_path, frontend_public_dir / "screenshots" / "02_tactical_hud.png")
        print(f"[+] Captured {s2_path}")

        # Hover over Edge Vision Gating banner & token savings meter
        await page.mouse.move(300, 75)
        await asyncio.sleep(1.0)
        await page.mouse.move(850, 75)
        await asyncio.sleep(1.5)

        await wait_until(18.0)

        # ----------------------------------------------------
        # Scene 3: Scenario 1 - Package Poacher (18s - 28.5s)
        # ----------------------------------------------------
        print("[*] Triggering Scenario 1: Package Poacher Detected...")
        api_post("/api/inject-threat?scenario_override=PACKAGE_POACHER")
        await asyncio.sleep(2.0)

        # Screenshot 3: Package Poacher Alert
        s3_path = public_dir / "screenshots" / "03_poacher_alert.png"
        await page.screenshot(path=str(s3_path))
        shutil.copy(s3_path, frontend_public_dir / "screenshots" / "03_poacher_alert.png")
        print(f"[+] Captured {s3_path}")

        # Move mouse over poacher target / threat score
        await page.mouse.move(450, 380)
        await asyncio.sleep(2.0)

        await wait_until(28.5)

        # ----------------------------------------------------
        # Scene 4: Scenario 2 - Armed Forced Entry (28.5s - 39.5s)
        # ----------------------------------------------------
        print("[*] Triggering Scenario 2: Armed Forced Entry & Lockdown...")
        api_post("/api/inject-threat?scenario_override=ARMED_FORCED_ENTRY")
        await asyncio.sleep(2.0)

        # Screenshot 4: Forced Entry Lockdown
        s4_path = public_dir / "screenshots" / "04_forced_entry.png"
        await page.screenshot(path=str(s4_path))
        shutil.copy(s4_path, frontend_public_dir / "screenshots" / "04_forced_entry.png")
        print(f"[+] Captured {s4_path}")

        # Open Emergency Dispatch Modal
        dispatch_btn = page.locator("button:has-text('DISPATCH PATROL')")
        if await dispatch_btn.count() > 0:
            await dispatch_btn.first.click()
            await asyncio.sleep(1.5)
            # Click armed dispatch transmission
            send_btn = page.locator("button:has-text('Transmit Armed Dispatch Now')")
            if await send_btn.count() > 0:
                await send_btn.first.click()
                await asyncio.sleep(1.5)
            # Close modal
            cancel_btn = page.locator("button:has-text('Cancel')")
            if await cancel_btn.count() > 0:
                await cancel_btn.first.click()

        await wait_until(39.5)

        # ----------------------------------------------------
        # Scene 5: Scenario 3 - Authorized Courier Airlock (39.5s - 49.5s)
        # ----------------------------------------------------
        print("[*] Triggering Scenario 3: Courier Airlock Verification...")
        api_post("/api/inject-threat?scenario_override=AUTHORIZED_COURIER")
        await asyncio.sleep(2.0)

        # Screenshot 5: Courier Airlock Unlocked
        s5_path = public_dir / "screenshots" / "05_airlock_unlocked.png"
        await page.screenshot(path=str(s5_path))
        shutil.copy(s5_path, frontend_public_dir / "screenshots" / "05_airlock_unlocked.png")
        print(f"[+] Captured {s5_path}")

        # Hover over airlock scanner
        await page.mouse.move(1400, 300)
        await asyncio.sleep(2.0)

        await wait_until(49.5)

        # ----------------------------------------------------
        # Scene 6: Ring Hardware Drawer & Summary (49.5s - end)
        # ----------------------------------------------------
        print("[*] Opening Ring Hardware Drawer...")
        ring_hw_btn = page.locator("button:has-text('RING HW:')")
        if await ring_hw_btn.count() > 0:
            await ring_hw_btn.first.click()
            await asyncio.sleep(3.5)
            close_ring_btn = page.locator("button:has-text('Close')")
            if await close_ring_btn.count() > 0:
                await close_ring_btn.first.click()

        # Wait until full audio narration duration has elapsed
        await wait_until(audio_duration + 1.0)
        print(f"[+] Walkthrough recording finished. Total runtime: {elapsed():.2f}s")

        # Capture video object before closing page
        video = page.video
        await page.close()
        video_path = await video.path()
        await context.close()
        await browser.close()

        return video_path

def merge_video_and_audio(raw_video_path: str, audio_path: str, output_path: str):
    print(f"[*] Merging raw video ({raw_video_path}) and narration ({audio_path}) into {output_path}...")
    cmd = [
        FFMPEG_PATH,
        "-y",
        "-i", raw_video_path,
        "-i", audio_path,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "19",
        "-vf", "scale=1920:1080",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        output_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print(f"[-] FFmpeg error:\n{res.stderr}")
        raise RuntimeError("FFmpeg transcode failed")
    print(f"[+] Transcode complete: {output_path}")

async def main():
    root_dir = Path(__file__).parent.parent
    scripts_dir = root_dir / "scripts"
    audio_path = str(scripts_dir / "voiceover.mp3")

    # 1. Synthesize neural speech
    await synthesize_voiceover(audio_path)

    # 2. Get duration
    duration = get_media_duration(audio_path)
    print(f"[*] Voiceover duration: {duration:.2f}s")

    # 3. Record browser walkthrough
    raw_video = await record_walkthrough_and_screenshots(duration)

    # 4. Transcode to public/demo_walkthrough.mp4 and frontend/public/demo_walkthrough.mp4
    public_mp4 = root_dir / "public" / "demo_walkthrough.mp4"
    frontend_mp4 = root_dir / "frontend" / "public" / "demo_walkthrough.mp4"

    merge_video_and_audio(raw_video, audio_path, str(public_mp4))
    shutil.copy(public_mp4, frontend_mp4)
    print(f"[+] Generated {public_mp4} ({public_mp4.stat().st_size / 1024 / 1024:.2f} MB)")
    print(f"[+] Generated {frontend_mp4} ({frontend_mp4.stat().st_size / 1024 / 1024:.2f} MB)")

if __name__ == "__main__":
    asyncio.run(main())
