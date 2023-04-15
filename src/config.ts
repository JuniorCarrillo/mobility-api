import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    gateway: {
      uri: process.env.GATEWAY_API_URI,
      key: process.env.GATEWAY_API_KEY,
    },
    param: {
      pricePerMinute: parseInt(process.env.PARAM_PRICE_PER_MINUTE, 10),
      pricePerKm: parseInt(process.env.PARAM_PRICE_PER_KM, 10),
      baseFee: parseInt(process.env.PARAM_BASE_FEE, 10),
    },
    database: {
      name: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      port: parseInt(process.env.DATABASE_PORT, 10),
      pass: process.env.DATABASE_PASS,
      host: process.env.DATABASE_HOST,
    },
    apiSecret: process.env.API_SECRET,
  };
});
