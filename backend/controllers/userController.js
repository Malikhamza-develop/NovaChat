const User = require('../models/User');

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  isOnline: user.isOnline,
  lastSeen: user.lastSeen,
});

const searchUsers = async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();

    let users = [];
    if (query.length < 1) {
      users = await User.find({ _id: { $ne: req.user._id } })
        .select('name email avatar isOnline lastSeen')
        .sort({ isOnline: -1, name: 1 })
        .limit(20)
        .lean();
    } else {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      users = await User.find({
        _id: { $ne: req.user._id },
        $or: [
          { name: { $regex: escapedQuery, $options: 'i' } },
          { email: { $regex: escapedQuery, $options: 'i' } },
        ],
      })
        .select('name email avatar isOnline lastSeen')
        .sort({ name: 1 })
        .limit(20)
        .lean();
    }

    return res.status(200).json({ users: users.map(toPublicUser) });
  } catch (error) {
    console.error('Search users error:', error.message);
    return res.status(500).json({ message: 'Unable to search users' });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: toPublicUser(req.user) });
};

const updateCurrentUser = async (req, res) => {
  try {
    const updates = {};

    if (typeof req.body.name === 'string') {
      const name = req.body.name.trim();
      if (name.length < 2 || name.length > 60) {
        return res.status(400).json({ message: 'Name must be between 2 and 60 characters' });
      }
      updates.name = name;
    }

    if (typeof req.body.avatar === 'string') {
      const avatar = req.body.avatar.trim();
      if (avatar.length > 2048) {
        return res.status(400).json({ message: 'Avatar URL is too long' });
      }
      if (avatar && !/^https?:\/\//i.test(avatar)) {
        return res.status(400).json({ message: 'Avatar must be a valid HTTP(S) URL' });
      }
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid profile changes supplied' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('name email avatar isOnline lastSeen');

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ message: 'Unable to update profile' });
  }
};

module.exports = { searchUsers, getCurrentUser, updateCurrentUser };
