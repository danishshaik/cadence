import React from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { Picker } from "@expo/ui/jetpack-compose";

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
  const selectedIndex = options.findIndex((option) => option.id === selectedId);

  return (
    <View style={style} onLayout={onLayout}>
      <Picker
        options={options.map((option) => option.label)}
        selectedIndex={selectedIndex === -1 ? null : selectedIndex}
        color={accentColor}
        onOptionSelected={
          isDisabled
            ? undefined
            : ({ nativeEvent }) => {
                const next = options[nativeEvent.index];
                if (next) {
                  onChange(next.id);
                }
              }
        }
      />
    </View>
  );
}
