from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    # Capture console logs
    logs = []
    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))

    # Capture network requests
    requests = []
    page.on("request", lambda req: requests.append(f"REQ: {req.method} {req.url[:120]}"))
    page.on("response", lambda res: requests.append(f"RES: {res.status} {res.url[:120]}"))

    page.goto("http://localhost:5180/")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(5000)

    print("=== CONSOLE LOGS ===")
    for log in logs:
        print(log)

    print("\n=== NETWORK (API calls) ===")
    for r in requests:
        if 'B551011' in r or 'festival' in r.lower() or 'Error' in r:
            print(r)

    print("\n=== PAGE CONTENT (festival cards) ===")
    cards = page.locator('[class*="festival"], [class*="card"], [class*="grid"] > div').count()
    print(f"Card-like elements: {cards}")

    # Check if festivals array is populated
    festival_text = page.locator('text=진행중').count()
    print(f"'진행중' badges: {festival_text}")

    browser.close()
