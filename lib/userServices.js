/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */

import User from '../model/User.model';
import UserActivity from '../model/UserActivity.model';

module.exports = class UserServices {
  showUsers = async (decodedToken) => {
    try {
      const users = decodedToken.admin === 1 ? await User.find() : await User.find({ _id: decodedToken._id });
      // if (decodedToken.isAdmin === 1) {
      //   users = await User.find();
      // } else {
      //   users =await User.find({ _id: decodedToken._id });
      // }

      return users;
    } catch (err) {
      return err;
    }
  }

  updateUser = async (req, res, decodedToken) => {
    try {
      await User.findOneAndUpdate({ _id: decodedToken._id }, { $set: { firstName: req.body.firstName } }, { new: true }, (err, updatedObeject) => {
        if (err) {
          return ('Something wrong when updating data!');
        }
        return updatedObeject;
      });
    } catch (err) {
      return err;
    }
  }

  saveLoggedInUser=async (req, res, user) => {
    const userActivity = new UserActivity({
      userId: user._id,
      ipAddress: req.ip,
      uaString: req.headers['user-agent'],
    });
    try {
      const userActivities = await userActivity.save();
      return userActivities;
    } catch (err) {
      return err;
    }
  }

 activeUser=async (dt) => {
   try {
     const activeUser = await UserActivity

       .find({ loginDate: { $lt: dt } })

       .populate('users')

       .exec();
     return activeUser;
   } catch (err) {
     return err;
   }
 }
};
