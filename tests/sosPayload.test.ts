import type { SosAlertPayload } from "../src/services/sosService";

describe("SOS alert payload", () => {
  test("creates a valid hold-button SOS payload", () => {
    const payload: SosAlertPayload = {
      userEmail: "student@example.com",
      triggerType: "hold_button",
      status: "sent",
      message: "Student triggered an SOS alert from UniSafe.",
    };

    expect(payload.userEmail).toBe("student@example.com");
    expect(payload.triggerType).toBe("hold_button");
    expect(payload.status).toBe("sent");
    expect(payload.message).toContain("SOS alert");
  });

  test("creates a valid shake SOS payload", () => {
    const payload: SosAlertPayload = {
      userEmail: "student@example.com",
      triggerType: "shake",
      status: "sent",
      message: "Student triggered an SOS alert from UniSafe.",
    };

    expect(payload.triggerType).toBe("shake");
    expect(payload.status).toBe("sent");
  });
});