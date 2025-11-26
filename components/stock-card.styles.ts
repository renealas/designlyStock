import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leftContent: {
    flex: 1,
    justifyContent: "center",
  },
  rightContent: {
    alignItems: "flex-end",
  },
  symbol: {
    fontSize: 18,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    opacity: 0.7,
    maxWidth: "90%",
  },
  price: {
    fontSize: 18,
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeIcon: {
    marginRight: 4,
  },
  change: {
    fontSize: 14,
  },
});
