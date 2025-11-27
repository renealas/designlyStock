import {
  notificationService,
  PriceAlert,
} from "@/services/notificationService";
import { WatchlistItem } from "@/types/finnhub";
import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PriceAlertManagerProps {
  stock: WatchlistItem;
}

export function PriceAlertManager({ stock }: PriceAlertManagerProps) {
  const [targetPrice, setTargetPrice] = useState("");
  const [isAbove, setIsAbove] = useState(true);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    refreshAlerts();
  }, []);

  const refreshAlerts = () => {
    const allAlerts = notificationService.getAlerts();
    const stockAlerts = allAlerts.filter(
      (alert) => alert.symbol === stock.symbol
    );
    setAlerts(stockAlerts);
  };

  const addAlert = () => {
    if (!targetPrice || isNaN(Number(targetPrice))) {
      return;
    }

    const price = parseFloat(targetPrice);
    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: stock.symbol,
      targetPrice: price,
      isAbove,
      isActive: true,
    };

    notificationService.addAlert(alert);
    setTargetPrice("");
    refreshAlerts();
  };

  const toggleAlertStatus = (alert: PriceAlert) => {
    const updatedAlert = {
      ...alert,
      isActive: !alert.isActive,
    };
    notificationService.updateAlert(updatedAlert);
    refreshAlerts();
  };

  const removeAlert = (id: string) => {
    notificationService.removeAlert(id);
    refreshAlerts();
  };

  const renderAlertItem = ({ item }: { item: PriceAlert }) => (
    <View style={styles.alertItem}>
      <View style={styles.alertInfo}>
        <Text style={styles.alertText}>
          {item.isAbove ? "Above" : "Below"} ${item.targetPrice.toFixed(2)}
        </Text>
        <Switch
          value={item.isActive}
          onValueChange={() => toggleAlertStatus(item)}
        />
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeAlert(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price Alerts for {stock.symbol}</Text>
      <Text style={styles.currentPrice}>
        Current Price: ${stock.price.toFixed(2)}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={targetPrice}
          onChangeText={setTargetPrice}
          placeholder="Target Price"
          keyboardType="numeric"
        />
        <View style={styles.directionContainer}>
          <Text>Alert when price is:</Text>
          <View style={styles.directionButtons}>
            <TouchableOpacity
              style={[
                styles.directionButton,
                isAbove && styles.directionButtonActive,
              ]}
              onPress={() => setIsAbove(true)}
            >
              <Text
                style={[
                  styles.directionButtonText,
                  isAbove && styles.directionButtonTextActive,
                ]}
              >
                Above
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.directionButton,
                !isAbove && styles.directionButtonActive,
              ]}
              onPress={() => setIsAbove(false)}
            >
              <Text
                style={[
                  styles.directionButtonText,
                  !isAbove && styles.directionButtonTextActive,
                ]}
              >
                Below
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Button title="Add Alert" onPress={addAlert} />
      </View>

      <Text style={styles.alertsTitle}>Active Alerts</Text>
      {alerts.length === 0 ? (
        <Text style={styles.noAlertsText}>No alerts set for this stock</Text>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={(item) => item.id}
          style={styles.alertsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  directionContainer: {
    marginBottom: 16,
  },
  directionButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  directionButton: {
    flex: 1,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  directionButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  directionButtonText: {
    color: "#000",
  },
  directionButtonTextActive: {
    color: "#fff",
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  alertsList: {
    maxHeight: 200,
  },
  alertItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  alertInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertText: {
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
  },
  noAlertsText: {
    fontStyle: "italic",
    color: "#666",
    marginTop: 8,
  },
});
