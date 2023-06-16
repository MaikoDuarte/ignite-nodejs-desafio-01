import express from 'express';
import Task from './models/task.model.js';
import db from './config/db.js';
import importCsv from './importCsv.js';
import readline from 'readline';

const app = express();
db.connect();

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Um erro inesperado ocorreu' });
});

process.on('uncaughtException', (err) => {
  console.error('Caught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Os campos title e description são obrigatórios' });
  }

  try {
    const task = new Task({
      title,
      description,
      created_at: new Date(),
      updated_at: new Date(),
      completed_at: null,
    });

    await task.save();

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});


app.get('/tasks', async (req, res) => {
  const { title, description } = req.query;

  let filter = {};

  if (title) {
    filter.title = new RegExp(title, 'i');
  }

  if (description) {
    filter.description = new RegExp(description, 'i');
  }

  try {
    const tasks = await Task.find(filter);

    if (tasks.length === 0) {
      return res.status(400).json({ message: 'Tarefa não encontrada.' });
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title && !description) {
    return res.status(400).json({ message: 'Coloque o title e/ou description para atualizar.' });
  }

  try {
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: 'Tarefa não encontrada.' });
    } else {
      if (title) {
        task.title = title;
      }

      if (description) {
        task.description = description;
      }

      task.updated_at = Date.now();

      await task.save();

      res.json(task);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


app.patch('/tasks/:id/complete', async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).send({ error: 'Tarefa não encontrada' });
    }

    if (task.completed_at) {
      task.completed_at = null;
    } else {
      task.completed_at = Date.now();
    }

    task.updated_at = Date.now();
    await task.save();

    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  setTimeout(() => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Deseja importar o arquivo CSV? (s/n): ', (answer) => {
      if (answer.toLowerCase() === 's') {
        importCsv();
      } else {
        console.log('Importação do arquivo CSV cancelada.');
      }
      rl.close();
    });
  }, 1000);
});
