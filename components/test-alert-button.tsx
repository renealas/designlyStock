import {
  notificationService,
  PriceAlert,
} from "@/services/notificationService";
import React from "react";
import { Button, StyleSheet, View } from "react-native";

export function TestAlertButton() {
  const createTestAlert = () => {
    const testStock = {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 180.0,
      change: 5.0,
      percentChange: 2.85,
    };

    const testAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: "AAPL",
      targetPrice: 179.0,
      isAbove: true,
      isActive: true,
    };

    notificationService.addAlert(testAlert);

    notificationService.checkPriceAlerts(testStock);
  };

  return (
    <View style={styles.container}>
      <Button title="Test Price Alert Notification" onPress={createTestAlert} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
  },
});
