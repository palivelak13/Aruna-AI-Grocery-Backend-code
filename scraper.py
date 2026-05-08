from playwright.sync_api import sync_playwright
import re
import pandas as pd
import os
from datetime import datetime

STORE_FILE = "store_prices.csv"

SOURCES = [
    "https://www.bigbasket.com/ps/?q={}",
    "https://www.blinkit.com/s/?q={}"
]

def save_store_data(item, store, prices):

    rows = []

    for value in prices:
        try:
            clean_price = re.sub(r"[^\d]", "", value)
            if clean_price == "":
                continue

            rows.append({
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "item": item,
                "store": store,
                "price": int(clean_price)
            })
        except:
            continue

    df = pd.DataFrame(rows)

    if len(df) == 0:
        return

    if os.path.exists(STORE_FILE):
        old = pd.read_csv(STORE_FILE)
        df = pd.concat([old, df], ignore_index=True)

    df.to_csv(STORE_FILE, index=False)


def get_prices(item):

    all_prices = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for src in SOURCES:
            try:
                url = src.format(item)
                print("Scraping:", url)

                page.goto(url, timeout=60000)
                page.wait_for_timeout(3000)

                text = page.inner_text("body")

                matches = re.findall(r'₹\s?\d+', text)

                if "bigbasket" in url:
                    store = "BigBasket"
                else:
                    store = "Blinkit"

                save_store_data(item, store, matches)

                all_prices.extend(matches)

            except Exception as e:
                print("Scraping error:", e)

        browser.close()

    return all_prices