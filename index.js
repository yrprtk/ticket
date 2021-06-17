const mongoose = require('mongoose');
const express = require('express');
const config = require('./config');

const app = express();
const logger = require('./utils/logger');

app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(`${__dirname}/uploads`));

app.use('/api/user', require('./routes/user.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/ticket/:ticketId/comment', require('./routes/comment.routes'));
app.use('/api/ticket', require('./routes/ticket.routes'));

app.use((req, res) => {
  res.status(404).send('Not found');
});

(async () => {
  try {
    await mongoose.connect(config.dbURL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    app.listen(config.port, () =>
      logger.info(`Server start in ${config.port} port`)
    );
  } catch (error) {
    logger.error(`Error in server: ${error.message}`);
    process.exit(1);
  }
})();
