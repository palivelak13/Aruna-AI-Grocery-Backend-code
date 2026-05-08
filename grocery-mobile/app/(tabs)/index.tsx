import React, { useEffect, useState } from "react";
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
} from "react-native";

import { BarChart } from "react-native-chart-kit";

export default function HomeScreen() {

  const [groupedData, setGroupedData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {

    fetch("http://192.168.0.100:8000/prices")
      .then((res) => res.json())
      .then((json) => {

        const grouped: any = {};

        json.forEach((item: any) => {

          if (!grouped[item.item]) {
            grouped[item.item] = [];
          }

          grouped[item.item].push({
            ...item,

            delivery:
              Math.floor(Math.random() * 20) + 5,

            stock:
              Math.random() > 0.3
                ? "In Stock"
                : "Low Stock",

            trend:
              Math.random() > 0.5
                ? "Price Dropped"
                : "High Demand",

            rating:
              (Math.random() * 2 + 3).toFixed(1),

          });

        });

        setGroupedData(grouped);

        const firstItem = Object.keys(grouped)[0];

        setSelectedItem(firstItem);

        setLoading(false);

      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });

  }, []);

  if (loading) {

    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );

  }

  const groceryItems = [
    "rice",
    "wheat",
    "dal",
    "bread",
    "tea",
    "coffee",
    "sugar",
    "salt",
    "paneer",
  ];

  const vegetables = [
    "onion",
    "potato",
    "tomato",
    "carrot",
    "apple",
    "banana",
    "orange",
  ];

  const nonVeg = [
    "chicken",
    "eggs",
    "milk",
  ];

  const stores = groupedData[selectedItem] || [];

  const cheapest = stores.reduce(
    (min: any, current: any) =>
      current.price < min.price ? current : min,
    stores[0]
  );

  const prices = stores.map(
    (s: any) => Number(s.price)
  );

  const highestPrice = Math.max(...prices);

  const lowestPrice = Math.min(...prices);

  const savings = highestPrice - lowestPrice;

  const addToCart = () => {

    const itemExists = cart.find(
      (i) => i.item === selectedItem
    );

    if (itemExists) {

      const updatedCart = cart.map((i) => {

        if (i.item === selectedItem) {

          return {
            ...i,
            quantity: i.quantity + 1,
          };

        }

        return i;

      });

      setCart(updatedCart);

    } else {

      setCart([
        ...cart,
        {
          item: selectedItem,
          price: lowestPrice,
          store: cheapest.store,
          quantity: 1,
        },
      ]);

    }

  };

  const filteredGrocery = groceryItems.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVegetables = vegetables.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNonVeg = nonVeg.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const renderItemButton = (item: string) => (

    <TouchableOpacity
      key={item}
      style={
        item === selectedItem
          ? styles.activeItem
          : styles.itemButton
      }
      onPress={() => setSelectedItem(item)}
    >

      <Text
        style={
          item === selectedItem
            ? styles.activeItemText
            : styles.itemText
        }
      >
        {item.toUpperCase()}
      </Text>

    </TouchableOpacity>

  );

  return (

    <View style={styles.mainContainer}>

      {/* SIDEBAR */}

      <ScrollView style={styles.sidebar}>

        <Text style={styles.sidebarMainTitle}>
          🛒 Categories
        </Text>

        <TextInput
          placeholder="Search..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        <Text style={styles.categoryTitle}>
          🥫 Grocery
        </Text>

        {filteredGrocery.map(renderItemButton)}

        <Text style={styles.categoryTitle}>
          🥦 Vegetables
        </Text>

        {filteredVegetables.map(renderItemButton)}

        <Text style={styles.categoryTitle}>
          🍗 Non-Veg
        </Text>

        {filteredNonVeg.map(renderItemButton)}

      </ScrollView>

      {/* MAIN UI */}

      <ScrollView style={styles.container}>

        <Text style={styles.title}>
          🛒 Aruna-AI-Grocery
        </Text>

        <Text style={styles.subtitle}>
          Grocery Price Comparison
        </Text>

        {/* BEST PRICE */}

        <View style={styles.bestPriceCard}>

          <Text style={styles.bestPriceTitle}>
            🔥 Today's Best Price
          </Text>

          <Text style={styles.bestPriceValue}>
            ₹ {lowestPrice}
          </Text>

          <Text style={styles.bestPriceStore}>
            on {cheapest.store}
          </Text>

        </View>

        {/* BAR CHART */}

        <BarChart
          data={{
            labels: stores.map((s: any) => s.store),
            datasets: [
              {
                data: stores.map((s: any) => s.price),
              },
            ],
          }}
          width={Dimensions.get("window").width - 130}
          height={190}
          yAxisLabel="₹"
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) =>
              `rgba(34, 197, 94, ${opacity})`,
            labelColor: () => "#111827",
          }}
          style={{
            borderRadius: 16,
            marginVertical: 10,
          }}
        />

        {/* AI MARKET */}

        <View style={styles.marketBox}>

          <Text style={styles.marketTitle}>
            📊 AI Market Analysis
          </Text>

          <Text style={styles.marketText}>
            {selectedItem.toUpperCase()} prices are currently{" "}
            {savings > 100
              ? "highly volatile"
              : "stable"} across stores.
          </Text>

          <Text style={styles.marketText}>
            Best value currently available on{" "}
            {cheapest.store}.
          </Text>

        </View>

        {/* ITEM CARD */}

        <View style={styles.card}>

          <Text style={styles.selectedTitle}>
            {selectedItem.toUpperCase()}
          </Text>

          {stores.map((store: any, i: number) => (

            <View key={i} style={styles.cardRow}>

              {/* LEFT */}

              <View>

                <Text style={styles.store}>
                  {store.store === "BigBasket"
                    ? "🛒 BigBasket"
                    : "⚡ Blinkit"}
                </Text>

                <Text style={styles.delivery}>
                  🚚 Delivery in {store.delivery} mins
                </Text>

                <Text
                  style={
                    store.stock === "In Stock"
                      ? styles.stockGreen
                      : styles.stockRed
                  }
                >
                  {store.stock === "In Stock"
                    ? "🟢 In Stock"
                    : "🔴 Low Stock"}
                </Text>

                <Text
                  style={
                    store.trend === "Price Dropped"
                      ? styles.priceDrop
                      : styles.highDemand
                  }
                >
                  {store.trend === "Price Dropped"
                    ? "📉 Price Dropped"
                    : "🔥 High Demand"}
                </Text>

                <Text style={styles.rating}>
                  ⭐ {store.rating} Rating
                </Text>

                <TouchableOpacity
                  onPress={() => {

                    const url =
                      store.store === "BigBasket"
                        ? `https://www.bigbasket.com/ps/?q=${selectedItem}`
                        : `https://blinkit.com/s/?q=${selectedItem}`;

                    Linking.openURL(url);

                  }}
                >

                  <Text style={styles.buyLink}>
                    🛍️ Buy Now
                  </Text>

                </TouchableOpacity>

              </View>

              {/* RIGHT */}

              <View style={{ alignItems: "flex-end" }}>

                <Text
                  style={
                    store.store === cheapest.store
                      ? styles.cheapestPrice
                      : styles.price
                  }
                >
                  ₹ {store.price}
                </Text>

                {store.store === cheapest.store && (
                  <Text style={styles.bestDeal}>
                    🏆 BEST DEAL
                  </Text>
                )}

                {store.delivery < 10 && (
                  <Text style={styles.fastDelivery}>
                    ⚡ Fastest Delivery
                  </Text>
                )}

                {store.price === lowestPrice && (
                  <Text style={styles.smartBuy}>
                    💡 Smart Buy Alert
                  </Text>
                )}

              </View>

            </View>

          ))}

          <Text style={styles.cheapest}>
            🏆 Cheapest: {cheapest.store}
          </Text>

          <Text style={styles.savings}>
            💰 Save ₹{savings}
          </Text>

          {/* ADD CART */}

          <TouchableOpacity
            style={styles.cartButton}
            onPress={addToCart}
          >

            <Text style={styles.cartButtonText}>
              🛒 Add To Cart
            </Text>

          </TouchableOpacity>

          {/* AI */}

          <View style={styles.aiBox}>

            <Text style={styles.aiText}>
              🤖 AI Suggestion
            </Text>

            <Text style={styles.aiSubText}>
              Buy {selectedItem.toUpperCase()} from{" "}
              {cheapest.store} and save ₹{savings}
            </Text>

          </View>

          {/* CART */}

          <View style={styles.cartBox}>

            <Text style={styles.cartTitle}>
              🛍️ Shopping Cart
            </Text>

            {cart.length === 0 && (

              <Text style={styles.emptyCart}>
                No items added yet
              </Text>

            )}

            {cart.map((item, index) => (

              <View key={index} style={styles.cartRow}>

                <View>

                  <Text style={styles.cartItem}>
                    {item.item.toUpperCase()}
                  </Text>

                  <Text style={styles.cartStore}>
                    🏪 {item.store}
                  </Text>

                  <Text style={styles.quantityText}>
                    Qty: {item.quantity}
                  </Text>

                </View>

                <View style={styles.cartRight}>

                  <Text style={styles.cartPrice}>
                    ₹ {item.price * item.quantity}
                  </Text>

                  <View style={styles.qtyButtons}>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {

                        const updated = cart.map(
                          (cartItem, i) => {

                            if (i === index) {

                              return {
                                ...cartItem,
                                quantity:
                                  cartItem.quantity + 1,
                              };

                            }

                            return cartItem;

                          }
                        );

                        setCart(updated);

                      }}
                    >

                      <Text style={styles.qtyText}>
                        +
                      </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {

                        const updated = cart
                          .map((cartItem, i) => {

                            if (i === index) {

                              return {
                                ...cartItem,
                                quantity:
                                  cartItem.quantity - 1,
                              };

                            }

                            return cartItem;

                          })
                          .filter(
                            (item) => item.quantity > 0
                          );

                        setCart(updated);

                      }}
                    >

                      <Text style={styles.qtyText}>
                        -
                      </Text>

                    </TouchableOpacity>

                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {

                      const updated =
                        cart.filter(
                          (_, i) => i !== index
                        );

                      setCart(updated);

                    }}
                  >

                    <Text style={styles.deleteText}>
                      ❌ Remove
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            ))}

            {cart.length > 0 && (

              <Text style={styles.totalPrice}>
                Total ₹ {
                  cart.reduce(
                    (sum, item) =>
                      sum +
                      item.price * item.quantity,
                    0
                  )
                }
              </Text>

            )}

          </View>

        </View>

      </ScrollView>

    </View>

  );
}

