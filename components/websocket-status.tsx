import { finnhubWebSocket } from "@/services/finnhubWebSocket";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { styles } from "./websocket-status.styles";

export function WebSocketStatus() {
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Connecting...");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("N/A");

  useEffect(() => {
    finnhubWebSocket.connect();

    const testSymbols = ["AAPL", "MSFT"];
    finnhubWebSocket.subscribeToSymbols(testSymbols);

    const tradeSubscription = finnhubWebSocket.trades$.subscribe((trade) => {
      const now = new Date();
      setLastMessage(`${trade.s}: $${trade.p.toFixed(2)}`);
      setLastUpdateTime(now.toLocaleTimeString());
      setMessageCount((prev) => prev + 1);
      setConnectionStatus("Connected");
      setIsRateLimited(false);
    });

    const stockSubscription = finnhubWebSocket.stockUpdates$.subscribe(
      (stock) => {
        if (stock.symbol === "SYSTEM" && stock.name === "Rate Limited") {
          setConnectionStatus("Rate Limited");
          setIsRateLimited(true);
        }
      }
    );

    return () => {
      tradeSubscription.unsubscribe();
      stockSubscription.unsubscribe();
    };
  }, []);

  const getStatusDot = () => {
    if (isRateLimited) {
      return <View style={styles.rateLimitedDot} />;
    } else if (connectionStatus === "Connected") {
      return <View style={styles.connectedDot} />;
    } else {
      return <View style={styles.disconnectedDot} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket Connection</Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <View style={styles.statusContainer}>
          {getStatusDot()}
          <Text style={styles.statusValue}>{connectionStatus}</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Messages Received:</Text>
        <Text style={styles.statusValue}>{messageCount}</Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Last Update:</Text>
        <Text style={styles.statusValue}>{lastUpdateTime}</Text>
      </View>

      {lastMessage && !isRateLimited && (
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Last Trade:</Text>
          <Text style={styles.statusValue}>{lastMessage}</Text>
        </View>
      )}

      {isRateLimited && (
        <Text style={styles.message}>
          The Finnhub API is rate limiting our requests. This is normal with the
          free tier API key. Real-time updates are temporarily unavailable.
        </Text>
      )}
    </View>
  );
}
