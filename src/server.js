import express from 'express';

const port = 8080;
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
