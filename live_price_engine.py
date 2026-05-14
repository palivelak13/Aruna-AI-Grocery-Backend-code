import random

class LivePriceEngine:

    def __init__(self):

        self.stores = [
            "Blinkit",
            "BigBasket",
            "Zepto",
            "Instamart",
            "Amazon Fresh"
        ]

    def get_live_prices(self, item: str):

        prices = []

        base_price = random.randint(40, 250)

        for store in self.stores:

            prices.append({

                "item": item,

                "store": store,

                "price": random.randint(
                    base_price - 20,
                    base_price + 20
                ),

                "rating": round(
                    random.uniform(3.8, 4.9),
                    1
                ),

                "delivery": random.randint(
                    5,
                    25
                ),

                "stock": random.choice([
                    "In Stock",
                    "Low Stock",
                    "Fast Selling"
                ])

            })

        return prices