import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "@/constants/auth0";
import * as AuthSession from "expo-auth-session";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert, BackHandler } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: `https://${AUTH0_DOMAIN}/authorize`,
  tokenEndpoint: `https://${AUTH0_DOMAIN}/oauth/token`,
  revocationEndpoint: `https://${AUTH0_DOMAIN}/oauth/revoke`,
  userInfoEndpoint: `https://${AUTH0_DOMAIN}/userinfo`,
};

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  authError: string | null;
};

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  getAccessToken: async () => null,
  authError: null,
});

const ACCESS_TOKEN_KEY = "auth0.access_token";
const USER_KEY = "auth0.user";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: AUTH0_CLIENT_ID,
      redirectUri: AuthSession.makeRedirectUri({ scheme: "designlystock" }),
      responseType: "token id_token",
      scopes: ["openid", "profile", "email"],
      extraParams: {
        nonce: "nonce",
      },
    },
    discovery
  );

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedAccessToken = await SecureStore.getItemAsync(
          ACCESS_TOKEN_KEY
        );
        const storedUser = await SecureStore.getItemAsync(USER_KEY);

        if (storedAccessToken && storedUser) {
          setAccessToken(storedAccessToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          setAccessToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);

          setTimeout(() => {
            router.replace("/login");
          }, 50);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);

        setTimeout(() => {
          router.replace("/login");
        }, 50);
      }
    };

    loadAuthState();
  }, []);

  useEffect(() => {
    if (result) {
      if (result.type === "success") {
        const { access_token } = result.params;

        const getUserInfo = async () => {
          try {
            setIsLoading(true);

            const response = await fetch(discovery.userInfoEndpoint, {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            });

            const userInfo = await response.json();

            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userInfo));

            setAccessToken(access_token);
            setUser(userInfo);
            setIsAuthenticated(true);
            setAuthError(null);
          } catch (error) {
            console.error("Error fetching user info:", error);
            setAuthError("Failed to fetch user information");

            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            setIsAuthenticated(false);
            setIsLoading(false);

            setTimeout(() => {
              router.replace("/login");
            }, 50);
          } finally {
            setIsLoading(false);
          }
        };

        getUserInfo();
      } else if (result.type === "error" || result.type === "dismiss") {
        console.error(
          "Authentication error or canceled:",
          result.type === "error" ? result.error : "User canceled"
        );

        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);

        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        SecureStore.deleteItemAsync(USER_KEY);

        setIsLoading(false);

        if (
          result.type === "error" &&
          result.error?.message?.includes("denied the request")
        ) {
          setAuthError("Authentication was not granted. Please try again.");
          Alert.alert(
            "Authentication Failed",
            "Authentication was not granted. Please try again.",
            [{ text: "OK" }]
          );
        } else if (result.type === "dismiss") {
          setAuthError("Authentication was canceled. Please try again.");
          Alert.alert(
            "Authentication Canceled",
            "Authentication was canceled. Please try again.",
            [{ text: "OK" }]
          );
        } else if (result.type === "error") {
          setAuthError(
            `Authentication error: ${result.error?.message || "Unknown error"}`
          );
        }

        setTimeout(() => {
          router.replace("/login");
        }, 50);
      }
    }
  }, [result]);

  const login = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Add a back handler to catch hardware back button presses during auth
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          // Reset auth state and navigate to login on back press
          setIsLoading(false);
          setAuthError("Authentication was canceled");
          setTimeout(() => {
            router.replace("/login");
          }, 50);
          return true;
        }
      );

      // Start the auth flow
      const result = await promptAsync();

      // Remove the back handler once auth flow completes
      backHandler.remove();

      // If the result is not success (e.g., user canceled), handle it here
      if (result.type !== "success") {
        setIsLoading(false);
        setAuthError("Authentication was canceled");
        setTimeout(() => {
          router.replace("/login");
        }, 50);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Failed to initiate login process");
      Alert.alert(
        "Login Error",
        "Failed to initiate login process. Please try again.",
        [{ text: "OK" }]
      );
      setIsLoading(false);

      // Ensure we navigate back to login on error
      setTimeout(() => {
        router.replace("/login");
      }, 50);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Clear secure storage
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);

      // Reset auth state
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);

      // Set loading to false before navigation
      setIsLoading(false);

      // Use setTimeout to ensure state updates are processed before navigation
      setTimeout(() => {
        router.replace("/login");
      }, 50);
    } catch (error) {
      console.error("Logout error:", error);
      // Reset auth state
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);

      // Use setTimeout to ensure state updates are processed before navigation
      setTimeout(() => {
        router.replace("/login");
      }, 50);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (accessToken) return accessToken;

    try {
      const storedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      return storedToken;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user,
        login,
        logout,
        getAccessToken,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
