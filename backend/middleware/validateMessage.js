const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  const { to, content } = req.body;

  if (!to || !mongoose.Types.ObjectId.isValid(to)) {
    return res.status(400).json({ message: 'Invalid or missing `to` field' });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ message: '`content` must be a string' });
  }

  if (content.length > 5000) {
    return res.status(400).json({ message: 'Message too long' });
  }

  next();
};
