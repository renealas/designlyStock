import { WatchlistItem } from "@/types/finnhub";
import React, { useState } from "react";
import { Button, Modal, TouchableOpacity, View } from "react-native";
import { PriceAlertManager } from "./price-alert-manager";
import { styles } from "./stock-card.styles";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

interface StockCardProps {
  stock: WatchlistItem;
  onPress?: () => void;
}

export function StockCard({ stock, onPress }: StockCardProps) {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const isPositive = stock.percentChange >= 0;
  const changeColor = isPositive ? "#4CAF50" : "#F44336";
  const changeIcon = isPositive ? "arrow.up" : "arrow.down";

  const handleAlertPress = () => {
    setShowAlertModal(true);
  };

  return (
    <>
      <ThemedView style={styles.card}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={{ flex: 1 }}
        >
          <ThemedView style={styles.leftContent}>
            <ThemedText type="defaultSemiBold" style={styles.symbol}>
              {stock.symbol}
            </ThemedText>
            <ThemedText style={styles.name} numberOfLines={1}>
              {stock.name}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.rightContent}>
            <ThemedText type="defaultSemiBold" style={styles.price}>
              ${stock.price.toFixed(2)}
            </ThemedText>
            <ThemedView style={styles.changeContainer}>
              <IconSymbol
                name={changeIcon}
                size={12}
                color={changeColor}
                style={styles.changeIcon}
              />
              <ThemedText style={[styles.change, { color: changeColor }]}>
                {Math.abs(stock.percentChange).toFixed(2)}%
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAlertPress} style={{ padding: 8 }}>
          <IconSymbol name="bell" size={18} color="#007AFF" />
        </TouchableOpacity>
      </ThemedView>

      <Modal
        visible={showAlertModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAlertModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
              maxHeight: "80%",
            }}
          >
            <PriceAlertManager stock={stock} />
            <Button title="Close" onPress={() => setShowAlertModal(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}
