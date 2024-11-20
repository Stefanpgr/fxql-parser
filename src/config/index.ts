import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), './.env'),
});

export default {
  port: process.env.PORT || 3000,
}