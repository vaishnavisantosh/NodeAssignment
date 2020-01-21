import joi from 'joi';

const RegistrationValidation = (data) => {
  const schema = {
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().required().email(),
    password: joi.string().required().min(6).max(20),
  };
  return joi.validate(data, schema);
};

const LoginValidation = (data) => {
  const schema = {

    email: joi.string().required().email(),
    password: joi.string().required().min(6).max(20),

  };
  return joi.validate(data, schema);
};

module.exports.RegistrationValidation = RegistrationValidation;
module.exports.LoginValidation = LoginValidation;
