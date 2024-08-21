const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Add this line for UUID generation
const app = express();

const allowedOrigins = [
    'https://theboutique.vercel.app',
    'http://localhost:3001'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-API-Key'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(express.json());

// Middleware to log the headers for debugging
app.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
  res.on('finish', () => {
    console.log('Response Headers:', res.getHeaders());
  });
  next();
});

const API_KEY = '11ee5c6b-502d-f7f0-98ae-438dafef0754'; 
const BASE_URL = 'https://retune.so/api/chat';

app.get('/thebotique/', (req, res) => {
  res.send('Welcome to the API Gateway!');
});

app.post('/thebotique/api/new-thread', async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/11ef5cba-dfb1-ab10-aeb8-2303c07df984/new-thread`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'X-Workspace-API-Key': API_KEY
      },
    });
    console.log('Response Headers (new-thread):', response.headers);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

app.post('/thebotique/api/response', async (req, res) => {
  const { threadId, input } = req.body;
  try {
    const response = await axios.post(`${BASE_URL}/11ef5cba-dfb1-ab10-aeb8-2303c07df984/response`, { threadId, input }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Workspace-API-Key': API_KEY
      },
      timeout: 60000 // Set timeout to 10 seconds
    });
    console.log('Response Headers (response):', response.headers);
    res.json(response.data);
  } catch (error) {
    console.error('Error in /api/response:', error);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// New route to handle streaming response from re:tune API
app.post('/thebotique/api/stream-response', async (req, res) => {
  const { input } = req.body;
  const chatId = '11ef5cba-dfb1-ab10-aeb8-2303c07df984';

  const data = {
    chatId: chatId,
    threadId: uuidv4(),
    input: input,
    inputId: uuidv4(),
    messageId: uuidv4(),
    role: 'user',
  };

  try {
    const response = await axios({
      method: 'post',
      url: 'https://retune.so/api/latest/stream/createChatResponse',
      headers: {
        'Content-Type': 'application/json',
        'x-retune-chat-id': chatId,
      },
      data: data,
      responseType: 'stream',
      // timeout: 60000,
    });
    console.log(data);
    console.log('Response Headers (stream-response):', response.headers);
    res.setHeader('Content-Type', 'text/plain'); // Ensure plain text response
    response.data.on('data', (chunk) => {
      res.write(chunk.toString('utf-8'));  // Send the raw text
    });

    response.data.on('end', () => {
      res.end();
    });

  } catch (error) {
    console.error('Error in /api/stream-response:', error);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});


// Handle any errors and log them
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
