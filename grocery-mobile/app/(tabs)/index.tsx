import React, {
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  BarChart,
  LineChart,
} from "react-native-chart-kit";

const API_URL =
  "http://192.168.1.109:8000";

export default function HomeScreen() {

  const [groupedData, setGroupedData] =
    useState<any>({});

  const [trendData, setTrendData] =
    useState<number[]>([
      100,
      108,
      115,
      120,
      126,
      130,
      135,
    ]);

  const [loading, setLoading] =
    useState(true);

  const [selectedItem, setSelectedItem] =
    useState("rice");

  const [search, setSearch] =
    useState("");

  const [cart, setCart] =
    useState<any[]>([]);

  const [lastUpdated, setLastUpdated] =
    useState("");

  // =====================================
  // CATEGORY SYSTEM
  // =====================================

  const categories: any = {

    "🥫 Grocery": [
      "rice",
      "atta",
      "bread",
      "tea",
      "coffee",
      "salt",
      "sugar",
      "dal",
      "oil",
      "ghee",
      "butter",
      "jam",
      "biscuits",
      "noodles",
      "pasta",
      "oats",
    ],

    "🥦 Vegetables": [
      "onion",
      "potato",
      "tomato",
      "carrot",
      "cabbage",
      "beans",
      "capsicum",
      "spinach",
      "garlic",
      "ginger",
      "peas",
      "broccoli",
    ],

    "🍎 Fruits": [
      "apple",
      "banana",
      "orange",
      "grapes",
      "watermelon",
      "papaya",
      "mango",
      "pineapple",
    ],

    "🥛 Dairy": [
      "milk",
      "curd",
      "paneer",
      "cheese",
      "yogurt",
    ],

    "🍗 Non Veg": [
      "eggs",
      "chicken",
      "fish",
      "mutton",
    ],

    "🍫 Snacks": [
      "chips",
      "juice",
      "soft drink",
      "ice cream",
      "chocolate",
    ],

    "🧴 Personal Care": [
      "soap",
      "shampoo",
      "toothpaste",
      "face wash",
    ],

  };

  // =====================================
  // LOAD CART
  // =====================================

  useEffect(() => {

    const loadCart = async () => {

      try {

        const saved =
          await AsyncStorage.getItem(
            "cart"
          );

        if (saved) {

          setCart(JSON.parse(saved));

        }

      } catch (err) {

        console.log(err);

      }

    };

    loadCart();

  }, []);

  // =====================================
  // SAVE CART
  // =====================================

  useEffect(() => {

    AsyncStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

  }, [cart]);

  // =====================================
  // FETCH PRICES
  // =====================================

  const fetchPrices = async () => {

    try {

      if (
        Object.keys(groupedData)
          .length === 0
      ) {
        setLoading(true);
      }

      const res = await fetch(
        `${API_URL}/prices/`
      );

      const json =
        await res.json();

      const grouped: any = {};

      json.forEach((item: any) => {

        const itemName =
          item.item
            ?.toLowerCase()
            ?.trim();

        if (!grouped[itemName]) {

          grouped[itemName] = [];

        }

        grouped[itemName].push(item);

      });

      setGroupedData(grouped);

      setLastUpdated(
        new Date().toLocaleTimeString()
      );

      setLoading(false);

    } catch (err) {

      console.log(err);

      Alert.alert(
        "Backend Error",
        "Cannot connect to backend"
      );

      setLoading(false);

    }

  };

  // =====================================
  // FETCH TREND
  // =====================================

  const fetchTrend = async (
    item: string
  ) => {

    try {

      const res = await fetch(
        `${API_URL}/trend/${item}`
      );

      const json =
        await res.json();

      const base =
        Number(
          json?.prediction
        ) || 100;

      setTrendData([
        base - 15,
        base - 10,
        base - 5,
        base,
        base + 5,
        base + 10,
        base + 15,
      ]);

    } catch (err) {

      console.log(err);

    }

  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {

    fetchPrices();

  }, []);

  // =====================================
  // AUTO REFRESH
  // =====================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        fetchPrices();

      }, 60000);

    return () =>
      clearInterval(interval);

  }, []);

  // =====================================
  // TREND UPDATE
  // =====================================

  useEffect(() => {

    if (selectedItem) {

      fetchTrend(selectedItem);

    }

  }, [selectedItem]);

  // =====================================
  // STORES
  // =====================================

  const stores =
    groupedData[selectedItem] || [];

  const cheapest =
    stores.length > 0
      ? stores.reduce(
          (
            min: any,
            current: any
          ) =>
            current.price <
            min.price
              ? current
              : min,
          stores[0]
        )
      : null;

  const prices =
    stores.map((s: any) =>
      Number(s.price)
    ) || [0];

  const highestPrice =
    prices.length > 0
      ? Math.max(...prices)
      : 0;

  const lowestPrice =
    prices.length > 0
      ? Math.min(...prices)
      : 0;

  const savings =
    highestPrice - lowestPrice;

  // =====================================
  // FILTER SEARCH
  // =====================================

  const filteredCategories =
    Object.entries(categories).map(
      ([category, items]: any) => {

        return {
          category,
          items: items.filter(
            (item: string) =>
              item
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
          ),
        };

      }
    );

  // =====================================
  // TOTAL
  // =====================================

  const totalAmount = useMemo(() => {

    return cart.reduce(
      (
        sum: number,
        item: any
      ) =>
        sum +
        item.price *
          item.quantity,
      0
    );

  }, [cart]);

  // =====================================
  // ADD TO CART
  // =====================================

  const addToCart = () => {

    if (!cheapest) {

      Alert.alert(
        "No Item Selected"
      );

      return;

    }

    const exists = cart.find(
      (i) =>
        i.item === selectedItem
    );

    if (exists) {

      const updated =
        cart.map((i) => {

          if (
            i.item === selectedItem
          ) {

            return {
              ...i,
              quantity:
                i.quantity + 1,
            };

          }

          return i;

        });

      setCart(updated);

    } else {

      setCart([
        ...cart,
        {
          item: selectedItem,
          store:
            cheapest.store,
          price:
            cheapest.price,
          quantity: 1,
        },
      ]);

    }

    Alert.alert(
      "Added To Cart",
      `${selectedItem.toUpperCase()} added`
    );

  };

  // =====================================
  // QUANTITY
  // =====================================

  const increaseQty = (
    index: number
  ) => {

    const updated = [...cart];

    updated[index].quantity += 1;

    setCart(updated);

  };

  const decreaseQty = (
    index: number
  ) => {

    const updated = [...cart];

    updated[index].quantity -= 1;

    const filtered =
      updated.filter(
        (i) => i.quantity > 0
      );

    setCart(filtered);

  };

  const removeItem = (
    index: number
  ) => {

    const updated =
      cart.filter(
        (_, i) => i !== index
      );

    setCart(updated);

  };

  // =====================================
  // BUY LINKS
  // =====================================

  const getStoreLink = (
    store: string
  ) => {

    switch (store) {

      case "BigBasket":
        return `https://www.bigbasket.com/ps/?q=${selectedItem}`;

      case "Blinkit":
        return `https://blinkit.com/s/?q=${selectedItem}`;

      case "Zepto":
        return `https://www.zeptonow.com/search?query=${selectedItem}`;

      case "Instamart":
        return `https://www.swiggy.com/instamart/search?query=${selectedItem}`;

      default:
        return `https://www.google.com/search?q=${selectedItem}`;

    }

  };

  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#10b981"
        />

        <Text style={styles.loadingText}>
          Loading AI Grocery Data...
        </Text>

      </View>

    );

  }

  // =====================================
  // UI
  // =====================================

  return (

    <View style={styles.mainContainer}>

      {/* SIDEBAR */}

      <ScrollView style={styles.sidebar}>

        <Text style={styles.logo}>
          🛒 ARUNA AI
        </Text>

        <TextInput
          placeholder="Search item..."
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        {filteredCategories.map(
          (
            {
              category,
              items,
            }: any,
            index: number
          ) => (

            <View key={index}>

              <Text
                style={
                  styles.categoryTitle
                }
              >
                {category}
              </Text>

              {items.map(
                (
                  item: string,
                  idx: number
                ) => (

                  <TouchableOpacity
                    key={idx}
                    style={
                      item ===
                      selectedItem
                        ? styles.activeItem
                        : styles.itemButton
                    }
                    onPress={() =>
                      setSelectedItem(
                        item
                      )
                    }
                  >

                    <Text
                      style={
                        styles.itemText
                      }
                    >
                      {item.toUpperCase()}
                    </Text>

                  </TouchableOpacity>

                )
              )}

            </View>

          )
        )}

      </ScrollView>

      {/* MAIN */}

      <ScrollView style={styles.container}>

        <Text style={styles.title}>
          🤖 AI Grocery Intelligence
        </Text>

        <Text style={styles.subtitle}>
          Live grocery comparison
        </Text>

        <Text style={styles.updated}>
          Updated: {lastUpdated}
        </Text>

        {/* SUMMARY */}

        <View style={styles.summaryRow}>

          <View style={styles.summaryCard}>

            <Text style={styles.summaryLabel}>
              Lowest Price
            </Text>

            <Text style={styles.summaryValue}>
              ₹{lowestPrice}
            </Text>

          </View>

          <View style={styles.summaryCard}>

            <Text style={styles.summaryLabel}>
              Savings
            </Text>

            <Text style={styles.summaryValue}>
              ₹{savings}
            </Text>

          </View>

          <View style={styles.summaryCard}>

            <Text style={styles.summaryLabel}>
              Platforms
            </Text>

            <Text style={styles.summaryValue}>
              {stores.length}
            </Text>

          </View>

        </View>

        {/* REFRESH BUTTON */}

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchPrices}
        >

          <Text style={styles.refreshText}>
            🔄 Refresh Prices
          </Text>

        </TouchableOpacity>

        {/* BAR CHART */}

        <Text style={styles.sectionTitle}>
          📊 Store Comparison
        </Text>

        {stores.length > 0 && (

          <BarChart
            data={{
              labels: stores.map(
                (s: any) =>
                  s.store
              ),
              datasets: [
                {
                  data: stores.map(
                    (s: any) =>
                      Number(
                        s.price
                      )
                  ),
                },
              ],
            }}
            width={
              Dimensions.get(
                "window"
              ).width - 140
            }
            height={250}
            yAxisLabel="₹"
            chartConfig={{
              backgroundGradientFrom:
                "#ffffff",
              backgroundGradientTo:
                "#ffffff",
              decimalPlaces: 0,
              color: (
                opacity = 1
              ) =>
                `rgba(16,185,129,${opacity})`,
              labelColor: () =>
                "#111827",
            }}
            style={{
              borderRadius: 18,
              marginVertical: 12,
            }}
          />

        )}

        {/* TREND */}

        <Text style={styles.sectionTitle}>
          📈 AI Trend Prediction
        </Text>

        <LineChart
          data={{
            labels: [
              "D1",
              "D2",
              "D3",
              "D4",
              "D5",
              "D6",
              "D7",
            ],
            datasets: [
              {
                data: trendData,
              },
            ],
          }}
          width={
            Dimensions.get(
              "window"
            ).width - 140
          }
          height={240}
          yAxisLabel="₹"
          chartConfig={{
            backgroundGradientFrom:
              "#ffffff",
            backgroundGradientTo:
              "#ffffff",
            decimalPlaces: 0,
            color: (
              opacity = 1
            ) =>
              `rgba(59,130,246,${opacity})`,
            labelColor: () =>
              "#111827",
          }}
          bezier
        />

        {/* AI BOX */}

        <View style={styles.aiBox}>

          <Text style={styles.aiTitle}>
            🤖 AI Recommendation
          </Text>

          <Text>
            🏪 Best Store:
            {" "}
            {cheapest?.store || "N/A"}
          </Text>

          <Text>
            💰 Predicted Price:
            {" "}
            ₹
            {cheapest?.prediction || 0}
          </Text>

          <Text>
            🎯 Confidence:
            {" "}
            {cheapest?.confidence || 0}
            %
          </Text>

          <Text>
            📈 Demand Score:
            {" "}
            {cheapest?.demand_score || 0}
          </Text>

          <Text>
            🚚 Delivery:
            {" "}
            {cheapest?.delivery || 0}
            mins
          </Text>

          <Text>
            ⭐ Rating:
            {" "}
            {cheapest?.rating || 0}
          </Text>

        </View>

        {/* STORE LIST */}

        <View style={styles.card}>

          <Text style={styles.itemTitle}>
            {selectedItem.toUpperCase()}
          </Text>

          {stores.map(
            (
              store: any,
              index: number
            ) => (

              <View
                key={index}
                style={styles.cardRow}
              >

                <View>

                  <Text style={styles.store}>
                    {store.store}
                  </Text>

                  <Text>
                    🚚 Delivery:
                    {" "}
                    {store.delivery}
                    mins
                  </Text>

                  <Text>
                    ⭐ Rating:
                    {" "}
                    {store.rating}
                  </Text>

                  <Text>
                    📦
                    {" "}
                    {store.stock}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        getStoreLink(
                          store.store
                        )
                      )
                    }
                  >

                    <Text style={styles.buy}>
                      🛒 Buy Now
                    </Text>

                  </TouchableOpacity>

                </View>

                <View>

                  <Text style={styles.price}>
                    ₹ {store.price}
                  </Text>

                  {store.store ===
                    cheapest?.store && (

                    <Text
                      style={
                        styles.bestDeal
                      }
                    >
                      🏆 BEST DEAL
                    </Text>

                  )}

                </View>

              </View>

            )
          )}

          <TouchableOpacity
            style={styles.cartButton}
            onPress={addToCart}
          >

            <Text
              style={
                styles.cartButtonText
              }
            >
              ➕ Add To Cart
            </Text>

          </TouchableOpacity>

        </View>

        {/* CART */}

        <View style={styles.cartBox}>

          <Text style={styles.cartTitle}>
            🛍️ Shopping Cart
          </Text>

          {cart.length === 0 && (

            <Text>
              No items added
            </Text>

          )}

          {cart.map(
            (
              item: any,
              index: number
            ) => (

              <View
                key={index}
                style={styles.cartRow}
              >

                <View>

                  <Text
                    style={
                      styles.cartItem
                    }
                  >
                    {item.item.toUpperCase()}
                  </Text>

                  <Text>
                    🏪 {item.store}
                  </Text>

                </View>

                <View
                  style={
                    styles.cartRight
                  }
                >

                  <Text
                    style={
                      styles.cartPrice
                    }
                  >
                    ₹
                    {item.price *
                      item.quantity}
                  </Text>

                  <View
                    style={
                      styles.qtyButtons
                    }
                  >

                    <TouchableOpacity
                      style={
                        styles.qtyBtn
                      }
                      onPress={() =>
                        increaseQty(
                          index
                        )
                      }
                    >

                      <Text>
                        +
                      </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                      style={
                        styles.qtyBtn
                      }
                      onPress={() =>
                        decreaseQty(
                          index
                        )
                      }
                    >

                      <Text>
                        -
                      </Text>

                    </TouchableOpacity>

                  </View>

                  <TouchableOpacity
                    style={
                      styles.deleteBtn
                    }
                    onPress={() =>
                      removeItem(
                        index
                      )
                    }
                  >

                    <Text
                      style={
                        styles.deleteText
                      }
                    >
                      Remove
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            )
          )}

          <Text style={styles.total}>
            Total Amount:
            {" "}
            ₹{totalAmount}
          </Text>

        </View>

      </ScrollView>

    </View>

  );

}

