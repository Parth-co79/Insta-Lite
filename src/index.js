const express = require('express');
const app = express();
const usersRoutes = require('./routes/users.routes');
const postsRoutes = require('./routes/posts.routes');

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'username or email already taken' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;