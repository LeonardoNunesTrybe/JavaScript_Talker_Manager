const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const generateToken = require('./utils/generateToken');
const auth = require('./middlewares/auth');
const validateEmail = require('./middlewares/validateEmail');
const validatePassword = require('./middlewares/validatePassword');
const validateAge = require('./middlewares/validateAge');
const validateName = require('./middlewares/validateName');
const validateRate = require('./middlewares/validateRate');
const validateTalk = require('./middlewares/validateTalk');
const validateWatchedAt = require('./middlewares/validateWatchedAt');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

const talkerPath = path.resolve(__dirname, './talker.json');

const readFile = async () => {
  try {
    const data = await fs.readFile(talkerPath);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Arquivo não pôde ser lido: ${error}`);
  }
};

/* / const writeFile = async () => {
  try {
    await fs.writeFile(talkerPath);
    return JSON.stringify(data);    
  } catch (error) {
    console.error(`Arquivo não pôde ser escrito: ${error}`);
  }
}; / */

app.get('/talker', async (req, res) => {
  try {
    const talker = await readFile();
    res.status(200).json(talker);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get('/talker/:id', async (req, res) => {
  try {
    const talkers = await readFile();
    const talker = talkers.find(({ id }) => id === Number(req.params.id));
    if (!talker) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    return res.status(200).json(talker);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.post('/login', validateEmail, validatePassword, async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].includes(undefined)) {
    return res.status(401).json({ message: 'Campos ausentes' });
  }

  const token = generateToken();

  return res.status(200).json({ token });
});

app.post('/talker', 
auth, 
validateName, 
validateAge, 
validateTalk, 
validateWatchedAt, 
validateRate, 
async (req, res) => {
  const { name, age, talk } = req.body;
  const talkers = await readFile();
  const nextId = talkers.length + 1;
  const newTalker = { id: nextId, name, age, talk };
  talkers.push(newTalker);

  await fs.writeFile('./src/talker.json', JSON.stringify(talkers), (error) => {
    if (error) {
      return res.status(400).json({ message: 'Erro ao escrever no arquivo talker.json' });
    }
  });
  res.status(201).json(newTalker);
});

app.put('/talker/:id', 
auth, 
validateName, 
validateAge, 
validateTalk, 
validateWatchedAt, 
validateRate, 
async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, talk } = req.body;
    const talkers = await readFile();
    const index = talkers.findIndex((talker) => talker.id === Number(id));
    if (index === -1) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    talkers[index] = { id: Number(id), name, age, talk };
    const updateTalker = JSON.stringify(talkers, null, 2);
    await fs.writeFile(talkerPath, updateTalker);
    res.status(200).json(talkers[index]);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.delete('/talker/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const talkers = await readFile();
    const filteredTalkers = talkers.filter((talker) => talker.id !== Number(id));
    const updateTalkers = JSON.stringify(filteredTalkers, null, 2);
    await fs.writeFile(talkerPath, updateTalkers);
    res.status(204).end();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = app;
