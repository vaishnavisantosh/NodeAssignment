
/* eslint-disable no-underscore-dangle */
import dotenv from 'dotenv';
import express from 'express';
import controllers from '../controller/users.controller';

const router = express.Router();
dotenv.config({ path: './.env' });

router.post('/register', controllers.signUp);
router.post('/login', controllers.signin);
router.get('/dashboard', controllers.showAlluser);
router.get('/dashboard/:id', controllers.showParticularuser);
router.put('/users/:id', controllers.update);
router.get('/useractivity', controllers.userActivity);

module.exports = router;
