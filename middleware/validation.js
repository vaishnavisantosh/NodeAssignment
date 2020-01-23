import joi from 'joi';

class Valiadtion {
    loginValidation=(req, res, next) => {
      const schema = {

        email: joi.string().required().email(),
        password: joi.string().required().min(6).max(20),

      };
      joi.validate(req.body, schema, (err, value) => {
        if (err) return res.status(400).send(err.details[0].message);

        next();
      });
    }

    registrationValidation=(req, res, next) => {
      const schema = {
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: joi.string().required().email(),
        password: joi.string().required().min(6).max(20),
      };
      joi.validate(req.body, schema, (err, value) => {
        if (err) return res.status(400).send(err.details[0].message);
        next();
      });
    }
}

export default new Valiadtion();
