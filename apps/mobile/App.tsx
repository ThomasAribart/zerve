import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import Tamagui from "./tamagui.config";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import { navigationLinking } from "./navigation/Links";
import RootNavigator from "./navigation/RootNavigator";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  }
  return (
    <Tamagui.Provider defaultTheme="light">
      <SafeAreaProvider>
        <NavigationContainer
          linking={navigationLinking}
          theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <RootNavigator />
        </NavigationContainer>
        <StatusBar />
      </SafeAreaProvider>
    </Tamagui.Provider>
  );
}
