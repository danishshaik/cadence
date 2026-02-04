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
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  backgroundColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: ScrollViewProps;
  scrollEnabled?: boolean;
}

export function FlowScaffold({
  header,
  children,
  footer,
  backgroundColor,
  contentContainerStyle,
  scrollViewProps,
  scrollEnabled = true,
}: FlowScaffoldProps) {
  return (
    <View style={[styles.container, backgroundColor && { backgroundColor }]}>
      {header}
      {scrollEnabled ? (
        <ScrollView
          style={styles.scroll}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContentContainer, contentContainerStyle]}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.staticContentContainer, contentContainerStyle]}>{children}</View>
      )}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  staticContentContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
