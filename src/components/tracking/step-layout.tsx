import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface StepLayoutProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function StepLayout({ children, style }: StepLayoutProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
