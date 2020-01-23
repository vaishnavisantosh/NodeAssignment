import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

class Authentication {
 auth = (req, res, next) => {
   const token = req.header('authorization');
   if (!token) return res.status(401).send('Access denied');

   jwt.verify(token, process.env.TOKENSECRET, (err, verfiedUser) => {
     if (err) return res.status(400).send('invalid token');
     req.user = verfiedUser;
     next();
   });
 }
}

export default new Authentication();
