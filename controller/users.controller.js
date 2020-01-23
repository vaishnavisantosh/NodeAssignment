
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../model/User.model';
import UserServices from '../lib/userServices';

dotenv.config({ path: './.env' });

class Controller {
signUp = async (req, res) => {
  try {
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).send('email already exists!!');

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

signIn = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('email not found');

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('incorrect password!!');

    const isAdmin = user && user.firstName === 'admin' ? 1 : 0;

    const loggedUser = await UserServices.saveLoggedInUser(req, res, user);

    const token = jwt.sign({ _id: user._id, admin: isAdmin }, process.env.TOKENSECRET);
    res.header('authentication-token', token);
    return res.send(`logged in!! ${loggedUser}  authentication-token: ${token}`);
  } catch (err) {
    return res.send('something went wrong');
  }
};

showAllUser = async (req, res) => {
  try {
    const users = await UserServices.showUsers(req);
    return res.status(200).send(users);
  } catch (err) {
    return res.send('somthing ');
  }
};

showParticularUser = async (req, res) => {
  try {
    const user = await UserServices.showUsers(req);
    return res.status(200).send(user);
  } catch (err) {
    return res.status(400).send('something went wrong');
  }
};

update = async (req, res) => {
  try {
    const updatedUser = await UserServices.updateUser(req, res);

    return res.status(200).send(`updated user : ${updatedUser}`);
  } catch (error) {
    return res.status(400).send('something went wrong');
  }
};

userActivity = async (req, res) => {
  try {
    const date = new Date();
    const dt = date.setDate(date.getDate() - process.env.INACTIVEDAYS);

    const activeUser = UserServices.activeUser(dt);

    return res.status(200).send(activeUser);
  } catch (error) {
    return res.status(400).send('something went wrong');
  }
};
}

export default new Controller();
