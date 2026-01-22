import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Keyboard, Text } from "react-native";
import { SymbolView } from "expo-symbols";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { colors, spacing, typography } from "@theme";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const isIOS = process.env.EXPO_OS === "ios";

// Claude-style colors
const CLAUDE_INPUT_BG = "#EBE6DF";
const CLAUDE_ICON_COLOR = "#7C7C7C";
const CLAUDE_TEXT_COLOR = "#3D3929";
const CLAUDE_PLACEHOLDER = "#9B9B8E";
const CLAUDE_VOICE_BG = "#3D3929";

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Chat with Cadence",
}: ChatInputProps) {
  const [text, setText] = useState("");
  const isGlass = isLiquidGlassAvailable();

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText("");
      Keyboard.dismiss();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;
  const Container = isGlass ? GlassView : View;

  return (
    <Container
      {...(isGlass ? { glassEffectStyle: "regular" } : {})}
      style={{
        borderRadius: 26,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
        backgroundColor: isGlass ? undefined : CLAUDE_INPUT_BG,
      }}
    >
      {/* Top row: Text Input */}
      <TextInput
        style={{
          ...typography.body,
          color: CLAUDE_TEXT_COLOR,
          maxHeight: 120,
          minHeight: 24,
          paddingVertical: 0,
          paddingHorizontal: 0,
          fontSize: 17,
          marginBottom: 10,
        }}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={CLAUDE_PLACEHOLDER}
        multiline
        maxLength={2000}
        editable={!disabled}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />

      {/* Bottom row: Action buttons */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left buttons: Plus and History */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {}}
            disabled={disabled}
          >
            <SymbolView
              name="plus"
              size={22}
              tintColor={CLAUDE_ICON_COLOR}
              fallback={<Text selectable style={{ color: CLAUDE_ICON_COLOR, fontSize: 22 }}>+</Text>}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {}}
            disabled={disabled}
          >
            <SymbolView
              name="clock.arrow.circlepath"
              size={22}
              tintColor={CLAUDE_ICON_COLOR}
              fallback={<Text selectable style={{ color: CLAUDE_ICON_COLOR, fontSize: 20 }}>⏱</Text>}
            />
          </TouchableOpacity>
        </View>

        {/* Right buttons: Mic and Voice/Send */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {}}
            disabled={disabled}
          >
            <SymbolView
              name="mic"
              size={22}
              tintColor={CLAUDE_ICON_COLOR}
              fallback={<Text selectable style={{ color: CLAUDE_ICON_COLOR, fontSize: 20 }}>🎙</Text>}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: CLAUDE_VOICE_BG,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={canSend ? handleSend : () => {}}
            disabled={disabled}
          >
            <SymbolView
              name={canSend ? "arrow.up" : "waveform"}
              size={20}
              tintColor="#FFFFFF"
              fallback={
                <Text selectable style={{ color: "#FFFFFF", fontSize: 18 }}>
                  {canSend ? "↑" : "🎵"}
                </Text>
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}
