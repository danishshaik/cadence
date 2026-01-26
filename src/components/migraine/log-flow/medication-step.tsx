import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogMigraine } from "./log-migraine-provider";

export function MedicationStep() {
  const { formData, updateFormData } = useLogMigraine();
  const [newMedName, setNewMedName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleToggleMedication = (taken: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData("medicationTaken", taken);
    if (!taken) {
      updateFormData("medications", []);
    }
  };

  const handleAddMedication = () => {
    if (newMedName.trim()) {
      const newMed = {
        name: newMedName.trim(),
        takenAt: new Date().toISOString(),
      };
      updateFormData("medications", [...formData.medications, newMed]);
      setNewMedName("");
      setShowInput(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemoveMedication = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMeds = formData.medications.filter((_, i) => i !== index);
    updateFormData("medications", newMeds);
  };

  const commonMeds = ["Ibuprofen", "Acetaminophen", "Sumatriptan", "Excedrin", "Aspirin"];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Did you take medication?</Text>
      <Text style={styles.subtitle}>Track what you took for this attack</Text>

      <View style={styles.toggleSection}>
        <Pressable
          onPress={() => handleToggleMedication(true)}
          style={[styles.toggleButton, formData.medicationTaken && styles.toggleButtonSelected]}
        >
          <Text
            style={[styles.toggleText, formData.medicationTaken && styles.toggleTextSelected]}
          >
            Yes
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleToggleMedication(false)}
          style={[styles.toggleButton, !formData.medicationTaken && styles.toggleButtonSelected]}
        >
          <Text
            style={[styles.toggleText, !formData.medicationTaken && styles.toggleTextSelected]}
          >
            No
          </Text>
        </Pressable>
      </View>

      {formData.medicationTaken && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Added medications */}
          {formData.medications.length > 0 && (
            <View style={styles.medList}>
              {formData.medications.map((med, index) => (
                <View key={index} style={styles.medItem}>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medTime}>
                      {new Date(med.takenAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveMedication(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.textTertiary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Add medication section */}
          {showInput ? (
            <View style={styles.inputSection}>
              <TextInput
                style={styles.input}
                placeholder="Medication name"
                placeholderTextColor={colors.textTertiary}
                value={newMedName}
                onChangeText={setNewMedName}
                autoFocus
                onSubmitEditing={handleAddMedication}
                returnKeyType="done"
              />
              <View style={styles.inputActions}>
                <Pressable onPress={() => setShowInput(false)} style={styles.cancelInputButton}>
                  <Text style={styles.cancelInputText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddMedication}
                  style={[styles.addInputButton, !newMedName.trim() && styles.addInputButtonDisabled]}
                  disabled={!newMedName.trim()}
                >
                  <Text style={styles.addInputText}>Add</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {/* Quick add common meds */}
              <Text style={styles.sectionLabel}>QUICK ADD</Text>
              <View style={styles.quickAddGrid}>
                {commonMeds.map((med) => (
                  <Pressable
                    key={med}
                    onPress={() => {
                      updateFormData("medications", [
                        ...formData.medications,
                        { name: med, takenAt: new Date().toISOString() },
                      ]);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={styles.quickAddChip}
                  >
                    <Text style={styles.quickAddText}>{med}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Custom medication button */}
              <Pressable
                onPress={() => setShowInput(true)}
                style={styles.addCustomButton}
              >
                <Ionicons name="add" size={20} color={colors.migraine} />
                <Text style={styles.addCustomText}>Add other medication</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      )}
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
  toggleSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  toggleButtonSelected: {
    backgroundColor: colors.migraineLight,
    borderColor: colors.migraine,
  },
  toggleText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  toggleTextSelected: {
    color: colors.migraine,
  },
  scrollView: {
    flex: 1,
  },
  medList: {
    marginBottom: 24,
    gap: 8,
  },
  medItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  medTime: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  sectionLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    color: colors.textTertiary,
    marginBottom: 12,
  },
  quickAddGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  quickAddChip: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  quickAddText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  addCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.migraineLight,
    borderRadius: 12,
    padding: 16,
  },
  addCustomText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.migraine,
  },
  inputSection: {
    gap: 12,
  },
  input: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    color: colors.textPrimary,
  },
  inputActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelInputButton: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  cancelInputText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  addInputButton: {
    flex: 1,
    backgroundColor: colors.migraine,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  addInputButtonDisabled: {
    opacity: 0.5,
  },
  addInputText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
