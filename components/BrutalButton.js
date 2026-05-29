import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

export default function BrutalButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  style
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#080808" />
      ) : (
        <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#f2f2f2",
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: "#f2f2f2"
  },
  danger: {
    backgroundColor: "#ff3b30",
    borderColor: "#ff3b30"
  },
  ghost: {
    backgroundColor: "transparent"
  },
  label: {
    color: "#080808",
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  ghostLabel: {
    color: "#f2f2f2"
  },
  disabled: {
    opacity: 0.38
  },
  pressed: {
    transform: [{ translateY: 2 }]
  }
});
