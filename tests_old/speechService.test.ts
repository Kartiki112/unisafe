jest.mock("expo-speech", () => ({
  stop: jest.fn(),
  speak: jest.fn(),
}));

import * as Speech from "expo-speech";
import {
  speakMessage,
  speakShakeDetected,
  speakSosCancelled,
  speakSosSent,
} from "../src/services/speechService";

describe("Speech service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("speaks a custom message", () => {
    speakMessage("Testing speech feedback");

    expect(Speech.stop).toHaveBeenCalled();
    expect(Speech.speak).toHaveBeenCalledWith(
      "Testing speech feedback",
      expect.objectContaining({
        language: "en-US",
      })
    );
  });

  test("speaks SOS sent confirmation", () => {
    speakSosSent();

    expect(Speech.speak).toHaveBeenCalledWith(
      "SOS alert sent successfully.",
      expect.any(Object)
    );
  });

  test("speaks shake detected warning", () => {
    speakShakeDetected();

    expect(Speech.speak).toHaveBeenCalledWith(
      "Shake detected. Do you want to send an SOS alert?",
      expect.any(Object)
    );
  });

  test("speaks SOS cancelled message", () => {
    speakSosCancelled();

    expect(Speech.speak).toHaveBeenCalledWith(
      "SOS cancelled.",
      expect.any(Object)
    );
  });
});