import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
          <Stack.Screen
            name="log-migraine"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="log-gi"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="log-mood"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="log-respiratory"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              headerShown: true,
              headerTitle: "",
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="log-congestion"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              headerShown: true,
              headerTitle: "",
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="log-arthritis"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
              headerShown: true,
              headerTitle: "",
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
