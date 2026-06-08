import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import BrutalButton from "./BrutalButton";

export default function DailyJournal({ note, onSave }) {
  const [successReason, setSuccessReason] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSuccessReason(note?.successReason ?? "");
    setFailureReason(note?.failureReason ?? "");
  }, [note]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ successReason, failureReason });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diario de 1 linha</Text>
      <TextInput
        value={successReason}
        onChangeText={setSuccessReason}
        placeholder="Por que consegui hoje?"
        placeholderTextColor="#6f6f6f"
        style={styles.input}
        maxLength={120}
      />
      <TextInput
        value={failureReason}
        onChangeText={setFailureReason}
        placeholder="Por que falhei?"
        placeholderTextColor="#6f6f6f"
        style={styles.input}
        maxLength={120}
      />
      <BrutalButton label="Salvar diario" onPress={handleSave} loading={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: "#2b2b2b",
    borderRadius: 8,
    padding: 14,
    gap: 10,
    backgroundColor: "#111"
  },
  title: {
    color: "#f2f2f2",
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  input: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 6,
    paddingHorizontal: 12,
    color: "#f2f2f2",
    fontSize: 15,
    fontWeight: "800"
  }
});
