import { StyleSheet, Text as NativeText, TextInput as NativeTextInput } from 'react-native';
import type { TextProps, TextInputProps, TextStyle } from 'react-native';

import { useTextSizePreference } from '@/contexts/text-size-preference';

function scaledTypography(style: TextStyle | undefined, scale: number): TextStyle {
  const fontSize = style?.fontSize ?? 14;
  return {
    fontSize: fontSize * scale,
    lineHeight: (style?.lineHeight ?? fontSize * 1.4) * scale,
  };
}

// Retain the OS font scaling in addition to the user's in-app preference.
export function Text({ style, ...props }: TextProps) {
  const { scale } = useTextSizePreference();
  return <NativeText {...props} style={[style, scaledTypography(StyleSheet.flatten(style), scale)]} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  const { scale } = useTextSizePreference();
  return <NativeTextInput {...props} style={[style, scaledTypography(StyleSheet.flatten(style), scale)]} />;
}
