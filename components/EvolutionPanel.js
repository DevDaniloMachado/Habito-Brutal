import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function EvolutionPanel({ analytics }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ChartBlock title="Graficos semanais" items={analytics.weeklySeries} />
      <ChartBlock title="Evolucao mensal" items={analytics.monthlySeries} />

      <View style={styles.section}>
        <Text style={styles.title}>Horarios com mais falhas</Text>
        {analytics.failureHours.length === 0 ? (
          <Text style={styles.empty}>Ainda sem padrao de falha.</Text>
        ) : (
          analytics.failureHours.map((item) => (
            <View key={item.hour} style={styles.row}>
              <Text style={styles.rowLabel}>{item.hour}</Text>
              <View style={styles.track}>
                <View style={[styles.fillDanger, { width: `${Math.min(item.total * 18, 100)}%` }]} />
              </View>
              <Text style={styles.rowValue}>{item.total}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Habitos mais dificeis</Text>
        {analytics.difficultHabits.length === 0 ? (
          <Text style={styles.empty}>Cadastre habitos para medir resistencia.</Text>
        ) : (
          analytics.difficultHabits.map((habit) => (
            <View key={habit.id} style={styles.habitRow}>
              <View style={[styles.icon, { backgroundColor: habit.color }]}>
                <Text style={styles.iconText}>{habit.icon}</Text>
              </View>
              <View style={styles.habitText}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitMeta}>
                  {habit.rate}% consistencia - {habit.penaltyCount} multas
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function ChartBlock({ title, items }) {
  const maxRate = Math.max(100, ...items.map((item) => item.rate));

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chart}>
        {items.map((item) => (
          <View key={item.label} style={styles.barWrap}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(6, (item.rate / maxRate) * 100)}%`,
                    backgroundColor: item.rate >= 70 ? "#f2f2f2" : "#ff3b30"
                  }
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
            <Text style={styles.barRate}>{item.rate}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 4
  },
  section: {
    borderWidth: 2,
    borderColor: "#2b2b2b",
    borderRadius: 8,
    padding: 14,
    gap: 12,
    backgroundColor: "#111"
  },
  title: {
    color: "#f2f2f2",
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  chart: {
    minHeight: 170,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8
  },
  barWrap: {
    flex: 1,
    alignItems: "center",
    gap: 6
  },
  barTrack: {
    height: 110,
    width: "100%",
    borderRadius: 5,
    backgroundColor: "#242424",
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  bar: {
    width: "100%",
    borderRadius: 5
  },
  barLabel: {
    color: "#858585",
    fontSize: 10,
    fontWeight: "900"
  },
  barRate: {
    color: "#f2f2f2",
    fontSize: 11,
    fontWeight: "900"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  rowLabel: {
    width: 42,
    color: "#f2f2f2",
    fontWeight: "900"
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#242424",
    overflow: "hidden"
  },
  fillDanger: {
    height: "100%",
    backgroundColor: "#ff3b30"
  },
  rowValue: {
    width: 28,
    color: "#858585",
    textAlign: "right",
    fontWeight: "900"
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  iconText: {
    color: "#080808",
    fontSize: 18,
    fontWeight: "900"
  },
  habitText: {
    flex: 1
  },
  habitName: {
    color: "#f2f2f2",
    fontSize: 16,
    fontWeight: "900"
  },
  habitMeta: {
    color: "#858585",
    marginTop: 3,
    fontWeight: "700"
  },
  empty: {
    color: "#858585",
    fontWeight: "700"
  }
});
