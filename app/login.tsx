import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function LoginScreen() {
  const { login, isAuthenticated, isLoading, authError } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require("@/assets/logo/designly.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ThemedText style={styles.title}>DesignlyStock</ThemedText>

      {authError && (
        <ThemedText style={styles.errorText}>{authError}</ThemedText>
      )}

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
          style={styles.loader}
        />
      ) : (
        <ThemedView
          style={styles.loginButton}
          darkColor={Colors.dark.tint}
          lightColor={Colors.light.tint}
        >
          <ThemedText
            style={styles.loginButtonText}
            darkColor="#fff"
            lightColor="#fff"
            onPress={handleLogin}
          >
            Login with Auth0
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 20,
    textAlign: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
    resizeMode: "contain",
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  loader: {
    marginTop: 20,
  },
});
