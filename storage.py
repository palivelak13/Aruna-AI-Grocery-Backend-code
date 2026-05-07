from playwright.sync_api import sync_playwright
from config import SOURCES

def scrape_site(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto(url, timeout=60000)
            page.wait_for_timeout(3000)

            content = page.content()

            prices = []
            for line in content.split("\n"):
                if "₹" in line:
                    prices.append(line.strip())

            browser.close()
            return prices[:10]

        except:
            browser.close()
            return []

def get_prices(item):
    all_prices = []

    for src in SOURCES:
        url = src.format(item)
        prices = scrape_site(url)
        all_prices.extend(prices)

    return all_prices