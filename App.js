import { StatusBar } from "expo-status-bar";
import { Alert, Button, StyleSheet, View, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  useEffect(() => {
    async function ConfigurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Push notifications need the appropriate permissions."
        );
        return;
      }
      const pushTokenData = Notifications.getExpoPushTokenAsync();
      console.log(pushTokenData);

      if (Platform.OS == "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }
    ConfigurePushNotifications();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RECEIVED");
        console.log(notification.request.content.UserName);
        console.log(notification);
      }
    );

    const RespSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        console.log(response.notification.request.content.UserName);
        console.log(response);
      });

    return () => {
      subscription.remove();
      RespSubscription.remove();
    };
  }, []);

  function ScheduleNotification() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Myfirst local Notification",
        body: "This is the body of the Notification.",
        data: { UserName: "Max" },
      },
      trigger: {
        seconds: 5,
      },
    });
  }

  function sendPushNotificationHandler() {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "Post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
        title: "Test - send from a device",
        body: "This is a test!",
      }),
    });
  }
  return (
    <View style={styles.container}>
      <Button title="Schedule Notification" onPress={ScheduleNotification} />
      <Button
        title="Send Push Notification"
        onPress={sendPushNotificationHandler}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
