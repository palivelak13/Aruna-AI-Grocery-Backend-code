
import pandas as pd
import random
from datetime import datetime


def create_demo_data():

    items = [
        "rice",
    "wheat",
    "dal",
    "milk",
    "eggs",
    "bread",
    "tea",
    "coffee",
    "sugar",
    "salt",
    "apple",
    "banana",
    "orange",
    "potato",
    "tomato",
    "onion",
    "carrot",
    "chicken",
    "paneer"
    ]

    stores = [
        "BigBasket",
        "Blinkit"
    ]

    rows = []

    for item in items:

        for store in stores:

            rows.append({
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "item": item,
                "store": store,
                "price": random.randint(20, 300)
            })

    df = pd.DataFrame(rows)

    df.to_csv(
        "store_prices.csv",
        index=False
    )

