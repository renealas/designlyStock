import { WatchlistItem } from "@/types/finnhub";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PriceAlert {
  symbol: string;
  targetPrice: number;
  isAbove: boolean;
  isActive: boolean;
  id: string;
}

class NotificationService {
  private alerts: Map<string, PriceAlert> = new Map();

  constructor() {
    this.requestPermissions();
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return false;
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("stock-alerts", {
        name: "Stock Price Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return true;
  }

  addAlert(alert: PriceAlert): void {
    this.alerts.set(alert.id, alert);
    console.log(
      `Added price alert for ${alert.symbol} at $${alert.targetPrice}`
    );
  }

  removeAlert(id: string): void {
    if (this.alerts.has(id)) {
      this.alerts.delete(id);
      console.log(`Removed price alert with ID: ${id}`);
    }
  }

  updateAlert(alert: PriceAlert): void {
    if (this.alerts.has(alert.id)) {
      this.alerts.set(alert.id, alert);
      console.log(
        `Updated price alert for ${alert.symbol} at $${alert.targetPrice}`
      );
    }
  }

  getAlerts(): PriceAlert[] {
    return Array.from(this.alerts.values());
  }

  checkPriceAlerts(stock: WatchlistItem): void {
    const activeAlerts = Array.from(this.alerts.values()).filter(
      (alert) => alert.isActive && alert.symbol === stock.symbol
    );

    for (const alert of activeAlerts) {
      const currentPrice = stock.price;
      const shouldTrigger = alert.isAbove
        ? currentPrice > alert.targetPrice
        : currentPrice < alert.targetPrice;

      if (shouldTrigger) {
        this.sendPriceAlertNotification(stock, alert);
      }
    }
  }

  async sendPriceAlertNotification(
    stock: WatchlistItem,
    alert: PriceAlert
  ): Promise<void> {
    const direction = alert.isAbove ? "above" : "below";

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${stock.symbol} Price Alert!`,
        body: `${stock.symbol} is now ${direction} $${alert.targetPrice.toFixed(
          2
        )} at $${stock.price.toFixed(2)}`,
        data: { stock, alert },
      },
      trigger: null,
    });

    console.log(`Sent notification for ${stock.symbol} price alert`);
  }
}

export const notificationService = new NotificationService();
