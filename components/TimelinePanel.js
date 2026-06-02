import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { formatCurrencyFromCents } from "../utils/money";

export default function TimelinePanel({ events }) {
  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Historico vazio.</Text>
          <Text style={styles.emptyText}>A linha do tempo nasce no primeiro check.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.event}>
          <View style={styles.line} />
          <View style={[styles.dot, item.type === "penalty" && styles.penaltyDot]} />
          <View style={styles.content}>
            <Text style={styles.date}>{item.date_key}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.habit_name ?? "Habito removido"}
              {item.type === "penalty"
                ? ` - ${formatCurrencyFromCents(item.amount_cents)}`
                : ""}
            </Text>
            {item.image_uri ? (
              <Image source={{ uri: item.image_uri }} style={styles.photo} />
            ) : null}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 4
  },
  event: {
    flexDirection: "row",
    minHeight: 96
  },
  line: {
    position: "absolute",
    left: 9,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#2b2b2b"
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    marginTop: 16,
    marginRight: 14
  },
  penaltyDot: {
    backgroundColor: "#ff3b30"
  },
  content: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#2b2b2b",
    borderRadius: 8,
    backgroundColor: "#111",
    padding: 12,
    marginBottom: 12
  },
  date: {
    color: "#858585",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: "#f2f2f2",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3
  },
  meta: {
    color: "#858585",
    marginTop: 4,
    fontWeight: "700"
  },
  photo: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    marginTop: 12,
    backgroundColor: "#242424"
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
