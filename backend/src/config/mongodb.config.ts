import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
    uri: process.env.MONGODB_URI,
    database: process.env.MONGODB_DATABASE,
}));
