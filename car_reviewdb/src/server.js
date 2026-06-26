import app from './app.js';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import dns from 'node:dns'

dns.setDefaultResultOrder('ipv4first')

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});
