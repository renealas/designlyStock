import { finnhubWebSocket } from "@/services/finnhubWebSocket";
import { WatchlistItem } from "@/types/finnhub";
import { useEffect, useState } from "react";

interface UseFinnhubWebSocketOptions {
  symbols: string[];
  initialData?: WatchlistItem[];
}

export function useFinnhubWebSocket({
  symbols,
  initialData = [],
}: UseFinnhubWebSocketOptions) {
  const [stockData, setStockData] = useState<Map<string, WatchlistItem>>(
    new Map(initialData.map((item) => [item.symbol, item]))
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    if (initialData.length > 0) {
      finnhubWebSocket.initializeStockCache(initialData);
    }

    finnhubWebSocket.connect();
    setIsConnected(true);

    finnhubWebSocket.subscribeToSymbols(symbols);

    const subscription = finnhubWebSocket.stockUpdates$.subscribe(
      (updatedStock) => {
        if (
          updatedStock.symbol === "SYSTEM" &&
          updatedStock.name === "Rate Limited"
        ) {
          setIsRateLimited(true);
          return;
        }

        setIsRateLimited(false);
        setIsConnected(true);

        setStockData((prevData) => {
          const newData = new Map(prevData);
          newData.set(updatedStock.symbol, updatedStock);
          return newData;
        });
      }
    );

    return () => {
      subscription.unsubscribe();

      if (isConnected) {
        finnhubWebSocket.disconnect();
        setIsConnected(false);
      }
    };
  }, [symbols.join(",")]);

  const stocksArray = Array.from(stockData.values());

  return {
    stocks: stocksArray,
    isConnected,
    isRateLimited,
  };
}