const styles = StyleSheet.create({

  mainContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#eef2ff",
  },

  sidebar: {
    width: "24%",
    backgroundColor: "#0f172a",
    padding: 12,
  },

  container: {
    width: "76%",
    padding: 12,
  },

  logo: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },

  searchInput: {
    backgroundColor: "#1e293b",
    color: "white",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  categoryTitle: {
    color: "#22c55e",
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },

  itemButton: {
    backgroundColor: "#334155",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },

  activeItem: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },

  itemText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#64748b",
  },

  updated: {
    marginTop: 4,
    marginBottom: 14,
    color: "#64748b",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  summaryCard: {
    backgroundColor: "white",
    width: "31%",
    padding: 16,
    borderRadius: 16,
  },

  summaryLabel: {
    color: "#64748b",
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
  },

  refreshBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },

  refreshText: {
    color: "white",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  aiBox: {
    backgroundColor: "#ecfeff",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
  },

  aiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
  },

  itemTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
    marginBottom: 12,
  },

  store: {
    fontWeight: "bold",
    fontSize: 18,
  },

  buy: {
    color: "#2563eb",
    fontWeight: "bold",
    marginTop: 6,
  },

  price: {
    color: "green",
    fontWeight: "bold",
    fontSize: 28,
  },

  bestDeal: {
    color: "orange",
    fontWeight: "bold",
  },

  cartButton: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 14,
  },

  cartButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  cartBox: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    marginBottom: 40,
  },

  cartTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 14,
  },

  cartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  cartItem: {
    fontWeight: "bold",
    fontSize: 16,
  },

  cartRight: {
    alignItems: "flex-end",
  },

  cartPrice: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
  },

  qtyButtons: {
    flexDirection: "row",
    marginTop: 6,
  },

  qtyBtn: {
    width: 30,
    height: 30,
    backgroundColor: "#10b981",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 8,
  },

  deleteText: {
    color: "white",
    fontWeight: "bold",
  },

  total: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 12,
  },

  loadingText: {
    marginTop: 12,
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

});