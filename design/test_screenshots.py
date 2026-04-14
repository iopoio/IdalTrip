from playwright.sync_api import sync_playwright
import os

OUTPUT_DIR = "c:/Projects/Automation/IdalTrip/design/screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://localhost:5175"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Desktop viewport
    desktop = browser.new_page(viewport={"width": 1440, "height": 900})

    # 1. Home page - desktop
    desktop.goto(f"{BASE_URL}/")
    desktop.wait_for_load_state("networkidle")
    desktop.wait_for_timeout(2000)
    desktop.screenshot(path=f"{OUTPUT_DIR}/01_home_desktop.png", full_page=True)
    print("1. Home desktop done")

    # 2. Home page - mobile
    mobile = browser.new_page(viewport={"width": 375, "height": 812})
    mobile.goto(f"{BASE_URL}/")
    mobile.wait_for_load_state("networkidle")
    mobile.wait_for_timeout(2000)
    mobile.screenshot(path=f"{OUTPUT_DIR}/02_home_mobile.png", full_page=True)
    print("2. Home mobile done")

    # 3. Festival detail page (use content id 1 as test)
    desktop.goto(f"{BASE_URL}/festival/1")
    desktop.wait_for_load_state("networkidle")
    desktop.wait_for_timeout(3000)
    desktop.screenshot(path=f"{OUTPUT_DIR}/03_detail_desktop.png", full_page=True)
    print("3. Detail desktop done")

    # 4. Festival detail - mobile
    mobile.goto(f"{BASE_URL}/festival/1")
    mobile.wait_for_load_state("networkidle")
    mobile.wait_for_timeout(3000)
    mobile.screenshot(path=f"{OUTPUT_DIR}/04_detail_mobile.png", full_page=True)
    print("4. Detail mobile done")

    # 5. Course result page
    desktop.goto(f"{BASE_URL}/course/1")
    desktop.wait_for_load_state("networkidle")
    desktop.wait_for_timeout(2000)
    desktop.screenshot(path=f"{OUTPUT_DIR}/05_course_desktop.png", full_page=True)
    print("5. Course desktop done")

    # 6. Course map page
    desktop.goto(f"{BASE_URL}/course/1/map")
    desktop.wait_for_load_state("networkidle")
    desktop.wait_for_timeout(2000)
    desktop.screenshot(path=f"{OUTPUT_DIR}/06_map_desktop.png", full_page=True)
    print("6. Map desktop done")

    browser.close()
    print("All screenshots done!")
