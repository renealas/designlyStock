import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#ffffff",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#ffffff",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  message: {
    fontSize: 14,
    marginTop: 8,
    color: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    paddingTop: 8,
  },
  highlight: {
    fontWeight: "bold",
    color: "#ffffff",
  },
  connectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  connectingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFC107",
    marginRight: 5,
  },
  rateLimitedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F44336",
    marginRight: 6,
  },
  disconnectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFC107",
    marginRight: 6,
  },
  errorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F44336",
    marginRight: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
