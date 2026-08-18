const User = require("../models/User");

const registerFcmToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "FCM token is required",
      });
    }

    await User.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: {
          fcmTokens: token,
        },
      }
    );

    return res.status(200).json({
      message: "FCM token registered successfully",
    });
  } catch (error) {
    console.error("FCM token registration error:", error);

    return res.status(500).json({
      message: "Failed to register FCM token",
    });
  }
};

const removeFcmToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "FCM token is required",
      });
    }

    await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          fcmTokens: token,
        },
      }
    );

    return res.status(200).json({
      message: "FCM token removed successfully",
    });
  } catch (error) {
    console.error("FCM token removal error:", error);

    return res.status(500).json({
      message: "Failed to remove FCM token",
    });
  }
};

module.exports = {
  registerFcmToken,
  removeFcmToken,
};
