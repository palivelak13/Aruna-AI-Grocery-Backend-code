import streamlit as st
import pandas as pd
import requests
from datetime import datetime

# -----------------------------
# CONFIG
# -----------------------------
st.set_page_config(
    page_title="Aruna AI Grocery",
    layout="wide"
)

API_URL = "http://localhost:8000/prices"

st.title("🛒 Aruna AI Grocery Dashboard (Production Mode)")

# -----------------------------
# SAFE API CALL
# -----------------------------
@st.cache_data(ttl=20)
def load_data():
    try:
        res = requests.get(API_URL, timeout=5)
        res.raise_for_status()
        data = res.json()

        if isinstance(data, dict) and "error" in data:
            st.error(data["error"])
            return pd.DataFrame()

        return pd.DataFrame(data)

    except Exception:
        st.warning("⚠️ Backend not reachable. Showing empty data.")
        return pd.DataFrame()

df = load_data()

if df.empty:
    st.stop()

# -----------------------------
# CLEAN DATA
# -----------------------------
df["item"] = df["item"].astype(str)
df["store"] = df["store"].astype(str)
df["price"] = pd.to_numeric(df["price"], errors="coerce")
df = df.dropna(subset=["price"])

# -----------------------------
# PRECOMPUTE (IMPORTANT OPTIMIZATION)
# -----------------------------
min_price_map = df.groupby("item")["price"].min().to_dict()
store_map = df.groupby("item").apply(lambda x: x.loc[x["price"].idxmin()]).to_dict("index")

# -----------------------------
# SESSION STATE
# -----------------------------
if "cart" not in st.session_state:
    st.session_state.cart = {}

# -----------------------------
# SEARCH
# -----------------------------
search = st.text_input("🔍 Search Item")

filtered = df[df["item"].str.contains(search, case=False)] if search else df

# -----------------------------
# METRICS
# -----------------------------
col1, col2, col3 = st.columns(3)
col1.metric("Items", filtered["item"].nunique())
col2.metric("Stores", filtered["store"].nunique())
col3.metric("Records", len(filtered))

# -----------------------------
# ADD TO CART (SAFE)
# -----------------------------
st.subheader("📦 Items")

for item in filtered["item"].unique():
    item_data = filtered[filtered["item"] == item]

    best_row = item_data.loc[item_data["price"].idxmin()]
    best_store = best_row["store"]
    best_price = float(best_row["price"])

    col1, col2, col3 = st.columns([3, 2, 2])

    col1.write(f"**{item.upper()}**")
    col2.write(f"🏪 {best_store} - ₹{best_price}")

    if col3.button("Add", key=item):
        if item in st.session_state.cart:
            st.session_state.cart[item]["qty"] += 1
        else:
            st.session_state.cart[item] = {
                "store": best_store,
                "price": best_price,
                "qty": 1
            }

# -----------------------------
# CART
# -----------------------------
st.subheader("🛒 Cart")

if st.session_state.cart:

    cart_items = []
    total = 0

    for item, data in st.session_state.cart.items():
        item_total = data["price"] * data["qty"]
        total += item_total

        cart_items.append({
            "item": item,
            "store": data["store"],
            "price": data["price"],
            "qty": data["qty"],
            "total": item_total
        })

    cart_df = pd.DataFrame(cart_items)

    # BEST POSSIBLE TOTAL
    best_total = sum(min_price_map[i] * st.session_state.cart[i]["qty"] for i in st.session_state.cart)

    savings = total - best_total
    savings_ratio = savings / total if total else 0

    st.metric("Cart Total", f"₹{total}")
    st.metric("Best Possible", f"₹{best_total}")
    st.metric("Savings", f"₹{savings}")

    st.dataframe(cart_df, use_container_width=True)

    # ---------------- AI INSIGHT ----------------
    if savings_ratio > 0.2:
        st.success("🔥 Strong optimization: Switch stores for big savings")
    elif savings_ratio > 0.05:
        st.info("⚡ Moderate savings available")
    else:
        st.success("✅ Already optimized cart")

else:
    st.warning("Cart is empty")

# -----------------------------
# STORE COMPARISON
# -----------------------------
st.subheader("🏪 Store Comparison")

comparison = df.groupby(["item", "store"])["price"].min().reset_index()
st.dataframe(comparison, use_container_width=True)

# -----------------------------
# RAW DATA
# -----------------------------
st.subheader("📄 Raw Data")
st.dataframe(filtered, use_container_width=True)