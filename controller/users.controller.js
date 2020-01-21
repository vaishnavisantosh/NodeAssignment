/* eslint-disable import/named */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../model/User.model';
import UserActivity from '../model/UserActivity.model';
import { LoginValidation, RegistrationValidation } from '../lib/validator';

dotenv.config({ path: './.env' });

exports.SignUp = async (req, res) => {
  const { error } = RegistrationValidation(req.body);
  if (error) {
    return res.send(error.details[0].message);
  }

  await User.findOne({ email: req.body.email });
  try {
    res.send('email already exists!!');
  } catch (err) {
    res.status(400).send(error.details[0].message);
  }

  const salt = bcrypt.genSaltSync(10);
  const encryptedPass = bcrypt.hashSync(req.body.password, salt);
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: encryptedPass,
  });

  await user.save();
  try {
    res.status(200).send('registration Successful');
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.SignIn = async (req, res) => {
  let isAdmin;
  const { error } = LoginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send('email not found');

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send('incorrect password!!');

  if (user.firstName === 'admin') {
    isAdmin = true;
  } else {
    isAdmin = false;
  }

  const userActivity = new UserActivity({
    userId: user._id,
    ipAddress: req.ip,
    uaString: req.headers['user-agent'],

  });

  await userActivity.save();
  try {
    res.send('logged in!');
  } catch (err) {
    res.status(400).send(err);
  }

  const token = jwt.sign({ _id: user._id, isAdmin }, process.env.TOKEN_SECRET);
  res.header('authentication-token', token).send('logged in!!');
};


exports.ShowAllUser = async (req, res) => {
  let users;

  const token = req.headers.authorization;
  if (!token) return res.status(401).send('Access denied');

  try {
    const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKEN_SECRET);
    if (decodedToken.isAdmin) {
      users = await User.find();
    } else {
      users = await User.find({ _id: decodedToken._id });
    }
    res.status(200).send(users);
  } catch (err) {
    return res.send('invalid Token');
  }
};

exports.ShowParticularUser = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send('Access denied');

  const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKEN_SECRET);

  const user = await User.find({ _id: decodedToken._id });
  try {
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send('something went wrong');
  }
};
exports.Update = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send('Access denied');

  const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKEN_SECRET);

  await User.findOneAndUpdate({ _id: decodedToken._id }, { $set: { firstName: req.body.firstName } }, { new: true }, (err, updatedObeject) => {
    try {
      res.status(200).send(`updated user : ${updatedObeject}`);
    } catch (error) {
      res.status(400).send('unable to update');
    }
  });
};

exports.UserActivity = async (req, res) => {
  const date = new Date();
  const dt = date.setDate(date.getDate() - process.env.INACTIVEDAYS);

  await UserActivity

    .find({ loginDate: { $lt: dt } })

    .populate('users')

    .exec();

  return res.status(200);
};
