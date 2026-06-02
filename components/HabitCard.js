import React from "react";
import { Alert, Animated, Pressable, StyleSheet, Text, View } from "react-native";
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
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (completed) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.02, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true })
      ]).start();
    }
  }, [completed, scale]);

  return (
    <Animated.View
      style={[
        styles.card,
        completed && styles.completedCard,
        { borderLeftColor: habit.color, transform: [{ scale }] }
      ]}
    >
      <Pressable onPress={onEdit} style={styles.main}>
        <View style={[styles.iconBox, { backgroundColor: habit.color }]}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.name}>{habit.name}</Text>
          <Text style={styles.meta}>
            {completed ? `Concluido as ${formatTime(check.completed_at)}` : "Pendente hoje"}
          </Text>
          {habit.requires_photo ? <Text style={styles.proof}>Foto obrigatoria</Text> : null}
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
    </Animated.View>
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
  completedCard: {
    borderColor: "#f2f2f2"
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
  proof: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#ff3b30",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: "#ff453a",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
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
