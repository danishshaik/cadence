import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { colors } from "@theme";
import { useLogMigraine } from "./log-migraine-provider";

const MAX_CHARS = 500;

export function NotesStep() {
  const { formData, updateFormData } = useLogMigraine();

  const handleNotesChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      updateFormData("notes", text || null);
    }
  };

  const charCount = formData.notes?.length || 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Any notes?</Text>
      <Text style={styles.subtitle}>Add any additional details (optional)</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What else was going on? Any patterns you noticed?"
          placeholderTextColor={colors.textTertiary}
          value={formData.notes || ""}
          onChangeText={handleNotesChange}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={MAX_CHARS}
        />
        <Text style={[styles.charCount, charCount >= MAX_CHARS - 50 && styles.charCountWarning]}>
          {charCount}/{MAX_CHARS}
        </Text>
      </View>

      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionTitle}>Things to note:</Text>
        <View style={styles.suggestionList}>
          <Text style={styles.suggestionItem}>• Activities before the attack</Text>
          <Text style={styles.suggestionItem}>• Foods or drinks consumed</Text>
          <Text style={styles.suggestionItem}>• Sleep quality the night before</Text>
          <Text style={styles.suggestionItem}>• Stress levels or emotional state</Text>
          <Text style={styles.suggestionItem}>• Weather or environmental changes</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  input: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 140,
    lineHeight: 24,
  },
  charCount: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: "right",
    marginTop: 8,
  },
  charCountWarning: {
    color: colors.warning,
  },
  suggestionContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
  },
  suggestionTitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  suggestionList: {
    gap: 8,
  },
  suggestionItem: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textTertiary,
    lineHeight: 20,
  },
});
