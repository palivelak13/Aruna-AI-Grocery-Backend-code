import pandas as pd
import random
from datetime import datetime

items = [

    "rice",
    "milk",
    "bread",
    "eggs",
    "tea",
    "coffee",
    "sugar",
    "salt",
    "dal",
    "oil",
    "apple",
    "banana",
    "potato",
    "tomato",
    "onion",
    "chicken",
    "paneer",
    "juice",
    "chips",
    "soap"

]

stores = [
    "BigBasket",
    "Blinkit"
]

rows = []

for item in items:

    for store in stores:

        base = random.randint(20, 300)

        rows.append({

            "time":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),

            "item": item,

            "store": store,

            "price": base

        })

df = pd.DataFrame(rows)

df.to_csv(
    "store_prices.csv",
    index=False
)

print("✅ Demo data created")
print(df.head())