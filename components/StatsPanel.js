import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import BrutalButton from "./BrutalButton";
import DailyJournal from "./DailyJournal";
import HeatmapGrid from "./HeatmapGrid";
import { formatCurrencyFromCents } from "../utils/money";

export default function StatsPanel({
  analytics,
  streak,
  penaltyTotalCents,
  dailyNote,
  onSaveNote,
  onGeneratePdf
}) {
  const [generating, setGenerating] = useState(false);

  async function handleGeneratePdf() {
    try {
      setGenerating(true);
      const report = await onGeneratePdf();
      Alert.alert("PDF gerado", report.fileUri);
    } catch (error) {
      Alert.alert("PDF falhou", error.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.grid}>
        <StatCard label="streak atual" value={streak.currentStreak} />
        <StatCard label="melhor streak" value={streak.bestStreak} />
        <StatCard label="concluidos" value={analytics.completedTotal} />
        <StatCard label="consistencia" value={`${analytics.consistencyRate}%`} />
        <StatCard label="falhas" value={analytics.failureTotal} danger />
        <StatCard label="multas" value={formatCurrencyFromCents(penaltyTotalCents)} danger />
      </View>

      <Section title="Heatmap de consistencia">
        <HeatmapGrid days={analytics.heatmapDays} />
      </Section>

      <DailyJournal note={dailyNote} onSave={onSaveNote} />

      <View style={styles.pdfBox}>
        <View style={styles.pdfText}>
          <Text style={styles.pdfTitle}>PDF semanal</Text>
          <Text style={styles.pdfMeta}>Resumo brutal da semana salvo localmente.</Text>
        </View>
        <BrutalButton
          label="Gerar PDF"
          onPress={handleGeneratePdf}
          loading={generating}
          style={styles.pdfButton}
        />
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, danger = false }) {
  return (
    <View style={[styles.card, danger && styles.dangerCard]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, danger && styles.dangerText]}>{value}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 4
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  card: {
    width: "48%",
    minHeight: 96,
    borderWidth: 2,
    borderColor: "#2b2b2b",
    borderRadius: 8,
    backgroundColor: "#111",
    padding: 12,
    justifyContent: "space-between"
  },
  dangerCard: {
    borderColor: "#4a1916",
    backgroundColor: "#160909"
  },
  cardLabel: {
    color: "#858585",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  cardValue: {
    color: "#f2f2f2",
    fontSize: 26,
    fontWeight: "900"
  },
  dangerText: {
    color: "#ff453a"
  },
  section: {
    borderWidth: 2,
    borderColor: "#2b2b2b",
    borderRadius: 8,
    padding: 14,
    gap: 12,
    backgroundColor: "#111"
  },
  sectionTitle: {
    color: "#f2f2f2",
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  pdfBox: {
    borderWidth: 2,
    borderColor: "#f2f2f2",
    borderRadius: 8,
    padding: 14,
    gap: 12,
    backgroundColor: "#111"
  },
  pdfText: {
    gap: 4
  },
  pdfTitle: {
    color: "#f2f2f2",
    fontSize: 20,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  pdfMeta: {
    color: "#858585",
    fontWeight: "700"
  },
  pdfButton: {
    alignSelf: "stretch"
  }
});
