import fs from 'fs';
import { parse } from 'csv-parse';
import axios from 'axios';

function importCsv() {
  const csvFilePath = './src/data/tasks.csv';

  const readStream = fs.createReadStream(csvFilePath);
  const taskStream = readStream.pipe(parse({ from_line: 2 }));

  taskStream.on('data', async (data) => {
    const [title, description] = data;
    try {
      await axios.post('http://localhost:5000/tasks', { title, description });
    } catch (error) {
      console.error(error);
    }
  });

  taskStream.on('end', () => {
    console.log('Importação concluída.');
  });
}

export default importCsv;
