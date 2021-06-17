const router = require('express').Router();
const user = require('../controllers/user.controllers.js');
const authChek = require('../middleware/authChek.middleware');
const paginate = require('../middleware/paginate.middleware');

router
  .use(authChek('admin'))
  .get('/:userId', user.getUser)
  .get('/', paginate, user.getUsers)
  .post('/', user.postUser)
  .patch('/:userId', user.patchUser)
module.exports = router;