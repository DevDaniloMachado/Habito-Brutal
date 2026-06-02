import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrutalButton from "../components/BrutalButton";
import CameraProofModal from "../components/CameraProofModal";
import HabitCard from "../components/HabitCard";
import HabitForm from "../components/HabitForm";
import PenaltyPanel from "../components/PenaltyPanel";
import SegmentedTabs from "../components/SegmentedTabs";
import TimelinePanel from "../components/TimelinePanel";
import { useHabits } from "../hooks/useHabits";
import { persistProofPhoto } from "../services/proofService";

export default function HomeScreen() {
  const {
    habits,
    checks,
    checkedHabitIds,
    streak,
    penalties,
    penaltyTotalCents,
    penaltyFailures,
    timeline,
    notificationSettings,
    loading,
    error,
    progress,
    addHabit,
    editHabit,
    removeHabit,
    markComplete,
    enableDailyReminder,
    todayKey
  } = useHabits();
  const [formVisible, setFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [proofHabit, setProofHabit] = useState(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 420,
      useNativeDriver: false
    }).start();
  }, [progress, progressAnim]);

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

  async function handleComplete(habit) {
    try {
      if (habit.requires_photo) {
        setProofHabit(habit);
        return;
      }

      await markComplete(habit.id);
    } catch (completeError) {
      Alert.alert("Falha no check", completeError.message);
    }
  }

  async function handleProofCaptured(tempUri) {
    if (!proofHabit) {
      return;
    }

    try {
      const proofUri = await persistProofPhoto(tempUri, proofHabit.id, todayKey);
      await markComplete(proofHabit.id, proofUri);
    } catch (proofError) {
      Alert.alert("Prova recusada", proofError.message);
    }
  }

  async function handleEnableReminder() {
    try {
      const settings = await enableDailyReminder();

      Alert.alert(
        "Notificacoes",
        settings.enabled
          ? "Lembrete das 21h ativado."
          : "Permissao negada. Ative as notificacoes no sistema."
      );
    } catch (notificationError) {
      Alert.alert("Notificacoes", notificationError.message);
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
  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });
  const disciplineLabel =
    progressPercent === 100 ? "blindado" : progressPercent >= 50 ? "em combate" : "sob risco";

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
            <Animated.View style={[styles.progressFill, { width: animatedProgressWidth }]} />
          </View>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statNumber}>{streak.bestStreak}</Text>
              <Text style={styles.statLabel}>melhor streak</Text>
            </View>
            <View>
              <Text style={styles.statNumber}>{disciplineLabel}</Text>
              <Text style={styles.statLabel}>disciplina</Text>
            </View>
            <View>
              <Text style={styles.statNumber}>{habits.length}/3</Text>
              <Text style={styles.statLabel}>habitos ativos</Text>
            </View>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <SegmentedTabs
          value={activeTab}
          onChange={setActiveTab}
          items={[
            { value: "today", label: "Hoje" },
            { value: "penalties", label: "Multas" },
            { value: "history", label: "Historico" }
          ]}
        />

        {activeTab === "today" ? (
          <>
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
                    onComplete={() => handleComplete(item)}
                    onEdit={() => {
                      setEditingHabit(item);
                      setFormVisible(true);
                    }}
                    onDelete={() => removeHabit(item.id)}
                  />
                );
              }}
            />

            <View style={styles.bottomActions}>
              <BrutalButton
                label={habits.length >= 3 ? "Limite atingido" : "Adicionar habito"}
                onPress={openCreate}
                disabled={habits.length >= 3}
                style={styles.actionButton}
              />
              <BrutalButton
                label={notificationSettings?.daily_reminder_enabled ? "21h ativo" : "Ativar 21h"}
                variant="ghost"
                onPress={handleEnableReminder}
                style={styles.actionButton}
              />
            </View>
          </>
        ) : null}

        {activeTab === "penalties" ? (
          <PenaltyPanel
            penalties={penalties}
            totalCents={penaltyTotalCents}
            failures={penaltyFailures}
          />
        ) : null}

        {activeTab === "history" ? <TimelinePanel events={timeline} /> : null}
      </View>

      <HabitForm
        visible={formVisible}
        habit={editingHabit}
        onClose={() => setFormVisible(false)}
        onSubmit={handleSubmit}
      />
      <CameraProofModal
        visible={Boolean(proofHabit)}
        habit={proofHabit}
        onClose={() => setProofHabit(null)}
        onCaptured={handleProofCaptured}
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
    justifyContent: "space-between",
    gap: 12
  },
  statNumber: {
    color: "#f2f2f2",
    fontSize: 20,
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
    flexGrow: 1,
    gap: 12,
    paddingBottom: 4
  },
  bottomActions: {
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    flex: 1
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
