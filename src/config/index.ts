import dotenv from 'dotenv';

dotenv.config();

export const {APP_PORT ,DEBUG_MODE, JWT_SECERT , REFRESH_SECRET} = process.env;