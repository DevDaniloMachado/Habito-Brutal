import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const COLORS = ["#191919", "#3a1515", "#6f241f", "#b43329", "#f2f2f2"];

export default function HeatmapGrid({ days }) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {days.map((day) => (
          <Pressable
            key={day.dateKey}
            style={[styles.cell, { backgroundColor: COLORS[day.level] }]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>falha</Text>
        <View style={styles.legendCells}>
          {COLORS.map((color) => (
            <View key={color} style={[styles.legendCell, { backgroundColor: color }]} />
          ))}
        </View>
        <Text style={styles.legendText}>brutal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5
  },
  cell: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#2b2b2b"
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8
  },
  legendText: {
    color: "#858585",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  legendCells: {
    flexDirection: "row",
    gap: 4
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 3
  }
});
