const Ticket = require('../models/Ticket');
const utils = require('../utils/utils');
const logger = require('../utils/logger');

async function findTicketAndChekAccess(req, res) {
  const ticket = await Ticket.findOne({ _id: req.params.ticketId });
  if (!ticket) {
    res.status(404).send({ error: `ticket not found` });
  }
  switch (req.headers.user_role) {
    case 'admin':
      break;
    case 'user':
      if (ticket.user_id !== req.headers.user_id) {
        return res
          .status(403)
          .send({ error: `user can get only their ticket` });
      }
      break;
    case 'engineer':
      if (ticket.engineer_id !== req.headers.user_id) {
        return res
          .status(403)
          .send({ error: `engineer can get only their ticket` });
      }
      break;
    default:
      return res.status(403).send({ error: `you role cannot get ticket` });
  }
  return ticket;
}
function findComment(ticket, req, res) {
  const comment = ticket.comments.find(
    () => comment._id === req.params.commentId
  );
  if (!comment) {
    return res.status(404).send({ error: `comment not found` });
  }
  return comment;
}

module.exports = {
  getComment: async (req, res) => {
    try {
      const ticket = await findTicketAndChekAccess(req, res);
      if (!req.params.commentId) {
        return res.status(200).send(ticket.comments);
      }
      const comment = findComment(ticket, req, res);
      return res.status(200).send(comment);
    } catch (error) {
      logger.error(`Error in getComment.comment.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  postComment: async (req, res) => {
    try {
      await findTicketAndChekAccess(req, res);
      req.body.files = req.files;
      req.body.user_id = req.headers.user_id;
      utils.deletePropFromObj(req.body, ['created', 'updated']);
      res
        .status(201)
        .send(
          await Ticket.updateOne(
            { _id: req.params.ticketId },
            { $push: { comments: req.body } },
            { runValidators: true }
          )
        );
    } catch (error) {
      logger.error(`Error in postComment.comment.controllers: ${error}`);
      res.status(500).send({ error });
    }
  },
  patchComment: async (req, res) => {
    try {
      const comment = (
        await Ticket.findOne(
          { _id: req.params.ticketId },
          { comments: { $elemMatch: { _id: req.params.commentId } } }
        )
      ).comments;
      if (!comment.length) {
        return res.status(404).send({ error: `comment not found` });
      }
      switch (req.headers.user_role) {
        case 'admin':
          break;
        case 'user':
        case 'engineer':
          if (comment.user_id !== req.headers.user_id) {
            return res
              .status(403)
              .send({ error: `only owners or admin can patchComment` });
          }
          break;
        default:
          return res
            .status(403)
            .send({ error: `you role cannot patchComment` });
      }
      req.body.files = req.files;
      utils.deletePropFromObj(req.body, [
        'user_id',
        'created',
        'updated',
        'files',
      ]);
      return res.status(202).send(
        await Ticket.updateOne(
          { _id: req.params.ticketId, 'comments._id': req.params.commentId },
          {
            $set: {
              'comments.$.text': req.body.text,
              'comments.$.updated': new Date(),
            },
          },
          { runValidators: true }
        )
      );
    } catch (error) {
      logger.error(`Error in patchComment.comment.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  getFile: async (req, res) => {
    try {
      const ticket = await findTicketAndChekAccess(req, res);
      const comment = findComment(ticket, req, res);
      if (!comment.files.length) {
        return res.status(404).send({ error: `file not found` });
      }
      if (!req.params.fileName) {
        return res.status(200).send(comment.files);
      }
      const file = comment.files.find(
        () => file.filename === req.params.fileName
      );
      if (!(file && (await utils.checkFileExists(file.path)))) {
        return res.status(404).send({ error: `file not found` });
      }
      return res.status(200).sendFile(file.path);
    } catch (error) {
      logger.error(`Error in getFile.comment.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
};
