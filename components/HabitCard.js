import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { formatTime } from "../utils/date";
import BrutalButton from "./BrutalButton";

export default function HabitCard({
  habit,
  check,
  completed,
  onComplete,
  onEdit,
  onDelete
}) {
  return (
    <View style={[styles.card, { borderLeftColor: habit.color }]}>
      <Pressable onPress={onEdit} style={styles.main}>
        <View style={[styles.iconBox, { backgroundColor: habit.color }]}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.name}>{habit.name}</Text>
          <Text style={styles.meta}>
            {completed ? `Concluido as ${formatTime(check.completed_at)}` : "Pendente hoje"}
          </Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <BrutalButton
          label={completed ? "Feito" : "Concluir"}
          onPress={onComplete}
          disabled={completed}
          style={styles.completeButton}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert("Excluir habito", `Remover "${habit.name}"?`, [
              { text: "Cancelar", style: "cancel" },
              { text: "Excluir", style: "destructive", onPress: onDelete }
            ])
          }
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>X</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#141414",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#2b2b2b",
    borderLeftWidth: 8,
    padding: 14,
    gap: 14
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    color: "#080808",
    fontSize: 24,
    fontWeight: "900"
  },
  textBlock: {
    flex: 1,
    gap: 4
  },
  name: {
    color: "#f2f2f2",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0
  },
  meta: {
    color: "#9a9a9a",
    fontSize: 13,
    fontWeight: "700"
  },
  actions: {
    flexDirection: "row",
    gap: 10
  },
  completeButton: {
    flex: 1
  },
  deleteButton: {
    width: 54,
    minHeight: 54,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#343434",
    alignItems: "center",
    justifyContent: "center"
  },
  deleteText: {
    color: "#f2f2f2",
    fontSize: 18,
    fontWeight: "900"
  }
});
