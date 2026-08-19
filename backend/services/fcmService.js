const { getMessaging } = require("firebase-admin/messaging");

const sendPushNotification = async ({
  tokens,
  title,
  body,
  data = {},
}) => {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return {
      successCount: 0,
      failureCount: 0,
      failedTokens: [],
      message: "No FCM tokens available",
    };
  }

  const response = await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
    },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    ),
    android: {
      priority: "high",
      notification: {
        channelId: "default",
        sound: "default",
      },
    },
  });

  const failedTokens = [];

  response.responses.forEach((result, index) => {
    if (!result.success) {
      failedTokens.push({
        token: tokens[index],
        errorCode: result.error?.code || "unknown",
        errorMessage: result.error?.message || "Unknown FCM error",
      });
    }
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    failedTokens,
  };
};

module.exports = {
  sendPushNotification,
};
