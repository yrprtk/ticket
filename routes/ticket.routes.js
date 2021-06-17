const router = require('express').Router();
const ticket = require('../controllers/ticket.controllers');
const authChek = require('../middleware/authChek.middleware');
const upload = require('../middleware/upload.middleware');
const paginate = require('../middleware/paginate.middleware');

router
  .use(authChek())
  .get('/:ticketId/file/:fileName', ticket.getFile)
  .get('/:ticketId/file', ticket.getFile)
  .get('/:ticketId', ticket.getTicket)
  .get('/', paginate, ticket.getTickets)
  .post('/', upload, ticket.postTicket)
  .patch('/:ticketId', upload, ticket.patchTicket)
module.exports = router;