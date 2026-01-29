import React, { ReactNode } from "react";
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface FlowScaffoldProps {
  children: ReactNode;
  footer?: ReactNode;
  backgroundColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: ScrollViewProps;
}

export function FlowScaffold({
  children,
  footer,
  backgroundColor,
  contentContainerStyle,
  scrollViewProps,
}: FlowScaffoldProps) {
  return (
    <View style={[styles.container, backgroundColor && { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  scroll: {
    flex: 1,
  },
});
