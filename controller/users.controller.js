
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../model/User.model';
import validator from '../lib/validator';
import UserServices from '../lib/userServices';

const userServices = new UserServices();
dotenv.config({ path: './.env' });

exports.SignUp = async (req, res) => {
  try {
    const { error } = validator.registrationValidation(req.body);
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
    // let isAdmin;
    const { error } = validator.loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('email not found');

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('incorrect password!!');

    const isAdmin = user && user.firstName === 'admin' ? 1 : 0;

    const loggedUser = await userServices.SaveLoggedInUser(req, res, user);

    const token = jwt.sign({ _id: user._id, admin: isAdmin }, process.env.TOKENSECRET);
    res.header('authentication-token', token);
    return res.send(`logged in!! ${loggedUser}  authentication-token: ${token}`);
  } catch (err) {
    return res.send('something went wrong');
  }
};

exports.ShowAllUser = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send('Access denied');

    const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKENSECRET);
    const users = await userServices.ShowUsers(req, res, decodedToken);
    return res.status(200).send(users);
  } catch (err) {
    return res.send('invalid Token');
  }
};

exports.ShowParticularUser = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send('Access denied');

    const decodedToken = jwt.verify(req.headers.authorization, process.env.TOKENSECRET);

    const user = await userServices.ShowUsers(decodedToken);
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

    const updatedUser = await userServices.UpdateUser(req, res, decodedToken);

    return res.status(200).send(`updated user : ${updatedUser}`);
  } catch (error) {
    return res.status(400).send('something went wrong');
  }
};

exports.UserActivity = async (req, res) => {
  try {
    const date = new Date();
    const dt = date.setDate(date.getDate() - process.env.INACTIVEDAYS);

    const activeUser = userServices.ActiveUser(dt);

    return res.status(200).send(activeUser);
  } catch (error) {
    return res.status(400).send('something went wrong');
  }
};
