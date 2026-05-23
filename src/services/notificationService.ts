import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.status === "granted") {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return requestedPermission.status === "granted";
}

export async function showSosSentNotification() {
  try {
    await requestNotificationPermission();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "UniSafe SOS alert sent",
        body: "Your SOS alert has been recorded successfully.",
      },
      trigger: null,
    });
  } catch (error) {
    console.log("Notification error:", error);
  }
}