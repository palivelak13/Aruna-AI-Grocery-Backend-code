# backend/ai_engine.py

import pandas as pd
import numpy as np

from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor

from datetime import datetime
import random


class GroceryAI:

    # =========================================
    # INIT
    # =========================================

    def __init__(self):

        # =====================================
        # DEMO HISTORICAL DATA
        # Replace with PostgreSQL/Mongo later
        # =====================================

        self.history = pd.DataFrame({

            "item": [

                "rice", "rice", "rice", "rice", "rice",

                "milk", "milk", "milk", "milk", "milk",

                "eggs", "eggs", "eggs", "eggs", "eggs",

                "tomato", "tomato", "tomato", "tomato", "tomato",

            ],

            "day": [

                1, 2, 3, 4, 5,

                1, 2, 3, 4, 5,

                1, 2, 3, 4, 5,

                1, 2, 3, 4, 5,

            ],

            "price": [

                120, 118, 116, 115, 113,

                62, 60, 58, 57, 55,

                90, 92, 95, 97, 100,

                40, 42, 45, 48, 52,

            ],

            "sales": [

                30, 40, 55, 60, 72,

                80, 90, 95, 110, 130,

                45, 50, 58, 70, 80,

                20, 25, 35, 50, 65,

            ]

        })

    # =========================================
    # PRICE PREDICTION AI
    # =========================================

    def predict_price(self, item: str):

        try:

            data = self.history[
                self.history["item"] == item.lower()
            ]

            if len(data) < 2:

                return {

                    "item": item,

                    "prediction": None,

                    "confidence": 0,

                    "trend": "stable",

                    "next_day": None

                }

            # FEATURES
            X = data[["day", "sales"]]

            # TARGET
            y = data["price"]

            # RANDOM FOREST MODEL
            model = RandomForestRegressor(
                n_estimators=100,
                random_state=42
            )

            model.fit(X, y)

            next_day = data["day"].max() + 1

            next_sales = int(data["sales"].mean() * 1.1)

            prediction = model.predict([
                [next_day, next_sales]
            ])[0]

            # TREND
            current_price = y.iloc[-1]

            if prediction > current_price:

                trend = "up"

            elif prediction < current_price:

                trend = "down"

            else:

                trend = "stable"

            # CONFIDENCE
            confidence = model.score(X, y)

            return {

                "item": item,

                "current_price": round(float(current_price), 2),

                "prediction": round(float(prediction), 2),

                "confidence": round(float(confidence * 100), 2),

                "trend": trend,

                "next_day": int(next_day),

                "forecast_time": str(datetime.now())

            }

        except Exception as e:

            return {

                "item": item,

                "prediction": None,

                "error": str(e)

            }

    # =========================================
    # DEMAND AI ENGINE
    # =========================================

    def demand_score(self, item: str):

        try:

            data = self.history[
                self.history["item"] == item.lower()
            ]

            if data.empty:

                return {

                    "item": item,

                    "demand_score": 0,

                    "status": "LOW"

                }

            avg_sales = data["sales"].mean()

            growth = (
                data["sales"].iloc[-1]
                - data["sales"].iloc[0]
            )

            demand_score = (

                (avg_sales * 0.7)

                +

                (growth * 0.3)

            )

            demand_score = min(
                100,
                round(demand_score, 2)
            )

            # STATUS

            if demand_score >= 80:

                status = "VERY HIGH"

            elif demand_score >= 60:

                status = "HIGH"

            elif demand_score >= 40:

                status = "MEDIUM"

            else:

                status = "LOW"

            return {

                "item": item,

                "average_sales": round(avg_sales, 2),

                "growth_rate": round(growth, 2),

                "demand_score": demand_score,

                "status": status

            }

        except Exception as e:

            return {

                "item": item,

                "demand_score": 0,

                "error": str(e)

            }

    # =========================================
    # SMART STORE RANKING AI
    # =========================================

    def best_store(self, stores: list):

        try:

            if not stores:

                return None

            df = pd.DataFrame(stores)

            required_columns = [

                "price",
                "rating",
                "delivery"

            ]

            for col in required_columns:

                if col not in df.columns:

                    return None

            scaler = MinMaxScaler()

            scaled = scaler.fit_transform(

                df[[
                    "price",
                    "rating",
                    "delivery"
                ]]

            )

            scaled_df = pd.DataFrame(

                scaled,

                columns=[
                    "price_scaled",
                    "rating_scaled",
                    "delivery_scaled"
                ]

            )

            df = pd.concat(
                [df, scaled_df],
                axis=1
            )

            # =====================================
            # AI SCORING FORMULA
            # =====================================

            df["ai_score"] = (

                # CHEAPER = BETTER
                (1 - df["price_scaled"]) * 0.5

                +

                # HIGHER RATING = BETTER
                df["rating_scaled"] * 0.3

                +

                # LOWER DELIVERY = BETTER
                (1 - df["delivery_scaled"]) * 0.2

            )

            best = df.sort_values(
                "ai_score",
                ascending=False
            ).iloc[0]

            return {

                "best_store": best["store"],

                "score": round(
                    float(best["ai_score"]),
                    3
                ),

                "price": float(best["price"]),

                "rating": float(best["rating"]),

                "delivery": int(best["delivery"])

            }

        except Exception as e:

            return {

                "error": str(e)

            }

    # =========================================
    # BUY DECISION ENGINE
    # =========================================

    def should_buy_now(self, item: str):

        try:

            prediction = self.predict_price(item)

            demand = self.demand_score(item)

            future_price = prediction.get(
                "prediction",
                0
            )

            current_price = prediction.get(
                "current_price",
                0
            )

            demand_score = demand.get(
                "demand_score",
                0
            )

            # =====================================
            # AI DECISION LOGIC
            # =====================================

            if (

                future_price > current_price

                and

                demand_score > 60

            ):

                decision = "BUY NOW"

                reason = "Price likely to increase"

            elif (

                future_price < current_price

            ):

                decision = "WAIT"

                reason = "Price may drop soon"

            else:

                decision = "MONITOR"

                reason = "Stable market"

            return {

                "item": item,

                "decision": decision,

                "reason": reason,

                "current_price": current_price,

                "predicted_price": future_price,

                "demand_score": demand_score,

                "confidence": prediction.get(
                    "confidence",
                    0
                )

            }

        except Exception as e:

            return {

                "item": item,

                "decision": "UNKNOWN",

                "error": str(e)

            }

    # =========================================
    # MARKET ANALYSIS ENGINE
    # =========================================

    def market_insights(self, item: str):

        prediction = self.predict_price(item)

        demand = self.demand_score(item)

        insights = []

        if prediction["trend"] == "up":

            insights.append(
                f"{item} prices are increasing"
            )

        if prediction["trend"] == "down":

            insights.append(
                f"{item} prices are decreasing"
            )

        if demand["demand_score"] > 70:

            insights.append(
                f"High customer demand detected"
            )

        if demand["demand_score"] < 40:

            insights.append(
                f"Demand currently low"
            )

        if len(insights) == 0:

            insights.append(
                "Market stable"
            )

        return {

            "item": item,

            "insights": insights,

            "generated_at": str(datetime.now())

        }

    # =========================================
    # DYNAMIC DISCOUNT ENGINE
    # =========================================

    def smart_discount(self, item: str):

        demand = self.demand_score(item)

        score = demand["demand_score"]

        if score > 80:

            discount = random.randint(5, 10)

        elif score > 60:

            discount = random.randint(10, 20)

        else:

            discount = random.randint(20, 40)

        return {

            "item": item,

            "recommended_discount": f"{discount}%",

            "demand_score": score

        }

    # =========================================
    # INVENTORY AI
    # =========================================

    def inventory_alert(self, item: str):

        demand = self.demand_score(item)

        score = demand["demand_score"]

        if score > 80:

            status = "RESTOCK URGENT"

        elif score > 60:

            status = "LOW STOCK"

        else:

            status = "STOCK OK"

        return {

            "item": item,

            "inventory_status": status,

            "demand_score": score

        }


# =========================================
# TEST
# =========================================

if __name__ == "__main__":

    ai = GroceryAI()

    print(ai.predict_price("rice"))

    print(ai.demand_score("milk"))

    print(ai.should_buy_now("eggs"))

    print(ai.market_insights("tomato"))