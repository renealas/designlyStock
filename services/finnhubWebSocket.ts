import { WatchlistItem } from "@/types/finnhub";
import { Subject } from "rxjs";

const API_KEY = "d4jljmhr01qgcb0u1ldgd4jljmhr01qgcb0u1le0";
const WS_URL = `wss://ws.finnhub.io?token=${API_KEY}`;

const USE_MOCK_DATA = true;

export interface TradeData {
  data: Trade[];
  type: string;
}

export interface Trade {
  p: number;
  s: string;
  t: number;
  v: number;
  c: string[];
}

class FinnhubWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private subscribedSymbols: Set<string> = new Set();

  private tradeSubject = new Subject<Trade>();
  public trades$ = this.tradeSubject.asObservable();

  private stockUpdateSubject = new Subject<WatchlistItem>();
  public stockUpdates$ = this.stockUpdateSubject.asObservable();

  private stockCache: Map<string, WatchlistItem> = new Map();

  constructor() {}

  public connect(): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket is already connected or connecting");
      return;
    }

    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);

      console.log("Connecting to Finnhub WebSocket...");
    } catch (error) {
      console.error("Failed to connect to Finnhub WebSocket:", error);
      this.attemptReconnect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.unsubscribeAll();

      this.socket.close();
      this.socket = null;
      this.subscribedSymbols.clear();
      console.log("Disconnected from Finnhub WebSocket");
    }
  }

  public subscribe(symbol: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not connected. Connecting...");
      this.connect();

      this.subscribedSymbols.add(symbol);
      return;
    }

    const message = JSON.stringify({ type: "subscribe", symbol });
    this.socket.send(message);
    this.subscribedSymbols.add(symbol);
    console.log(`Subscribed to ${symbol}`);

    console.log("Currently subscribed to:", Array.from(this.subscribedSymbols));
  }

  public unsubscribe(symbol: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not connected");
      return;
    }

    const message = JSON.stringify({ type: "unsubscribe", symbol });
    this.socket.send(message);
    this.subscribedSymbols.delete(symbol);
    console.log(`Unsubscribed from ${symbol}`);
  }

  public unsubscribeAll(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not connected");
      return;
    }

    this.subscribedSymbols.forEach((symbol) => {
      const message = JSON.stringify({ type: "unsubscribe", symbol });
      this.socket?.send(message);
    });

    this.subscribedSymbols.clear();
    console.log("Unsubscribed from all symbols");
  }

  public subscribeToSymbols(symbols: string[]): void {
    symbols.forEach((symbol) => this.subscribe(symbol));
  }

  private updateStockCache(trade: Trade): void {
    const symbol = trade.s;
    const currentStock = this.stockCache.get(symbol);

    if (currentStock) {
      const change = trade.p - currentStock.price;
      const percentChange = (change / currentStock.price) * 100;

      const updatedStock: WatchlistItem = {
        ...currentStock,
        price: trade.p,
        change,
        percentChange,
      };

      this.stockCache.set(symbol, updatedStock);
      this.stockUpdateSubject.next(updatedStock);
    } else {
      const newStock: WatchlistItem = {
        symbol,
        name: symbol,
        price: trade.p,
        change: 0,
        percentChange: 0,
      };

      this.stockCache.set(symbol, newStock);
      this.stockUpdateSubject.next(newStock);
      console.log(
        `Added new stock to cache: ${symbol} at $${trade.p.toFixed(2)}`
      );
    }
  }

  public initializeStockCache(stocks: WatchlistItem[]): void {
    stocks.forEach((stock) => {
      this.stockCache.set(stock.symbol, stock);
    });
  }

  private handleOpen(): void {
    console.log("Connected to Finnhub WebSocket");
    this.reconnectAttempts = 0;

    this.stockUpdateSubject.next({
      symbol: "SYSTEM",
      name: "Connected",
      price: 0,
      change: 0,
      percentChange: 0,
    });

    this.subscribedSymbols.forEach((symbol) => {
      const message = JSON.stringify({ type: "subscribe", symbol });
      this.socket?.send(message);
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as TradeData;

      if (message.type === "trade") {
        if (message.data.length > 0) {
          console.log(
            `Received trade data for ${
              message.data[0].s
            }: $${message.data[0].p.toFixed(2)}`
          );
        }

        message.data.forEach((trade) => {
          this.tradeSubject.next(trade);
          this.updateStockCache(trade);
        });
      } else {
        console.log("Received non-trade message:", message.type);

        console.log("Message content:", JSON.stringify(event.data));
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  private handleError(event: Event): void {
    console.error("WebSocket error:", event);

    this.stockUpdateSubject.next({
      symbol: "SYSTEM",
      name: "Error",
      price: 0,
      change: 0,
      percentChange: 0,
    });
  }

  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket closed: ${event.code} ${event.reason}`);
    this.socket = null;

    if (event.code !== 1000 && !event.reason.includes("429")) {
      this.attemptReconnect();
    } else if (event.reason.includes("429")) {
      console.log("Rate limited by Finnhub API. Not attempting to reconnect.");
      this.stockUpdateSubject.next({
        symbol: "SYSTEM",
        name: "Rate Limited",
        price: 0,
        change: 0,
        percentChange: 0,
      });

      if (USE_MOCK_DATA) {
        console.log("Starting mock data generation due to rate limiting");
        this.startMockDataInterval();
      }
    }
  }

  private mockDataInterval: ReturnType<typeof setInterval> | null = null;

  private startMockDataInterval(): void {
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
    }

    console.log("Starting mock data generation");

    this.generateMockDataForAllSymbols();

    this.mockDataInterval = setInterval(() => {
      this.generateMockDataForAllSymbols();
    }, 3000);
  }

  private generateMockDataForAllSymbols(): void {
    if (this.subscribedSymbols.size === 0) {
      const defaultSymbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "META"];
      defaultSymbols.forEach((symbol) => this.generateMockData(symbol));
    } else {
      this.subscribedSymbols.forEach((symbol) => this.generateMockData(symbol));
    }
  }

  private generateMockData(symbol: string): void {
    const currentStock = this.stockCache.get(symbol);

    const basePrice = currentStock
      ? currentStock.price
      : this.getRandomPrice(symbol);

    const changePercent = (Math.random() * 4 - 2) / 100;
    const newPrice = basePrice * (1 + changePercent);

    const mockTrade: Trade = {
      p: newPrice,
      s: symbol,
      t: Date.now(),
      v: Math.floor(Math.random() * 1000) + 100,
      c: [],
    };

    this.tradeSubject.next(mockTrade);
    this.updateStockCache(mockTrade);

    console.log(`Generated mock data for ${symbol}: $${newPrice.toFixed(2)}`);
  }

  private getRandomPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      AAPL: 180,
      MSFT: 350,
      GOOGL: 130,
      AMZN: 140,
      META: 300,
      TSLA: 240,
      NVDA: 450,
      AMD: 120,
      INTC: 40,
      SPY: 450,
      JPM: 160,
      BAC: 35,
    };

    const basePrice = basePrices[symbol] || 100;

    return basePrice * (0.9 + Math.random() * 0.2);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }
}

export const finnhubWebSocket = new FinnhubWebSocketService();
