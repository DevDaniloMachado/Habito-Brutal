import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { formatCurrencyFromCents } from "../utils/money";

export default function PenaltyPanel({ penalties, totalCents, failures }) {
  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Multa simbolica</Text>
        <Text style={styles.summaryValue}>{formatCurrencyFromCents(totalCents)}</Text>
        <Text style={styles.summaryMeta}>{failures} falhas registradas</Text>
      </View>

      <FlatList
        data={penalties}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nada pendurado.</Text>
            <Text style={styles.emptyText}>Falhas futuras viram R$5 automaticos.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.marker, { backgroundColor: item.habit_color ?? "#f2f2f2" }]}>
              <Text style={styles.markerText}>{item.habit_icon ?? "!"}</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.name}>{item.habit_name ?? "Habito removido"}</Text>
              <Text style={styles.meta}>{item.date_key} - {item.reason}</Text>
            </View>
            <Text style={styles.amount}>{formatCurrencyFromCents(item.amount_cents)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14
  },
  summary: {
    borderWidth: 2,
    borderColor: "#ff3b30",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#160909"
  },
  summaryLabel: {
    color: "#ff8a80",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  summaryValue: {
    color: "#f2f2f2",
    fontSize: 42,
    fontWeight: "900",
    marginTop: 4
  },
  summaryMeta: {
    color: "#858585",
    fontWeight: "800"
  },
  list: {
    gap: 10,
    paddingBottom: 4
  },
  row: {
    minHeight: 72,
    borderWidth: 2,
    borderColor: "#2b2b2b",
    borderRadius: 8,
    backgroundColor: "#111",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  marker: {
    width: 42,
    height: 42,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  markerText: {
    color: "#080808",
    fontSize: 18,
    fontWeight: "900"
  },
  rowText: {
    flex: 1
  },
  name: {
    color: "#f2f2f2",
    fontSize: 16,
    fontWeight: "900"
  },
  meta: {
    color: "#858585",
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700"
  },
  amount: {
    color: "#ff453a",
    fontSize: 16,
    fontWeight: "900"
  },
  empty: {
    minHeight: 160,
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
    fontSize: 24,
    fontWeight: "900"
  },
  emptyText: {
    color: "#858585",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "700"
  }
});
