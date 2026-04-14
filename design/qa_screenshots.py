from playwright.sync_api import sync_playwright
import os

OUTPUT = "c:/Projects/Automation/IdalTrip/design/qa"
os.makedirs(OUTPUT, exist_ok=True)
BASE = "http://localhost:5180"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    dt = browser.new_page(viewport={"width": 1440, "height": 900})
    mb = browser.new_page(viewport={"width": 375, "height": 812})

    pages = [
        ("/", "home"),
        ("/festival/1", "detail"),
        ("/course/1", "result"),
        ("/course/1/map", "map"),
    ]

    for path, name in pages:
        dt.goto(f"{BASE}{path}")
        dt.wait_for_load_state("networkidle")
        dt.wait_for_timeout(2000)
        dt.screenshot(path=f"{OUTPUT}/{name}_desktop.png", full_page=True)
        print(f"{name} desktop done")

        mb.goto(f"{BASE}{path}")
        mb.wait_for_load_state("networkidle")
        mb.wait_for_timeout(2000)
        mb.screenshot(path=f"{OUTPUT}/{name}_mobile.png", full_page=True)
        print(f"{name} mobile done")

    browser.close()
    print("All done!")
