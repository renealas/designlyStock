import { finnhubWebSocket } from "@/services/finnhubWebSocket";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { styles } from "./websocket-status.styles";

export function WebSocketStatus() {
  const [status, setStatus] = useState<string>("Connecting...");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    finnhubWebSocket.connect();

    const testSymbols = ["AAPL", "MSFT"];
    finnhubWebSocket.subscribeToSymbols(testSymbols);

    const tradeSubscription = finnhubWebSocket.trades$.subscribe((trade) => {
      setLastMessage(
        `Symbol: ${trade.s}, Price: ${trade.p}, Time: ${new Date(
          trade.t
        ).toLocaleTimeString()}`
      );
      setMessageCount((prev) => prev + 1);
      setStatus("Connected");
      setIsRateLimited(false);
    });

    const stockSubscription = finnhubWebSocket.stockUpdates$.subscribe(
      (stock) => {
        if (stock.symbol === "SYSTEM" && stock.name === "Rate Limited") {
          setStatus("Rate Limited");
          setIsRateLimited(true);
        }
      }
    );

    return () => {
      tradeSubscription.unsubscribe();
      stockSubscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket Status</Text>
      <Text style={styles.status}>
        Status:{" "}
        <Text
          style={[
            styles.highlight,
            {
              color: isRateLimited
                ? "#F44336"
                : status === "Connected"
                ? "#4CAF50"
                : "#0a7ea4",
            },
          ]}
        >
          {status}
        </Text>
      </Text>
      <Text style={styles.status}>
        Messages Received: <Text style={styles.highlight}>{messageCount}</Text>
      </Text>
      {lastMessage && !isRateLimited && (
        <Text style={styles.message}>
          Last Message: <Text style={styles.highlight}>{lastMessage}</Text>
        </Text>
      )}
      {isRateLimited && (
        <Text style={[styles.message, { color: "#F44336" }]}>
          The Finnhub API is rate limiting our requests. This is normal with the
          free tier API key. Real-time updates are temporarily unavailable.
        </Text>
      )}
    </View>
  );
}
