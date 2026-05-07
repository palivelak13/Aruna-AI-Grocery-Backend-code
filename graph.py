import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import os

CSV_FILE = "prices.csv"


def save_price_history(data):
    rows = []

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for item, prices in data.items():
        for p in prices:
            try:
                # Extract number
                number = ''.join(ch for ch in p if ch.isdigit())

                if number:
                    rows.append({
                        "time": timestamp,
                        "item": item,
                        "price": int(number)
                    })
            except:
                continue

    df = pd.DataFrame(rows)

    if os.path.exists(CSV_FILE):
        old_df = pd.read_csv(CSV_FILE)
        df = pd.concat([old_df, df], ignore_index=True)

    df.to_csv(CSV_FILE, index=False)


def generate_graph():
    if not os.path.exists(CSV_FILE):
        print("No price history found")
        return

    df = pd.read_csv(CSV_FILE)

    plt.figure(figsize=(10, 6))

    for item in df['item'].unique():
        item_df = df[df['item'] == item]

        plt.plot(item_df.index, item_df['price'], label=item)

    plt.xlabel("Records")
    plt.ylabel("Price (₹)")
    plt.title("Grocery Price Trends")
    plt.legend()

    plt.savefig("price_trends.png")

    print("📊 Graph saved as price_trends.png")