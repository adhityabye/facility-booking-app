import { create } from "zustand";
import { deleteItemAsync, setItemAsync, getItemAsync } from "expo-secure-store";

const TOKEN_STORE_KEY = "user-auth-token";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  signIn: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  signIn: async ({ accessToken, refreshToken }) => {
    set({ accessToken, refreshToken, isAuthenticated: true });
    await setItemAsync(
      TOKEN_STORE_KEY,
      JSON.stringify({ accessToken, refreshToken })
    );
  },
  signOut: async () => {
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
    await deleteItemAsync(TOKEN_STORE_KEY);
  },
  hydrate: async () => {
    try {
      const storedTokens = await getItemAsync(TOKEN_STORE_KEY);
      if (storedTokens) {
        const { accessToken, refreshToken } = JSON.parse(storedTokens);
        set({ accessToken, refreshToken, isAuthenticated: true });
      }
    } catch (e) {
      console.error("Failed to hydrate auth state:", e);
    }
  },
}));
