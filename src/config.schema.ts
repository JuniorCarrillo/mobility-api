import * as Joi from 'joi';

const configSchema = Joi.object({
  HTTP_PORT: Joi.number().optional(),
  API_SECRET: Joi.string().required(),
  PARAM_PRICE_PER_MINUTE: Joi.number().required(),
  PARAM_PRICE_PER_KM: Joi.number().required(),
  PARAM_BASE_FEE: Joi.number().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_PASS: Joi.string().required(),
  DATABASE_HOST: Joi.string().hostname().required(),
  GATEWAY_API_URI: Joi.string().uri().required(),
  GATEWAY_API_KEY: Joi.string().required(),
});

export default configSchema;
