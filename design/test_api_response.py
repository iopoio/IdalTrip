from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    responses = []
    def capture(response):
        if 'searchFestival' in response.url:
            try:
                body = response.text()
                responses.append(body)
            except:
                responses.append(f"ERROR reading body, status={response.status}")

    page.on("response", capture)

    page.goto("http://localhost:5180/")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(5000)

    print(f"Captured {len(responses)} festival API responses\n")
    for i, r in enumerate(responses):
        print(f"=== Response {i+1} ===")
        try:
            data = json.loads(r)
            items = data.get('response', {}).get('body', {}).get('items', {}).get('item', [])
            print(f"totalCount: {data['response']['body']['totalCount']}")
            print(f"items count: {len(items) if isinstance(items, list) else 1}")
            if items:
                first = items[0] if isinstance(items, list) else items
                print(f"first title: {first.get('title')}")
                print(f"first image: {first.get('firstimage', 'NONE')[:80]}")
        except:
            print(r[:500])

    browser.close()
