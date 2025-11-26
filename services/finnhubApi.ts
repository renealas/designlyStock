import {
  StockProfile,
  StockQuote,
  StockSymbol,
  WatchlistItem,
} from "@/types/finnhub";

const API_KEY = "d4jljmhr01qgcb0u1ldgd4jljmhr01qgcb0u1le0";
const BASE_URL = "https://finnhub.io/api/v1";

export async function fetchStockSymbols(
  exchange: string = "US"
): Promise<StockSymbol[]> {
  const response = await fetch(
    `${BASE_URL}/stock/symbol?exchange=${exchange}&token=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch stock symbols: ${response.status}`);
  }

  return response.json();
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const response = await fetch(
    `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch stock quote: ${response.status}`);
  }

  return response.json();
}

export async function fetchStockProfile(symbol: string): Promise<StockProfile> {
  const response = await fetch(
    `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch stock profile: ${response.status}`);
  }

  return response.json();
}

export async function fetchWatchlistData(
  symbols: string[]
): Promise<WatchlistItem[]> {
  try {
    const watchlistItems: WatchlistItem[] = [];

    for (const symbol of symbols) {
      const [quote, profile] = await Promise.all([
        fetchStockQuote(symbol),
        fetchStockProfile(symbol),
      ]);

      watchlistItems.push({
        symbol,
        name: profile.name || symbol,
        price: quote.c,
        change: quote.d,
        percentChange: quote.dp,
      });
    }

    return watchlistItems;
  } catch (error) {
    console.error("Error fetching watchlist data:", error);
    throw error;
  }
}

export const defaultWatchlistSymbols = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "META",
  "TSLA",
  "NVDA",
  "JPM",
];
