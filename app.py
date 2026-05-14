# dashboard/app.py

import streamlit as st
import pandas as pd
import requests
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# =========================================
# CONFIG
# =========================================

st.set_page_config(
    page_title="Aruna AI Grocery Admin",
    layout="wide",
    initial_sidebar_state="expanded"
)

API_URL = "http://localhost:8000"

# =========================================
# STYLES
# =========================================

st.markdown("""
<style>
.main {
    background-color: #f8fafc;
}

.stMetric {
    background: white;
    padding: 15px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.big-title {
    font-size: 40px;
    font-weight: bold;
    color: #111827;
}

.sub-title {
    color: #64748b;
    font-size: 18px;
}
</style>
""", unsafe_allow_html=True)

# =========================================
# HEADER
# =========================================

st.markdown(
    '<p class="big-title">🛒 Aruna AI Grocery Admin</p>',
    unsafe_allow_html=True
)

st.markdown(
    '<p class="sub-title">Production AI Grocery Intelligence Dashboard</p>',
    unsafe_allow_html=True
)

# =========================================
# SAFE API CALL
# =========================================

@st.cache_data(ttl=20)
def load_prices():

    try:

        res = requests.get(
            f"{API_URL}/prices/",
            timeout=10
        )

        res.raise_for_status()

        data = res.json()

        return pd.DataFrame(data)

    except Exception as e:

        st.error(f"Backend Error: {e}")

        return pd.DataFrame()

# =========================================
# LOAD DATA
# =========================================

df = load_prices()

if df.empty:

    st.warning("⚠️ No grocery data available")
    st.stop()

# =========================================
# CLEAN DATA
# =========================================

df["item"] = df["item"].astype(str)
df["store"] = df["store"].astype(str)

df["price"] = pd.to_numeric(
    df["price"],
    errors="coerce"
)

df["rating"] = pd.to_numeric(
    df["rating"],
    errors="coerce"
)

df["delivery"] = pd.to_numeric(
    df["delivery"],
    errors="coerce"
)

df = df.dropna(subset=["price"])

# =========================================
# SIDEBAR
# =========================================

st.sidebar.title("⚙️ Filters")

search = st.sidebar.text_input(
    "🔍 Search Item"
)

selected_store = st.sidebar.selectbox(
    "🏪 Select Store",
    ["All"] + sorted(df["store"].unique().tolist())
)

selected_trend = st.sidebar.selectbox(
    "📈 Trend",
    ["All", "up", "down", "stable"]
)

# =========================================
# FILTERING
# =========================================

filtered = df.copy()

if search:

    filtered = filtered[
        filtered["item"].str.contains(
            search,
            case=False
        )
    ]

if selected_store != "All":

    filtered = filtered[
        filtered["store"] == selected_store
    ]

if selected_trend != "All":

    filtered = filtered[
        filtered["trend"] == selected_trend
    ]

if filtered.empty:

    st.warning("No matching items found")
    st.stop()

# =========================================
# METRICS
# =========================================

total_items = filtered["item"].nunique()

total_stores = filtered["store"].nunique()

avg_price = round(
    filtered["price"].mean(),
    2
)

best_deal = filtered.loc[
    filtered["price"].idxmin()
]

# =========================================
# TOP METRICS
# =========================================

col1, col2, col3, col4 = st.columns(4)

col1.metric(
    "🛍️ Unique Items",
    total_items
)

col2.metric(
    "🏪 Stores",
    total_stores
)

col3.metric(
    "💰 Avg Price",
    f"₹{avg_price}"
)

col4.metric(
    "🔥 Cheapest Item",
    f"{best_deal['item']} ₹{best_deal['price']}"
)

# =========================================
# PRICE DISTRIBUTION
# =========================================

st.subheader("📊 Price Distribution")

price_chart = px.histogram(
    filtered,
    x="price",
    nbins=20,
    title="Product Price Distribution"
)

st.plotly_chart(
    price_chart,
    use_container_width=True
)

# =========================================
# STORE COMPARISON
# =========================================

st.subheader("🏪 Store Price Comparison")

store_avg = (
    filtered
    .groupby("store")["price"]
    .mean()
    .reset_index()
)

store_chart = px.bar(
    store_avg,
    x="store",
    y="price",
    title="Average Store Prices"
)

st.plotly_chart(
    store_chart,
    use_container_width=True
)

# =========================================
# TOP DEALS
# =========================================

st.subheader("🔥 Top AI Deals")

top_deals = filtered.nsmallest(10, "price")

deal_cols = st.columns(2)

with deal_cols[0]:

    st.dataframe(
        top_deals[
            [
                "item",
                "store",
                "price",
                "discount",
                "rating"
            ]
        ],
        use_container_width=True
    )

with deal_cols[1]:

    pie = px.pie(
        top_deals,
        names="store",
        values="price",
        title="Top Deal Stores"
    )

    st.plotly_chart(
        pie,
        use_container_width=True
    )

# =========================================
# AI ANALYTICS
# =========================================

st.subheader("🤖 AI Market Intelligence")

trend_counts = (
    filtered["trend"]
    .value_counts()
    .reset_index()
)

trend_counts.columns = [
    "trend",
    "count"
]

trend_chart = px.bar(
    trend_counts,
    x="trend",
    y="count",
    title="Market Trend Analysis"
)

st.plotly_chart(
    trend_chart,
    use_container_width=True
)

# =========================================
# BEST STORE TABLE
# =========================================

st.subheader("🏆 Best Store Per Item")

best_store_df = (
    filtered
    .sort_values("price")
    .groupby("item")
    .first()
    .reset_index()
)

st.dataframe(
    best_store_df[
        [
            "item",
            "store",
            "price",
            "rating",
            "delivery",
            "trend",
            "stock"
        ]
    ],
    use_container_width=True
)

# =========================================
# LIVE PRICE TABLE
# =========================================

st.subheader("📄 Live Grocery Feed")

st.dataframe(
    filtered.sort_values(
        by="price"
    ),
    use_container_width=True
)

# =========================================
# FOOTER
# =========================================

st.markdown("---")

st.caption(
    f"Last Updated: {datetime.now().strftime('%d %b %Y %I:%M:%S %p')}"
)

st.success(
    "✅ Aruna AI Grocery System Running Successfully"
)