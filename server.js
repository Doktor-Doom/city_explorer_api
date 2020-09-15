'use-strict';

require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;

app.use(express.static('./data'));

app.get('/', function (req, res) {
  res.send('Whats\'s good, Hollywood?');
});

// app.listen(PORT, () => {
//   console.log(`listening on port ${PORT}`);
// });

// ========Start server===========
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

