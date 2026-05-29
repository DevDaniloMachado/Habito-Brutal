import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrutalButton from "../components/BrutalButton";
import HabitCard from "../components/HabitCard";
import HabitForm from "../components/HabitForm";
import { useHabits } from "../hooks/useHabits";

export default function HomeScreen() {
  const {
    habits,
    checks,
    checkedHabitIds,
    streak,
    loading,
    error,
    progress,
    addHabit,
    editHabit,
    removeHabit,
    markComplete
  } = useHabits();
  const [formVisible, setFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const checkByHabit = useMemo(() => {
    return checks.reduce((map, check) => {
      map[check.habit_id] = check;
      return map;
    }, {});
  }, [checks]);

  function openCreate() {
    if (habits.length >= 3) {
      Alert.alert("Limite brutal", "Voce pode manter ate 3 habitos diarios.");
      return;
    }

    setEditingHabit(null);
    setFormVisible(true);
  }

  async function handleSubmit(payload) {
    if (editingHabit) {
      await editHabit(editingHabit.id, payload);
    } else {
      await addHabit(payload);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#f2f2f2" />
      </SafeAreaView>
    );
  }

  const completedCount = checks.length;
  const progressPercent = Math.round(progress * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Habito Brutal</Text>
            <Text style={styles.title}>Disciplina diaria.</Text>
          </View>
          <View style={styles.streakBox}>
            <Text style={styles.streakValue}>{streak.currentStreak}</Text>
            <Text style={styles.streakLabel}>streak</Text>
          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {completedCount}/{habits.length || 3} concluidos
            </Text>
            <Text style={styles.progressText}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statNumber}>{streak.bestStreak}</Text>
              <Text style={styles.statLabel}>melhor streak</Text>
            </View>
            <View>
              <Text style={styles.statNumber}>{habits.length}/3</Text>
              <Text style={styles.statLabel}>habitos ativos</Text>
            </View>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={habits}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Sem desculpas.</Text>
              <Text style={styles.emptyText}>Crie ate 3 habitos e marque todos os dias.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const completed = checkedHabitIds.has(item.id);
            return (
              <HabitCard
                habit={item}
                completed={completed}
                check={checkByHabit[item.id]}
                onComplete={() => markComplete(item.id)}
                onEdit={() => {
                  setEditingHabit(item);
                  setFormVisible(true);
                }}
                onDelete={() => removeHabit(item.id)}
              />
            );
          }}
        />

        <BrutalButton
          label={habits.length >= 3 ? "Limite atingido" : "Adicionar habito"}
          onPress={openCreate}
          disabled={habits.length >= 3}
        />
      </View>

      <HabitForm
        visible={formVisible}
        habit={editingHabit}
        onClose={() => setFormVisible(false)}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#080808"
  },
  center: {
    flex: 1,
    backgroundColor: "#080808",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    padding: 18,
    gap: 18
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16
  },
  kicker: {
    color: "#858585",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: "#f2f2f2",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: 0
  },
  streakBox: {
    width: 92,
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#f2f2f2",
    borderRadius: 8
  },
  streakValue: {
    color: "#f2f2f2",
    fontSize: 34,
    fontWeight: "900"
  },
  streakLabel: {
    color: "#858585",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  progressBlock: {
    borderWidth: 2,
    borderColor: "#2b2b2b",
    borderRadius: 8,
    padding: 16,
    gap: 14,
    backgroundColor: "#111"
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  progressText: {
    color: "#f2f2f2",
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  progressTrack: {
    height: 16,
    borderRadius: 4,
    backgroundColor: "#242424",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f2f2f2"
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statNumber: {
    color: "#f2f2f2",
    fontSize: 26,
    fontWeight: "900"
  },
  statLabel: {
    color: "#858585",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  error: {
    color: "#ff453a",
    fontWeight: "800"
  },
  list: {
    gap: 12,
    paddingBottom: 4
  },
  empty: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#2b2b2b",
    borderRadius: 8,
    padding: 18
  },
  emptyTitle: {
    color: "#f2f2f2",
    fontSize: 26,
    fontWeight: "900"
  },
  emptyText: {
    color: "#858585",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "700"
  }
});
