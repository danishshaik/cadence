import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@components/ui";
import { colors } from "@theme";

const isIOS = process.env.EXPO_OS === "ios";

export interface MultiSelectCardOption<T extends string = string> {
  id: T;
  title: string;
  subtitle?: string;
  icon: string;
}

export interface MultiSelectCardBadgeConfig {
  enabled?: boolean;
  text?: string;
  icon?: string;
}

interface MultiSelectCardFieldProps<T extends string = string> {
  options: MultiSelectCardOption<T>[];
  selectedIds: T[];
  onToggle: (id: T) => void;
  disabled?: boolean;
  badge?: MultiSelectCardBadgeConfig;
  showSelectionIndicator?: boolean;
  hapticsEnabled?: boolean;
  accentColor?: string;
  accentSoftColor?: string;
  cardBackgroundColor?: string;
  cardBorderColor?: string;
  cardSelectedBorderColor?: string;
  cardSelectedBorderWidth?: number;
  iconMutedColor?: string;
  iconSelectedColor?: string;
  iconBackgroundColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  checkBorderColor?: string;
  checkSelectedColor?: string;
  checkIconColor?: string;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  badgeIconColor?: string;
  titleFontFamily?: string;
  subtitleFontFamily?: string;
  badgeFontFamily?: string;
  containerStyle?: StyleProp<ViewStyle>;
  listStyle?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  subtitleTextStyle?: StyleProp<TextStyle>;
  badgeStyle?: StyleProp<ViewStyle>;
  badgeTextStyle?: StyleProp<TextStyle>;
}

export function MultiSelectCardField<T extends string = string>({
  options,
  selectedIds,
  onToggle,
  disabled,
  badge,
  showSelectionIndicator = true,
  hapticsEnabled = true,
  accentColor = colors.primary,
  accentSoftColor = colors.primaryLight,
  cardBackgroundColor = colors.surface,
  cardBorderColor = colors.border,
  cardSelectedBorderColor = accentColor,
  cardSelectedBorderWidth = 1.5,
  iconMutedColor = colors.textSecondary,
  iconSelectedColor = accentColor,
  iconBackgroundColor = accentSoftColor,
  textPrimaryColor = colors.textPrimary,
  textSecondaryColor = colors.textSecondary,
  checkBorderColor = colors.border,
  checkSelectedColor = accentColor,
  checkIconColor = "#FFFFFF",
  badgeBackgroundColor = accentSoftColor,
  badgeTextColor = accentColor,
  badgeIconColor = accentColor,
  titleFontFamily = isIOS ? "SF Pro Text" : "sans-serif",
  subtitleFontFamily = isIOS ? "SF Pro Text" : "sans-serif",
  badgeFontFamily = isIOS ? "SF Pro Text" : "sans-serif",
  containerStyle,
  listStyle,
  cardStyle,
  titleTextStyle,
  subtitleTextStyle,
  badgeStyle,
  badgeTextStyle,
}: MultiSelectCardFieldProps<T>) {
  const badgeVisible = badge?.enabled ?? Boolean(badge?.text);
  const selectedCount = selectedIds.length;

  const handlePress = (id: T) => {
    if (disabled) return;
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(id);
  };

  return (
    <View
      style={[
        styles.container,
        { justifyContent: badgeVisible ? "space-between" : "flex-start" },
        containerStyle,
      ]}
    >
      <View style={[styles.list, listStyle]}>
        {options.map((option, index) => {
          const isSelected = selectedIds.includes(option.id);
          return (
            <Pressable
              key={option.id}
              onPress={() => handlePress(option.id)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: cardBackgroundColor,
                  borderColor: cardBorderColor,
                },
                cardStyle,
                isSelected && {
                  borderColor: cardSelectedBorderColor,
                  borderWidth: cardSelectedBorderWidth,
                },
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: iconBackgroundColor,
                  },
                ]}
              >
                <Icon
                  name={option.icon}
                  size={20}
                  color={isSelected ? iconSelectedColor : iconMutedColor}
                />
              </View>

              <View style={styles.cardInfo}>
                <Text
                  selectable
                  style={[
                    styles.cardTitle,
                    { color: textPrimaryColor, fontFamily: titleFontFamily },
                    titleTextStyle,
                  ]}
                >
                  {option.title}
                </Text>
                {option.subtitle ? (
                  <Text
                    selectable
                    style={[
                      styles.cardSubtitle,
                      { color: textSecondaryColor, fontFamily: subtitleFontFamily },
                      subtitleTextStyle,
                    ]}
                  >
                    {option.subtitle}
                  </Text>
                ) : null}
              </View>

              {showSelectionIndicator ? (
                <View
                  style={[
                    styles.check,
                    { borderColor: checkBorderColor },
                    isSelected && {
                      backgroundColor: checkSelectedColor,
                      borderColor: checkSelectedColor,
                    },
                  ]}
                >
                  {isSelected ? (
                    <Icon name="checkmark" size={14} color={checkIconColor} />
                  ) : null}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {badgeVisible && badge?.text ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeBackgroundColor },
            badgeStyle,
          ]}
        >
          {badge.icon ? (
            <Icon name={badge.icon} size={16} color={badgeIconColor} />
          ) : null}
          <Text
            selectable
            style={[
              styles.badgeText,
              { color: badgeTextColor, fontFamily: badgeFontFamily },
              badgeTextStyle,
            ]}
          >
            {badge.text}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    flexGrow: 1,
  },
  list: {
    gap: 9,
    width: "100%",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    width: "100%",
    borderRadius: 18,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderCurve: "continuous",
    alignSelf: "center",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "center",
  },
});
