import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import BrutalButton from "./BrutalButton";

const ICONS = ["T", "L", "E", "F", "A", "M"];
const COLORS = ["#f2f2f2", "#ff3b30", "#ffd60a", "#30d158", "#64d2ff", "#bf5af2"];

export default function HabitForm({ visible, habit, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setName(habit?.name ?? "");
      setIcon(habit?.icon ?? ICONS[0]);
      setColor(habit?.color ?? COLORS[0]);
      setError("");
    }
  }, [habit, visible]);

  async function handleSubmit() {
    if (name.trim().length < 2) {
      setError("Nome muito curto.");
      return;
    }

    try {
      setSaving(true);
      await onSubmit({ name, icon, color });
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{habit ? "Editar habito" : "Novo habito"}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          </View>

          <TextInput
            placeholder="Nome do habito"
            placeholderTextColor="#6f6f6f"
            value={name}
            onChangeText={setName}
            style={styles.input}
            maxLength={24}
          />

          <Text style={styles.label}>Icone</Text>
          <View style={styles.options}>
            {ICONS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setIcon(item)}
                style={[styles.option, icon === item && styles.optionActive]}
              >
                <Text style={styles.optionText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Cor</Text>
          <View style={styles.options}>
            {COLORS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setColor(item)}
                style={[
                  styles.colorOption,
                  { backgroundColor: item },
                  color === item && styles.colorActive
                ]}
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <BrutalButton
            label={habit ? "Salvar" : "Criar"}
            onPress={handleSubmit}
            loading={saving}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.76)"
  },
  sheet: {
    backgroundColor: "#101010",
    borderTopWidth: 2,
    borderColor: "#f2f2f2",
    padding: 20,
    gap: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    color: "#f2f2f2",
    fontSize: 24,
    fontWeight: "900"
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333"
  },
  closeText: {
    color: "#f2f2f2",
    fontSize: 16,
    fontWeight: "900"
  },
  input: {
    minHeight: 56,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 6,
    paddingHorizontal: 14,
    color: "#f2f2f2",
    fontSize: 18,
    fontWeight: "800"
  },
  label: {
    color: "#858585",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  option: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  optionActive: {
    borderColor: "#f2f2f2",
    backgroundColor: "#202020"
  },
  optionText: {
    color: "#f2f2f2",
    fontSize: 18,
    fontWeight: "900"
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#080808"
  },
  colorActive: {
    borderColor: "#f2f2f2"
  },
  error: {
    color: "#ff453a",
    fontWeight: "800"
  }
});
