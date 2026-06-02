import * as FileSystem from "expo-file-system";

export async function persistProofPhoto(tempUri, habitId, dateKey) {
  const directory = `${FileSystem.documentDirectory}proofs/`;
  const info = await FileSystem.getInfoAsync(directory);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }

  const fileName = `habit-${habitId}-${dateKey}-${Date.now()}.jpg`;
  const destination = `${directory}${fileName}`;
  await FileSystem.copyAsync({ from: tempUri, to: destination });
  return destination;
}
