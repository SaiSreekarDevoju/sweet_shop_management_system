import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // Server started
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

