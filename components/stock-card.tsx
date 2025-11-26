import { WatchlistItem } from "@/types/finnhub";
import { TouchableOpacity } from "react-native";
import { styles } from "./stock-card.styles";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

interface StockCardProps {
  stock: WatchlistItem;
  onPress?: () => void;
}

export function StockCard({ stock, onPress }: StockCardProps) {
  const isPositive = stock.percentChange >= 0;
  const changeColor = isPositive ? "#4CAF50" : "#F44336";
  const changeIcon = isPositive ? "arrow.up" : "arrow.down";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        <ThemedView style={styles.leftContent}>
          <ThemedText type="defaultSemiBold" style={styles.symbol}>
            {stock.symbol}
          </ThemedText>
          <ThemedText style={styles.name} numberOfLines={1}>
            {stock.name}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.rightContent}>
          <ThemedText type="defaultSemiBold" style={styles.price}>
            ${stock.price.toFixed(2)}
          </ThemedText>
          <ThemedView style={styles.changeContainer}>
            <IconSymbol
              name={changeIcon}
              size={12}
              color={changeColor}
              style={styles.changeIcon}
            />
            <ThemedText style={[styles.change, { color: changeColor }]}>
              {Math.abs(stock.percentChange).toFixed(2)}%
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}
