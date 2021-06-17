const router = require('express').Router({ mergeParams: true });
const comment = require('../controllers/comment.controllers');
const authChek = require('../middleware/authChek.middleware');
const upload = require('../middleware/upload.middleware');

router
  .use(authChek())
  .get('/:commentId/file/:fileName', comment.getFile)
  .get('/:commentId/file', comment.getFile)
  .get('/:commentId', comment.getComment)
  .get('/', comment.getComment)
  .post('/', upload, comment.postComment)
  .patch('/:commentId', upload, comment.patchComment);
module.exports = router;