const styles = StyleSheet.create({

  mainContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
  },

  sidebar: {
    width: "22%",
    backgroundColor: "#0f172a",
    paddingTop: 20,
    paddingHorizontal: 6,
  },

  container: {
    width: "78%",
    padding: 10,
  },

  sidebarMainTitle: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 10,
    marginBottom: 12,
  },

  categoryTitle: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
  },

  itemButton: {
    backgroundColor: "#334155",
    padding: 7,
    borderRadius: 8,
    marginBottom: 6,
  },

  activeItem: {
    backgroundColor: "#10b981",
    padding: 7,
    borderRadius: 8,
    marginBottom: 6,
  },

  itemText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9,
  },

  activeItemText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
  },

  subtitle: {
    color: "#64748b",
    marginBottom: 12,
    fontSize: 12,
  },

  bestPriceCard: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
  },

  bestPriceTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },

  bestPriceValue: {
    color: "#22c55e",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 6,
  },

  bestPriceStore: {
    color: "white",
    marginTop: 4,
  },

  marketBox: {
    backgroundColor: "#ecfeff",
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#06b6d4",
  },

  marketTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
  },

  marketText: {
    color: "#334155",
    marginTop: 2,
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 40,
  },

  selectedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
    marginBottom: 14,
  },

  store: {
    fontSize: 14,
    fontWeight: "bold",
  },

  delivery: {
    color: "#475569",
    fontSize: 11,
    marginTop: 3,
  },

  stockGreen: {
    color: "green",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 3,
  },

  stockRed: {
    color: "red",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 3,
  },

  priceDrop: {
    color: "green",
    fontWeight: "bold",
    fontSize: 11,
    marginTop: 3,
  },

  highDemand: {
    color: "#dc2626",
    fontWeight: "bold",
    fontSize: 11,
    marginTop: 3,
  },

  rating: {
    color: "#f59e0b",
    fontWeight: "bold",
    fontSize: 11,
    marginTop: 3,
  },

  buyLink: {
    marginTop: 5,
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 11,
  },

  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },

  cheapestPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },

  bestDeal: {
    marginTop: 4,
    color: "orange",
    fontWeight: "bold",
    fontSize: 10,
  },

  fastDelivery: {
    color: "#f59e0b",
    fontWeight: "bold",
    fontSize: 10,
    marginTop: 3,
  },

  smartBuy: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 10,
    marginTop: 3,
  },

  cheapest: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
  },

  savings: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 6,
  },

  cartButton: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },

  cartButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  aiBox: {
    backgroundColor: "#ecfeff",
    padding: 14,
    borderRadius: 12,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#06b6d4",
  },

  aiText: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  aiSubText: {
    color: "#334155",
  },

  cartBox: {
    marginTop: 20,
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
  },

  cartTitle: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 12,
  },

  emptyCart: {
    color: "#64748b",
  },

  cartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 10,
    marginBottom: 12,
  },

  cartItem: {
    fontWeight: "bold",
  },

  cartStore: {
    color: "#64748b",
    marginTop: 2,
  },

  quantityText: {
    color: "#475569",
    marginTop: 3,
  },

  cartRight: {
    alignItems: "flex-end",
  },

  cartPrice: {
    color: "green",
    fontWeight: "bold",
    fontSize: 16,
  },

  qtyButtons: {
    flexDirection: "row",
    marginTop: 6,
  },

  qtyBtn: {
    width: 28,
    height: 28,
    backgroundColor: "#10b981",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  qtyText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },

  deleteButton: {
    backgroundColor: "#ef4444",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  deleteText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 11,
  },

  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

});