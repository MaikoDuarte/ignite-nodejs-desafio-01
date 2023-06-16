import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, './.env')});

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  
  console.log("Conectado ao mongoDB Atlas");

} catch (err) {
  console.log("Não foi possível se conectar ao banco de dados");
}
}

export default { connect };