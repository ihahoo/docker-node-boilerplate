import express from 'express';
import config from '../config/app/config.json';

const port = config.port;
const app = express();

app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.listen(port, (err) => {
  if (err) {
    console.error(`=> OMG!!! 🙀 ${err}`);
  } else {
    console.info('==> 🚀 Running on http://localhost: %s', port);
  }
});
