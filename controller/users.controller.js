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

  const isUserPresent = User.findOne({ email: req.body.email });
  if (isUserPresent) return res.send('email already exists!!');

  const salt = bcrypt.genSaltSync(10);
  const encryptedPass = bcrypt.hashSync(req.body.password, salt);
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: encryptedPass,
  });

  try {
    await user.save();
    return res.status(200).send('registration Successful');
  } catch (err) {
    return res.status(400).send(err);
  }
};

exports.SignIn = async (req, res) => {
  let isAdmin;
  const { error } = LoginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = User.findOne({ email: req.body.email });

  if (user) {
    const validPass = bcrypt.compare(req.body.password, user.password);
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
    const token = jwt.sign({ _id: user._id, isAdmin }, process.env.TOKEN_SECRET);
    res.header('authentication-token', token).send('logged in!!');

    await userActivity.save();
    res.send('logged in!');
  }


  return res.send('invalid user');
};


exports.ShowAllUser = async (req, res) => {
  let users;

  const token = req.headers.authorization;
  if (!token) return res.status(401).send('Access denied');

  const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKEN_SECRET);
  if (decodedToken.isAdmin) {
    users = User.find();
  } else {
    users = User.find({ _id: decodedToken._id });
  }

  if (users) {
    return res.res.status(200).send(users);
  }
  return res.send('invalid Token');
};

exports.ShowParticularUser = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send('Access denied');

  const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKEN_SECRET);

  const user = User.find({ _id: decodedToken._id });
  if (user) {
    return res.status(200).send(user);
  }
  return res.status(400).send('something went wrong');
};

exports.Update = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send('Access denied');

  const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKEN_SECRET);

  const updatedUser = await User.findOneAndUpdate({ _id: decodedToken._id }, { $set: { firstName: req.body.firstName } }, { new: true }, (err, updatedObeject) => {
    if (err) {
      return res.send('Something wrong when updating data!');
    }
    return res.send(updatedObeject);
  });
  return res.status(200).send(`updated user : ${updatedUser}`);
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
