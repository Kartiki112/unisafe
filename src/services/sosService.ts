import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type SosAlertPayload = {
  userEmail: string;
  triggerType: "hold_button" | "shake";
  status: "sent";
  message: string;
};

export async function sendSosAlert(payload: SosAlertPayload) {
  const docRef = await addDoc(collection(db, "sos_alerts"), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}