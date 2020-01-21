/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/named */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../model/User.model';
import UserActivity from '../model/UserActivity.model';
import { loginValidation, registrationValidation } from '../lib/validator';
import UserServices from '../lib/userServices';

dotenv.config({ path: './.env' });

exports.SignUp = async (req, res) => {
  try {
    const { error } = registrationValidation(req.body);
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).send('email already exists!!');
    if (error) return res.status(400).send(error.details[0].message);

    const salt = bcrypt.genSaltSync(10);
    const encryptedPass = bcrypt.hashSync(req.body.password, salt);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: encryptedPass,
    });

    const savedUser = await user.save();
    return res.status(200).send(savedUser);
  } catch (err) {
    return res.status(400).send(err);
  }
};

exports.SignIn = async (req, res) => {
  try {
    let isAdmin;
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('email not found');

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('incorrect password!!');

    if (user && user.firstName === 'admin') {
      isAdmin = true;
    } else {
      isAdmin = false;
    }

    const loggedUser = await UserServices.saveLoggedInUser(req, res, user);

    const token = jwt.sign({ _id: user._id }, process.env.TOKENSECRET);
    res.header('authentication-token', token);
    return res.send(`logged in!! ${loggedUser}  authentication-token: ${token}`);
  } catch (err) {
    return res.send(err);
  }
};

exports.ShowAllUser = async (req, res) => {
  let users;

  const token = req.headers.authorization;
  if (!token) return res.status(401).send('Access denied');

  const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKENSECRET);


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
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send('Access denied');

    const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKENSECRET);

    const user = await User.find({ _id: decodedToken._id });
    return res.status(200).send(user);
  } catch (err) {
    return res.status(400).send('something went wrong');
  }
};

exports.Update = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send('Access denied');

    const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKENSECRET);

    const updatedUser = await UserServices.updateUser(req, res, decodedToken);

    return res.status(200).send(`updated user : ${updatedUser}`);
  } catch (error) {
    return res.status(400).send('something went wrong');
  }
};

exports.UserActivity = async (req, res) => {
  try {
    const date = new Date();
    const dt = date.setDate(date.getDate() - process.env.INACTIVEDAYS);

    await UserActivity

      .find({ loginDate: { $lt: dt } })

      .populate('users')

      .exec();

    return res.status(200);
  } catch (error) {
    return res.status(400).send(error);
  }
};
