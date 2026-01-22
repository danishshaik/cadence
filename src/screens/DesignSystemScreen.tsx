import React, { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import {
  Card,
  Button,
  Chip,
  TextInput,
  H1,
  H2,
  Body,
  Caption,
  Avatar,
  LoadingSpinner,
  Badge,
} from "@components/shared";
import { colors, spacing } from "@theme";

export function DesignSystemScreen() {
  const [selected, setSelected] = useState(false);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}
    >
      <H1>Design System</H1>

      <Section title="Typography">
        <H1>Heading 1</H1>
        <H2>Heading 2</H2>
        <Body>Body text</Body>
        <Caption color="secondary">Caption text</Caption>
      </Section>

      <Section title="Buttons">
        <Button title="Primary" onPress={() => {}} />
        <Button title="Secondary" variant="secondary" onPress={() => {}} />
        <Button title="Outline" variant="outline" onPress={() => {}} />
        <Button title="Loading" loading onPress={() => {}} />
        <Button title="Disabled" disabled onPress={() => {}} />
      </Section>

      <Section title="Chips">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <Chip label="Unselected" onPress={() => setSelected(!selected)} />
          <Chip label="Selected" selected={selected} onPress={() => {}} />
          <Chip label="With Icon" icon={<Text>🔥</Text>} />
        </View>
      </Section>

      <Section title="Cards">
        <Card variant="default">
          <Body>Default card</Body>
        </Card>
        <Card variant="elevated">
          <Body>Elevated card</Body>
        </Card>
        <Card variant="outlined">
          <Body>Outlined card</Body>
        </Card>
      </Section>

      <Section title="Input">
        <TextInput label="Email" placeholder="Enter email" />
        <TextInput label="With Error" error="Invalid input" />
      </Section>

      <Section title="Badges">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <Badge label="Default" />
          <Badge label="Success" variant="success" />
          <Badge label="Warning" variant="warning" />
          <Badge label="Error" variant="error" />
        </View>
      </Section>

      <Section title="Avatar">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <Avatar name="John Doe" size="sm" />
          <Avatar name="Jane" size="md" />
          <Avatar name="A B" size="lg" />
        </View>
      </Section>

      <Section title="Loading">
        <LoadingSpinner message="Loading components..." />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <H2>{title}</H2>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}
