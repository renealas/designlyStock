import { WatchlistItem } from "@/types/finnhub";
import { Subject } from "rxjs";

const API_KEY = "d4jljmhr01qgcb0u1ldgd4jljmhr01qgcb0u1le0";
const WS_URL = `wss://ws.finnhub.io?token=${API_KEY}`;

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
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  private handleError(event: Event): void {
    console.error("WebSocket error:", event);
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
    }
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
