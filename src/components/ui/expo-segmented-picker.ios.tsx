import React, { useMemo } from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Host, Picker, Text } from "@expo/ui/swift-ui";
import { disabled, frame, pickerStyle, tag, tint } from "@expo/ui/swift-ui/modifiers";

export type ExpoSegmentedPickerOption = {
  id: string;
  label: string;
};

export type ExpoSegmentedPickerProps = {
  options: ExpoSegmentedPickerOption[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function ExpoSegmentedPicker({
  options,
  selectedId,
  onChange,
  disabled: isDisabled,
  accentColor,
  style,
  onLayout,
}: ExpoSegmentedPickerProps) {
  const selection =
    options.find((option) => option.id === selectedId)?.id ??
    options[0]?.id ??
    null;

  const modifiers = useMemo(() => {
    const mods = [pickerStyle("segmented"), frame({ maxWidth: 10000 })];
    if (accentColor) {
      mods.push(tint(accentColor));
    }
    if (isDisabled) {
      mods.push(disabled(true));
    }
    return mods;
  }, [accentColor, isDisabled]);

  return (
    <View style={style} onLayout={onLayout}>
      <Host style={styles.host} matchContents={{ vertical: true }}>
        <Picker
          selection={selection}
          modifiers={modifiers}
          onSelectionChange={(next) => {
            if (next === null || next === undefined) return;
            onChange(String(next));
          }}
        >
          {options.map((option) => (
            <Text key={option.id} modifiers={[tag(option.id)]}>
              {option.label}
            </Text>
          ))}
        </Picker>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    width: "100%",
  },
});
