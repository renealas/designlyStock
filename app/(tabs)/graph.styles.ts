import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    height: 180,
    backgroundColor: "#0a7ea4",
    position: "relative",
    overflow: "hidden",
  },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  loadingContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  chartContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartDescription: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  statsContainer: {
    width: "100%",
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  statsTitle: {
    marginBottom: 12,
    color: "#ffffff",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    color: "#ffffff",
  },
});
