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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerImage: {
    height: 100,
    width: 100,
    opacity: 1,
    resizeMode: "contain",
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  formContainer: {
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    color: "#ffffff",
  },
  dropdown: {
    height: 50,
    borderColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  dropdownContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffffff",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    height: 50,
    borderColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    backgroundColor: "#ffffff",
    textAlignVertical: "center",
  },
  button: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  alertsContainer: {
    marginTop: 24,
  },
  alertsTitle: {
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertInfo: {
    flex: 1,
  },
  alertStock: {
    marginBottom: 4,
    color: "#000000",
  },
  alertPrice: {
    color: "#0a7ea4",
  },
  deleteButton: {
    padding: 8,
  },
  emptyAlerts: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
