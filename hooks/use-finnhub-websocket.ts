import { finnhubWebSocket } from "@/services/finnhubWebSocket";
import { WatchlistItem } from "@/types/finnhub";
import { useEffect, useState } from "react";

interface UseFinnhubWebSocketOptions {
  symbols: string[];
  initialData?: WatchlistItem[];
  enabled?: boolean;
}

export function useFinnhubWebSocket({
  symbols,
  initialData = [],
  enabled = true,
}: UseFinnhubWebSocketOptions) {
  const [stockData, setStockData] = useState<Map<string, WatchlistItem>>(
    new Map(initialData.map((item) => [item.symbol, item]))
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!enabled) {
      if (isConnected) {
        finnhubWebSocket.disconnect();
        setIsConnected(false);
      }
      return;
    }

    if (initialData.length > 0) {
      finnhubWebSocket.initializeStockCache(initialData);
    }

    finnhubWebSocket.connect();
    setIsConnected(true);

    const extendedSymbols = [...symbols.slice(0, 3), "AAPL", "MSFT"];

    const uniqueSymbols = [...new Set(extendedSymbols)];
    finnhubWebSocket.subscribeToSymbols(uniqueSymbols);

    const subscription = finnhubWebSocket.stockUpdates$.subscribe(
      (updatedStock: WatchlistItem) => {
        if (updatedStock.symbol === "SYSTEM") {
          if (updatedStock.name === "Rate Limited") {
            setIsRateLimited(true);
            setIsConnected(false);
            setIsError(false);
            return;
          } else if (updatedStock.name === "Error") {
            setIsError(true);
            setIsConnected(false);
            setIsRateLimited(false);
            return;
          } else if (updatedStock.name === "Connected") {
            setIsConnected(true);
            setIsRateLimited(false);
            setIsError(false);
            return;
          }
        }

        setIsRateLimited(false);
        setIsConnected(true);
        setIsError(false);

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
  }, [symbols.join(","), enabled]);

  const stocksArray = Array.from(stockData.values());

  return {
    stocks: stocksArray,
    isConnected: enabled && isConnected,
    isRateLimited: enabled && isRateLimited,
    isError: enabled && isError,
  };
}
