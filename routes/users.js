
/* eslint-disable no-underscore-dangle */

import express from 'express';
import Controllers from '../controller/users.controller';
import Validations from '../middleware/validation';
import Authentication from '../middleware/authentication';

const router = express.Router();

router.post('/register', Validations.registrationValidation, Controllers.signUp);
router.post('/login', Validations.loginValidation, Controllers.signIn);
router.get('/dashboard', Authentication.auth, Controllers.showAllUser);
router.get('/dashboard/:id', Authentication.auth, Controllers.showParticularUser);
router.put('/users/:id', Authentication.auth, Controllers.update);
router.get('/useractivity', Controllers.userActivity);

module.exports = router;
