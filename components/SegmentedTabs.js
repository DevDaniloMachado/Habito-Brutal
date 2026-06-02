import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SegmentedTabs({ value, onChange, items }) {
  return (
    <View style={styles.tabs}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={[styles.tab, active && styles.activeTab]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "#2b2b2b",
    borderRadius: 8,
    overflow: "hidden"
  },
  tab: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#101010"
  },
  activeTab: {
    backgroundColor: "#f2f2f2"
  },
  label: {
    color: "#858585",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  activeLabel: {
    color: "#080808"
  }
});
