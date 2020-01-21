
/* eslint-disable no-underscore-dangle */
import dotenv from 'dotenv';
import express from 'express';
import controllers from '../controller/users.controller';

const router = express.Router();
dotenv.config({ path: './.env' });

router.post('/register', controllers.SignUp);
router.post('/login', controllers.SignIn);
router.get('/dashboard', controllers.ShowAllUser);
router.get('/dashboard/:id', controllers.ShowParticularUser);
router.put('/users/:id', controllers.Update);
router.get('/useractivity', controllers.UserActivity);

module.exports = router;
