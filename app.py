import streamlit as st
import pandas as pd

# -----------------------------
# PAGE CONFIG
# -----------------------------
st.set_page_config(
    page_title="Aruna-AI-Grocery",
    layout="wide"
)

# -----------------------------
# TITLE
# -----------------------------
st.title("🛒 Aruna-AI-Grocery Dashboard")

# -----------------------------
# FORCE CLEAR CACHE
# -----------------------------
st.cache_data.clear()

# -----------------------------
# LOAD CSV
# -----------------------------
try:
    df = pd.read_csv("store_prices.csv")
except Exception as e:
    st.error(f"CSV Error: {e}")
    st.stop()

# -----------------------------
# SHOW DEBUG
# -----------------------------
st.write("Rows Loaded:", len(df))

# -----------------------------
# EMPTY CHECK
# -----------------------------
if len(df) == 0:
    st.warning("No grocery data found")
    st.stop()

# -----------------------------
# CLEAN DATA
# -----------------------------
df['item'] = df['item'].astype(str)
df['store'] = df['store'].astype(str)

df['price'] = pd.to_numeric(
    df['price'],
    errors='coerce'
)

df = df.dropna(subset=['price'])

# -----------------------------
# SEARCH BAR
# -----------------------------
search = st.text_input(
    "🔍 Search Grocery Item"
)

# -----------------------------
# FILTER
# -----------------------------
if search:
    filtered = df[
        df['item'].str.contains(
            search,
            case=False,
            na=False
        )
    ]
else:
    filtered = df

# -----------------------------
# METRICS
# -----------------------------
col1, col2, col3 = st.columns(3)

col1.metric(
    "Total Records",
    len(filtered)
)

col2.metric(
    "Stores",
    filtered['store'].nunique()
)

col3.metric(
    "Items",
    filtered['item'].nunique()
)

# -----------------------------
# ITEMS
# -----------------------------
st.header("📦 Grocery Items")

st.write(
    filtered['item'].unique()
)

# -----------------------------
# STORE COMPARISON
# -----------------------------
st.header("🏪 Store Comparison")

comparison = filtered.groupby(
    ['item', 'store']
)['price'].mean().reset_index()

st.dataframe(
    comparison,
    use_container_width=True
)

# -----------------------------
# CHEAPEST PRICES
# -----------------------------
st.header("💰 Cheapest Prices")

cheap = comparison.sort_values(
    'price'
).groupby('item').first().reset_index()

st.dataframe(
    cheap,
    use_container_width=True
)

# -----------------------------
# RAW DATA
# -----------------------------
st.header("📄 Raw Data")

st.dataframe(
    filtered,
    use_container_width=True
)