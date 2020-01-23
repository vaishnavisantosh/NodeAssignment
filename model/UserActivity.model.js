import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  ipAddress: { type: String },
  uaString: { type: String },
  loginDate: { type: Date, default: new Date() },
});

module.exports = mongoose.model('UsersActivity', userActivitySchema);
