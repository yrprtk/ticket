const router = require('express').Router();
const auth = require('../controllers/auth.controllers.js');
const authChek = require('../middleware/authChek.middleware');

router
  .post('/login', auth.postLogin)
  .post('/refresh-tokens', auth.postRefreshTokens)
  .post('/logout', authChek(), auth.postLogout)
module.exports = router;