import { TestAlertButton } from "@/components/test-alert-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/AuthContext";
import {
  defaultWatchlistSymbols,
  fetchWatchlistData,
} from "@/services/finnhubApi";
import { WatchlistItem } from "@/types/finnhub";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./alert.styles";

interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  price: number;
}

export default function AlertScreen() {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [priceAlert, setPriceAlert] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  async function loadWatchlistData() {
    try {
      setIsLoading(true);
      const data = await fetchWatchlistData(defaultWatchlistSymbols);
      setWatchlistItems(data);
      if (data.length > 0 && !selectedStock) {
        setSelectedStock(data[0].symbol);
      }
    } catch (error) {
      console.error("Error loading watchlist data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadWatchlistData();
    setRefreshing(false);
  }

  useEffect(() => {
    loadWatchlistData();
  }, []);

  const handleAddAlert = () => {
    if (!selectedStock || !priceAlert) {
      Alert.alert("Error", "Please select a stock and enter a price alert");
      return;
    }

    const price = parseFloat(priceAlert);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    const selectedStockData = watchlistItems.find(
      (item) => item.symbol === selectedStock
    );

    if (!selectedStockData) {
      Alert.alert("Error", "Selected stock not found");
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: selectedStock,
      name: selectedStockData.name,
      price: price,
    };

    setAlerts([...alerts, newAlert]);
    setPriceAlert("");
    Alert.alert("Success", "Price alert added successfully");
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const renderStockItem = ({ item }: { item: WatchlistItem }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedStock(item.symbol);
        setDropdownOpen(false);
      }}
    >
      <ThemedText>
        {item.symbol} - {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderAlertItem = ({ item }: { item: PriceAlert }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertInfo}>
        <ThemedText type="defaultSemiBold" style={styles.alertStock}>
          {item.symbol} - {item.name}
        </ThemedText>
        <ThemedText style={styles.alertPrice}>
          Alert at ${item.price.toFixed(2)}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteAlert(item.id)}
      >
        <IconSymbol name="trash" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.mainContainer}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/logo/designly.png")}
          style={styles.headerImage}
          contentFit="contain"
        />
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
          <IconSymbol
            size={30}
            name="rectangle.portrait.and.arrow.right"
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <ThemedText type="title" style={styles.title}>
          Add Price Alert
        </ThemedText>

        {isLoading ? (
          <ThemedView style={styles.loadingContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator
                size="small"
                color="#0a7ea4"
                style={{ marginRight: 10 }}
              />
              <ThemedText>Loading stock data...</ThemedText>
            </View>
          </ThemedView>
        ) : (
          <>
            <View style={styles.formContainer}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Select Stock
              </ThemedText>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setDropdownOpen(!dropdownOpen)}
              >
                <ThemedText style={{ color: "#000000" }}>
                  {selectedStock
                    ? `${selectedStock} - ${
                        watchlistItems.find(
                          (item) => item.symbol === selectedStock
                        )?.name || ""
                      }`
                    : "Select a stock"}
                </ThemedText>
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownContainer}>
                  {watchlistItems.map((item) => (
                    <TouchableOpacity
                      key={item.symbol}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedStock(item.symbol);
                        setDropdownOpen(false);
                      }}
                    >
                      <ThemedText style={{ color: "#000000" }}>
                        {item.symbol} - {item.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <ThemedText type="defaultSemiBold" style={styles.label}>
                Price Alert ($)
              </ThemedText>
              <TextInput
                style={[styles.input, { color: "#000000" }]}
                value={priceAlert}
                onChangeText={setPriceAlert}
                placeholder="Enter price for alert"
                keyboardType="numeric"
                placeholderTextColor="#000000"
              />

              <TouchableOpacity style={styles.button} onPress={handleAddAlert}>
                <ThemedText style={styles.buttonText}>Add Alert</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.alertsContainer}>
              <ThemedText type="subtitle" style={styles.alertsTitle}>
                Your Price Alerts
              </ThemedText>

              <TestAlertButton />

              {alerts.length === 0 ? (
                <ThemedView style={styles.emptyAlerts}>
                  <ThemedText>No price alerts set</ThemedText>
                </ThemedView>
              ) : (
                <View>
                  {alerts.map((item) => (
                    <View key={item.id} style={styles.alertCard}>
                      <View style={styles.alertInfo}>
                        <ThemedText
                          type="defaultSemiBold"
                          style={styles.alertStock}
                        >
                          {item.symbol} - {item.name}
                        </ThemedText>
                        <ThemedText style={styles.alertPrice}>
                          Alert at ${item.price.toFixed(2)}
                        </ThemedText>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteAlert(item.id)}
                      >
                        <IconSymbol name="trash" size={20} color="#ff3b30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}
