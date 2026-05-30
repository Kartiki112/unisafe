import {
  validateEmergencyContact,
  validateIncidentReport,
  validateRouteDestination,
} from "../src/utils/member2Validation";

describe("Member 2 Incident Report Validation", () => {
  test("returns error when incident type is empty", () => {
    expect(validateIncidentReport("", "Unsafe area near library")).toBe(
      "Incident type is required."
    );
  });

  test("returns error when description is too short", () => {
    expect(validateIncidentReport("Hazard", "bad")).toBe(
      "Description must be at least 5 characters."
    );
  });

  test("returns null for valid incident report", () => {
    expect(validateIncidentReport("Hazard", "Unsafe lighting near car park")).toBeNull();
  });
});

describe("Member 2 Emergency Contact Validation", () => {
  test("returns error when contact name is empty", () => {
    expect(validateEmergencyContact("", "0412345678")).toBe(
      "Contact name is required."
    );
  });

  test("returns error when phone number is too short", () => {
    expect(validateEmergencyContact("Mum", "123")).toBe(
      "Phone number must be at least 8 digits."
    );
  });

  test("returns null for valid emergency contact", () => {
    expect(validateEmergencyContact("Mum", "0412345678")).toBeNull();
  });
});

describe("Member 2 Route Destination Validation", () => {
  test("returns error when destination is empty", () => {
    expect(validateRouteDestination("")).toBe("Destination is required.");
  });

  test("returns error when destination is too short", () => {
    expect(validateRouteDestination("LT")).toBe(
      "Destination must be at least 3 characters."
    );
  });

  test("returns null for valid destination", () => {
    expect(validateRouteDestination("La Trobe Library")).toBeNull();
  });
});