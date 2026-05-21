import * as Speech from "expo-speech";

export function speakMessage(message: string) {
  try {
    Speech.stop();

    Speech.speak(message, {
      language: "en-US",
      pitch: 1,
      rate: 0.9,
      onStart: () => console.log("Speech started"),
      onDone: () => console.log("Speech finished"),
      onStopped: () => console.log("Speech stopped"),
      onError: (error) => console.log("Speech error:", error),
    });
  } catch (error) {
    console.log("Speech catch error:", error);
  }
}

export function speakShakeDetected() {
  speakMessage("Shake detected. Do you want to send an SOS alert?");
}

export function speakSosSent() {
  speakMessage("SOS alert sent successfully.");
}

export function speakSosCancelled() {
  speakMessage("SOS cancelled.");
}

export function speakTestMessage() {
  speakMessage("UniSafe speech feedback is working.");
}