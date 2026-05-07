
import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from streamlit_autorefresh import st_autorefresh

# -----------------------------
# PAGE CONFIG
# -----------------------------
st.set_page_config(
    page_title="AI Grocery Dashboard",
    layout="wide"
)

# -----------------------------
# AUTO REFRESH
# -----------------------------
st_autorefresh(
    interval=60000,
    key="refresh"
)

# -----------------------------
# TITLE
# -----------------------------
st.title("🛒 AI Grocery Dashboard")

# -----------------------------
# LOAD CSV
# -----------------------------
try:

    df = pd.read_csv("store_prices.csv")

except Exception as e:

    st.error(f"CSV Error: {e}")

    st.stop()

# -----------------------------
# EMPTY FILE CHECK
# -----------------------------
if df.empty:

    st.warning("No grocery data available")

    st.stop()

# -----------------------------
# CLEAN DATA
# -----------------------------
df = df.drop_duplicates()

# Ensure price numeric
df['price'] = pd.to_numeric(
    df['price'],
    errors='coerce'
)

df = df.dropna()

# -----------------------------
# SIDEBAR SEARCH
# -----------------------------
st.sidebar.header("🔍 Grocery Search")

search = st.sidebar.text_input(
    "Enter item name",
    ""
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
# AVAILABLE ITEMS
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
# CHEAPEST STORE
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
# GRAPH
# -----------------------------
st.header("📈 Grocery Trends")

fig, ax = plt.subplots(figsize=(10, 5))

for item in filtered['item'].unique():

    item_df = filtered[
        filtered['item'] == item
    ]

    ax.plot(
        item_df.index,
        item_df['price'],
        label=item
    )

ax.set_xlabel("Records")
ax.set_ylabel("Price ₹")

ax.legend()

st.pyplot(
    fig,
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
