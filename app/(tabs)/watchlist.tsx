import { StockCard } from "@/components/stock-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebSocketStatus } from "@/components/websocket-status";
import { useFinnhubWebSocket } from "@/hooks/use-finnhub-websocket";
import {
  defaultWatchlistSymbols,
  fetchWatchlistData,
} from "@/services/finnhubApi";
import { WatchlistItem } from "@/types/finnhub";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Switch,
  View,
} from "react-native";
import { styles } from "./watchlist.styles";

export default function WatchlistScreen() {
  const [initialData, setInitialData] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [staticData, setStaticData] = useState<WatchlistItem[]>([]);

  const extendedWatchlistSymbols = [
    ...defaultWatchlistSymbols,
    "TSLA",
    "NVDA",
    "AMD",
    "INTC",
    "SPY",
    "AMZN",
    "GOOGL",
    "META",
    "JPM",
    "BAC",
  ];

  const uniqueSymbols = [...new Set(extendedWatchlistSymbols)];

  async function loadInitialData() {
    try {
      setIsLoading(true);
      const data = await fetchWatchlistData(uniqueSymbols);
      setInitialData(data);
      setStaticData(data);
    } catch (error) {
      console.error("Error loading watchlist data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const {
    stocks: liveWatchlistItems,
    isConnected,
    isRateLimited,
    isError,
  } = useFinnhubWebSocket({
    symbols: uniqueSymbols,
    initialData,
    enabled: isLiveMode,
  });

  const watchlistItems = isLiveMode ? liveWatchlistItems : staticData;

  async function handleRefresh() {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  const renderStockCard = ({ item }: { item: WatchlistItem }) => (
    <StockCard
      stock={item}
      onPress={() => console.log(`Pressed ${item.symbol}`)}
    />
  );

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
  };

  return (
    <ThemedView style={styles.mainContainer}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/logo/designly.png")}
          style={styles.headerImage}
          contentFit="contain"
        />
      </View>

      <ThemedView style={styles.container}>
        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.title}>
            Watchlist
          </ThemedText>

          <View style={styles.modeSelector}>
            <ThemedText style={styles.modeSelectorText}>
              {isLiveMode ? "Live" : "Static"}
            </ThemedText>
            <Switch
              value={isLiveMode}
              onValueChange={toggleLiveMode}
              trackColor={{ false: "#767577", true: "#0a7ea4" }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        {isLiveMode && <WebSocketStatus />}

        {isLoading && watchlistItems.length === 0 ? (
          <ThemedView style={styles.loadingContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator
                size="small"
                color="#0a7ea4"
                style={{ marginRight: 10 }}
              />
              <ThemedText>Loading stocks...</ThemedText>
            </View>
          </ThemedView>
        ) : (
          <>
            {isLiveMode && isConnected && !isRateLimited && (
              <ThemedView style={styles.connectionStatus}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#4CAF50",
                    marginRight: 6,
                  }}
                />
                <ThemedText style={{ fontSize: 12 }}>Live</ThemedText>
              </ThemedView>
            )}
            {isLiveMode && isRateLimited && (
              <ThemedView
                style={[
                  styles.connectionStatus,
                  { backgroundColor: "rgba(244, 67, 54, 0.1)" },
                ]}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#F44336",
                    marginRight: 6,
                  }}
                />
                <ThemedText style={{ fontSize: 12, color: "#F44336" }}>
                  Rate Limited
                </ThemedText>
              </ThemedView>
            )}
            {isLiveMode && isError && (
              <ThemedView
                style={[
                  styles.connectionStatus,
                  { backgroundColor: "rgba(244, 67, 54, 0.1)" },
                ]}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#F44336",
                    marginRight: 6,
                  }}
                />
                <ThemedText style={{ fontSize: 12, color: "#F44336" }}>
                  Connection Error
                </ThemedText>
              </ThemedView>
            )}
            <FlatList
              data={watchlistItems}
              renderItem={renderStockCard}
              keyExtractor={(item) => item.symbol}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              ListEmptyComponent={
                <ThemedView style={styles.emptyContainer}>
                  <ThemedText>No stocks in watchlist</ThemedText>
                </ThemedView>
              }
            />
          </>
        )}
      </ThemedView>
    </ThemedView>
  );
}
