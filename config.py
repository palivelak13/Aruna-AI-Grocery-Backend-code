# ==============================
# SCRAPER CONFIG
# ==============================

ITERATIONS = 3

# ==============================
# STORE SOURCES (EXPANDED)
# ==============================

SOURCES = [
    # 🛒 Major quick commerce
    "https://www.bigbasket.com/ps/?q={}",
    "https://www.blinkit.com/s/?q={}",
    "https://www.zeptonow.com/search?query={}",
    "https://www.swiggy.com/instamart/search?custom_back=true&query={}",

    # 🛍️ E-commerce grocery
    "https://www.amazon.in/s?k={}",
    "https://www.flipkart.com/search?q={}",

    # Optional future expansion (commented ready)
    # "https://www.jiomart.com/search/{}/",
]

# ==============================
# AI SETTINGS (FUTURE READY)
# ==============================

AI_CONFIDENCE_THRESHOLD = 0.7

PRICE_VARIATION_LIMIT = 30  # for simulation/safety fallback

ENABLE_PRICE_PREDICTION = True

ENABLE_TREND_ANALYSIS = True

# ==============================
# SCRAPER SETTINGS
# ==============================

REQUEST_TIMEOUT = 60000

HEADLESS_BROWSER = True

RETRY_ATTEMPTS = 2