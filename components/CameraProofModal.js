import React, { useRef, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import BrutalButton from "./BrutalButton";

export default function CameraProofModal({ visible, habit, onClose, onCaptured }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);

  async function takePhoto() {
    if (!cameraRef.current) {
      return;
    }

    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.65,
        skipProcessing: false
      });
      await onCaptured(photo.uri);
      onClose();
    } finally {
      setCapturing(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Prova fotografica</Text>
          <Text style={styles.title}>{habit?.name ?? "Habito"}</Text>
        </View>

        {!permission ? (
          <View style={styles.center}>
            <ActivityIndicator color="#f2f2f2" />
          </View>
        ) : !permission.granted ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionTitle}>Camera bloqueada.</Text>
            <Text style={styles.permissionText}>
              Sem foto, este habito nao pode ser concluido.
            </Text>
            <BrutalButton label="Permitir camera" onPress={requestPermission} />
          </View>
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        )}

        <View style={styles.footer}>
          <BrutalButton label="Cancelar" variant="ghost" onPress={onClose} />
          <BrutalButton
            label="Registrar prova"
            onPress={takePhoto}
            loading={capturing}
            disabled={!permission?.granted}
            style={styles.captureButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808"
  },
  header: {
    padding: 18,
    paddingTop: 58,
    gap: 4
  },
  kicker: {
    color: "#858585",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: "#f2f2f2",
    fontSize: 32,
    fontWeight: "900"
  },
  camera: {
    flex: 1
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  permissionBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  permissionTitle: {
    color: "#f2f2f2",
    fontSize: 26,
    fontWeight: "900"
  },
  permissionText: {
    color: "#858585",
    marginVertical: 14,
    textAlign: "center",
    fontWeight: "700"
  },
  footer: {
    padding: 18,
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 2,
    borderColor: "#202020"
  },
  captureButton: {
    flex: 1
  }
});
