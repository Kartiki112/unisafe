export function validateIncidentReport(type: string, description: string): string | null {
  if (!type.trim()) {
    return "Incident type is required.";
  }

  if (!description.trim()) {
    return "Description is required.";
  }

  if (description.trim().length < 5) {
    return "Description must be at least 5 characters.";
  }

  return null;
}

export function validateEmergencyContact(name: string, phone: string): string | null {
  if (!name.trim()) {
    return "Contact name is required.";
  }

  if (!phone.trim()) {
    return "Phone number is required.";
  }

  if (phone.trim().length < 8) {
    return "Phone number must be at least 8 digits.";
  }

  return null;
}

export function validateRouteDestination(destination: string): string | null {
  if (!destination.trim()) {
    return "Destination is required.";
  }

  if (destination.trim().length < 3) {
    return "Destination must be at least 3 characters.";
  }

  return null;
}