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

    const limitedSymbols = symbols.slice(0, 5);
    console.log(
      `Fetching data for ${
        limitedSymbols.length
      } symbols: ${limitedSymbols.join(", ")}`
    );

    for (const symbol of limitedSymbols) {
      try {
        let quote: StockQuote;
        let profile: StockProfile;

        try {
          quote = await fetchStockQuote(symbol);
        } catch (error) {
          console.warn(`Failed to fetch quote for ${symbol}:`, error);
          quote = {
            c: 0,
            d: 0,
            dp: 0,
            h: 0,
            l: 0,
            o: 0,
            pc: 0,
            t: Math.floor(Date.now() / 1000),
          };
        }

        try {
          profile = await fetchStockProfile(symbol);
        } catch (error) {
          console.warn(`Failed to fetch profile for ${symbol}:`, error);
          profile = {
            name: symbol,
            ticker: symbol,
            country: "US",
            currency: "USD",
            exchange: "UNKNOWN",
            ipo: "",
            marketCapitalization: 0,
            shareOutstanding: 0,
            weburl: "",
            phone: "",
            logo: "",
            finnhubIndustry: "Technology",
          };
        }

        watchlistItems.push({
          symbol,
          name: profile.name || symbol,
          price: quote.c,
          change: quote.d,
          percentChange: quote.dp,
        });

        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (symbolError) {
        console.warn(`Skipping symbol ${symbol} due to error:`, symbolError);
      }
    }

    return watchlistItems;
  } catch (error) {
    console.error("Error fetching watchlist data:", error);
    return [];
  }
}

export const defaultWatchlistSymbols = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "META",
];
