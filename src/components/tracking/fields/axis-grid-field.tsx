import React from "react";
import { AxisGridCard } from "./axis-grid-card";
import type { AxisGridValue } from "./axis-grid";
import { FieldProps } from "../types";

interface AxisGridFieldProps extends FieldProps<AxisGridValue> {
  dominantLabel: string;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  topAxisLabel?: string;
  bottomAxisLabel?: string;
  cardGradient?: string[];
  borderColor?: string;
  borderWidth?: number;
  accentColor?: string;
  accentLightColor?: string;
  textSoftColor?: string;
  textFontFamily?: string;
  maxWidth?: number;
  horizontalInset?: number;
  gridTop?: number;
  gridInset?: number;
  gridMaxSize?: number;
  gridWidthOffset?: number;
  topLabelRatio?: number;
  bottomLabelRatio?: number;
  sideLabelWidth?: number;
  sideLabelHeight?: number;
  sideLabelGap?: number;
  sideLabelRotation?: number;
  interactive?: boolean;
}

export function AxisGridField({
  value,
  onChange,
  disabled,
  dominantLabel,
  leftAxisLabel,
  rightAxisLabel,
  topAxisLabel,
  bottomAxisLabel,
  cardGradient,
  borderColor,
  borderWidth,
  accentColor,
  accentLightColor,
  textSoftColor,
  textFontFamily,
  maxWidth,
  horizontalInset,
  gridTop,
  gridInset,
  gridMaxSize,
  gridWidthOffset,
  topLabelRatio,
  bottomLabelRatio,
  sideLabelWidth,
  sideLabelHeight,
  sideLabelGap,
  sideLabelRotation,
  interactive,
}: AxisGridFieldProps) {
  const isInteractive = interactive ?? !disabled;

  return (
    <AxisGridCard
      value={value}
      onChange={onChange}
      dominantLabel={dominantLabel}
      leftAxisLabel={leftAxisLabel}
      rightAxisLabel={rightAxisLabel}
      topAxisLabel={topAxisLabel}
      bottomAxisLabel={bottomAxisLabel}
      cardGradient={cardGradient}
      borderColor={borderColor}
      borderWidth={borderWidth}
      accentColor={accentColor}
      accentLightColor={accentLightColor}
      textSoftColor={textSoftColor}
      textFontFamily={textFontFamily}
      maxWidth={maxWidth}
      horizontalInset={horizontalInset}
      gridTop={gridTop}
      gridInset={gridInset}
      gridMaxSize={gridMaxSize}
      gridWidthOffset={gridWidthOffset}
      topLabelRatio={topLabelRatio}
      bottomLabelRatio={bottomLabelRatio}
      sideLabelWidth={sideLabelWidth}
      sideLabelHeight={sideLabelHeight}
      sideLabelGap={sideLabelGap}
      sideLabelRotation={sideLabelRotation}
      interactive={isInteractive}
    />
  );
}

export type { AxisGridValue };
