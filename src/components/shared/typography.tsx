import React from "react";
import { Text, TextProps } from "react-native";
import { colors, typography } from "@theme";

interface TypographyProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "bodyMedium" | "caption" | "label";
  color?: "primary" | "secondary" | "tertiary" | "error" | "success";
  align?: "left" | "center" | "right";
  children: React.ReactNode;
}

const variantStyles = {
  h1: typography.h1,
  h2: typography.h2,
  h3: typography.h3,
  body: typography.body,
  bodyMedium: typography.bodyMedium,
  caption: typography.caption,
  label: typography.label,
} as const;

const colorStyles = {
  primary: { color: colors.textPrimary },
  secondary: { color: colors.textSecondary },
  tertiary: { color: colors.textTertiary },
  error: { color: colors.error },
  success: { color: colors.success },
} as const;

export function Typography({
  variant = "body",
  color = "primary",
  align = "left",
  style,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text
      selectable
      style={[variantStyles[variant], colorStyles[color], { textAlign: align }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function H1(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="h1" {...props} />;
}

export function H2(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="h2" {...props} />;
}

export function H3(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="h3" {...props} />;
}

export function Body(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="body" {...props} />;
}

export function Caption(props: Omit<TypographyProps, "variant">) {
  return <Typography variant="caption" {...props} />;
}
