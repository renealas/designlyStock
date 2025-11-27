import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  defaultWatchlistSymbols,
  fetchWatchlistData,
} from "@/services/finnhubApi";
import { WatchlistItem } from "@/types/finnhub";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { styles } from "./graph.styles";

export default function GraphScreen() {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadWatchlistData() {
    try {
      setIsLoading(true);
      const data = await fetchWatchlistData(defaultWatchlistSymbols);
      setWatchlistItems(data);
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

  const chartData = {
    labels: watchlistItems.map((item) => item.symbol),
    datasets: [
      {
        data: watchlistItems.map((item) => item.price),
        color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ["Stock Prices"],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#0a7ea4",
    },
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <ThemedView style={styles.mainContainer}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/logo/designly.png")}
          style={styles.headerImage}
          contentFit="contain"
        />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <ThemedText type="title" style={styles.title}>
          Stock Price Graph
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
        ) : watchlistItems.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No stocks in watchlist</ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />

            <ThemedText style={styles.chartDescription}>
              Dollar value of all stocks in your watchlist
            </ThemedText>

            <View style={styles.statsContainer}>
              <ThemedText type="subtitle" style={styles.statsTitle}>
                Portfolio Statistics
              </ThemedText>

              <View style={styles.statRow}>
                <ThemedText style={{ color: "#ffffff" }}>
                  Total Stocks:
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: "#ffffff" }}>
                  {watchlistItems.length}
                </ThemedText>
              </View>

              <View style={styles.statRow}>
                <ThemedText style={{ color: "#ffffff" }}>
                  Highest Value:
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: "#ffffff" }}>
                  $
                  {Math.max(
                    ...watchlistItems.map((item) => item.price)
                  ).toFixed(2)}
                </ThemedText>
              </View>

              <View style={styles.statRow}>
                <ThemedText style={{ color: "#ffffff" }}>
                  Lowest Value:
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: "#ffffff" }}>
                  $
                  {Math.min(
                    ...watchlistItems.map((item) => item.price)
                  ).toFixed(2)}
                </ThemedText>
              </View>

              <View style={styles.statRow}>
                <ThemedText style={{ color: "#ffffff" }}>
                  Average Value:
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: "#ffffff" }}>
                  $
                  {(
                    watchlistItems.reduce((sum, item) => sum + item.price, 0) /
                    watchlistItems.length
                  ).toFixed(2)}
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
