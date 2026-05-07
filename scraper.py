
from playwright.sync_api import sync_playwright
from config import SOURCES

import pandas as pd
import re
import os
from datetime import datetime


STORE_FILE = "store_prices.csv"


# -----------------------------
# SAVE DATA
# -----------------------------
def save_store_data(item, store, prices):

    rows = []

    for p in prices:

        try:

            value = int(
                re.sub(r"[₹, ]", "", p)
            )

            rows.append({
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "item": item,
                "store": store,
                "price": value
            })

        except:
            continue

    if len(rows) == 0:
        return

    df = pd.DataFrame(rows)

    # -----------------------------
    # SAFE CSV LOAD
    # -----------------------------
    if os.path.exists(STORE_FILE):

        try:

            if os.path.getsize(STORE_FILE) > 0:

                old = pd.read_csv(STORE_FILE)

                df = pd.concat(
                    [old, df],
                    ignore_index=True
                )

        except Exception as e:

            print("CSV Read Error:", e)

    # -----------------------------
    # SAVE CSV
    # -----------------------------
    df.to_csv(
        STORE_FILE,
        index=False
    )


# -----------------------------
# SCRAPER
# -----------------------------
def get_prices(item):

    all_prices = []

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=True
        )

        for src in SOURCES:

            page = browser.new_page()

            try:

                url = src.format(item)

                print("Scraping:", url)

                page.goto(
                    url,
                    timeout=60000
                )

                page.wait_for_timeout(5000)

                text = page.locator(
                    "body"
                ).inner_text()

                matches = re.findall(
                    r'₹\s?\d+',
                    text
                )

                prices = matches[:10]

                print("Found:", prices[:5])

                # Detect store
                if "bigbasket" in url:

                    store = "BigBasket"

                elif "blinkit" in url:

                    store = "Blinkit"

                else:

                    store = "Unknown"

                # Save data
                save_store_data(
                    item,
                    store,
                    prices
                )

                all_prices.extend(prices)

            except Exception as e:

                print(
                    f"Error occurred while scraping {item} from {src}:",
                    e
                )

            finally:

                page.close()

        browser.close()

    return list(set(all_prices))

