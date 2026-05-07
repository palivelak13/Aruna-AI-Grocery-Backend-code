
from planner import generate_plan
from scraper import get_prices
from cleaner import clean_prices
from evaluator import evaluate
from chat import generate_chat_response
from demo_data import create_demo_data

import pandas as pd


def run_agent():

    best_score = 0

    all_data = {}

    # -----------------------------
    # RUN ITERATIONS
    # -----------------------------
    for i in range(3):

        print(f"\n🔁 Iteration {i+1}")

        items = generate_plan()

        print("Items:", items)

        current_data = {}

        for item in items:

            print(f"Fetching: {item}")

            raw_prices = get_prices(item)

            clean = clean_prices(raw_prices)

            current_data[item] = clean

        score = evaluate(current_data)

        print("Score:", score)

        if score > best_score:

            best_score = score

            all_data = current_data

            print("✅ Improved")

    # -----------------------------
    # FALLBACK DEMO DATA
    # -----------------------------
    has_data = any(
        len(v) > 0 for v in all_data.values()
    )

    if not has_data:

        print("\n⚠️ No live grocery data found")

        create_demo_data()

        print("✅ Demo grocery data created")

        # Load demo CSV
        df = pd.read_csv("store_prices.csv")

        # Convert into dictionary
        all_data = {}

        for item in df['item'].unique():

            prices = df[
                df['item'] == item
            ]['price'].tolist()

            all_data[item] = prices

    # -----------------------------
    # AI CHAT RESPONSE
    # -----------------------------
    chat_output = generate_chat_response(all_data)

    print("\n💬 Final Grocery Update:\n")

    print(chat_output)


if __name__ == "__main__":

    run_agent()

