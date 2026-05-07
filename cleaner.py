
from groq_client import ask_groq
import re


def clean_prices(raw_prices):

    if not raw_prices:
        return []

    try:

        # Keep only valid ₹ prices
        cleaned = []

        for p in raw_prices:

            match = re.search(r'₹\s?(\d+)', str(p))

            if match:

                value = int(match.group(1))

                if 1 <= value <= 500:
                    cleaned.append(f"₹{value}")

        # remove duplicates
        cleaned = list(set(cleaned))

        return cleaned

    except Exception as e:

        print("Cleaner Error:", e)

        return []

