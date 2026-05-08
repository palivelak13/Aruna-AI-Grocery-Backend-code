from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

# -----------------------------
# ENABLE CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# API ROUTE
# -----------------------------
@app.get("/prices")
def get_prices():

    try:

        df = pd.read_csv("store_prices.csv")

        return df.to_dict(orient="records")

    except Exception as e:

        return {
            "error": str(e)
        }