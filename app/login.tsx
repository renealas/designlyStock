import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image } from "react-native";
import { styles } from "./login.styles";

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
