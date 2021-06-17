const Ticket = require('../models/Ticket');
const utils = require('../utils/utils');
const logger = require('../utils/logger');

function createObjAndChekRole(req, res) {
  const getObj = {};
  switch (req.headers.user_role) {
    case 'admin':
      break;
    case 'engineer':
      getObj.engineer_id = req.headers.user_id;
      break;
    case 'user':
      getObj.user_id = req.headers.user_id;
      break;
    default:
      return res.status(403).send({ error: `you role cannot get tickets` });
  }
  return getObj;
}

module.exports = {
  getTickets: async (req, res) => {
    try {
      const getObj = createObjAndChekRole(req, res);
      if (req.query.status) {
        getObj.status = req.query.status;
      }
      const [{ ticket, ticketCount }] = await Ticket.aggregate([
        {
          $facet: {
            ticket: [
              { $match: getObj },
              { $skip: req.query.skip },
              { $limit: req.query.limit },
              { $sort: { created: req.query.sort } },
            ],
            ticketCount: [{ $match: {} }, { $count: 'ticketCount' }],
          },
        },
      ]);
      if (!ticket.length) {
        return res.status(404).send({ error: `ticket not found` });
      }
      res.setHeader('X-Total-Count', ticketCount[0].ticketCount);
      return res.status(200).send(ticket);
    } catch (error) {
      logger.error(`Error in getTickets.ticket.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  getTicket: async (req, res) => {
    try {
      const getObj = createObjAndChekRole(req, res);
      getObj._id = req.params.ticketId;
      const ticket = await Ticket.findOne(getObj);
      if (!ticket) {
        return res.status(404).send({ error: `ticket not found` });
      }
      return res.status(200).send(ticket);
    } catch (error) {
      logger.error(`Error in getTicket.ticket.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  postTicket: async (req, res) => {
    try {
      req.body.files = req.files;
      switch (req.headers.user_role) {
        case 'admin':
          utils.deletePropFromObj(req.body, ['created', 'updated']);
          break;
        case 'user':
          utils.deletePropFromObj(req.body, [
            'engineer_id',
            'status',
            'created',
            'updated',
          ]);
          req.body.user_id = req.headers.user_id;
          break;
        default:
          return res.status(403).send({ error: `you role cannot post ticket` });
      }
      return res.status(201).send(await Ticket.create(req.body));
    } catch (error) {
      logger.error(`Error in postTicket.ticket.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  patchTicket: async (req, res) => {
    try {
      const patchObj = { _id: req.params.ticketId };
      req.body.files = req.files;
      switch (req.headers.user_role) {
        case 'admin':
          utils.deletePropFromObj(req.body, [
            'sn',
            'user_id',
            'created',
            'updated',
            'files',
          ]);
          break;
        case 'engineer':
          patchObj.engineer_id = req.headers.user_id;
          utils.deletePropFromObj(req.body, [
            'sn',
            'priority',
            'title',
            'description',
            'user_id',
            'engineer_id',
            'created',
            'updated',
            'files',
          ]);
          if (req.body.status && req.body.status !== 'close') {
            return res
              .status(403)
              .send({ error: `you role can set status only close` });
          }
          break;
        default:
          return res.status(403).send({ error: `you role cannot patchTicket` });
      }
      return res
        .status(202)
        .send(
          await Ticket.updateOne(patchObj, req.body, { runValidators: true })
        );
    } catch (error) {
      logger.error(`Error in patchTicket.ticket.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  getFile: async (req, res) => {
    try {
      const getObj = createObjAndChekRole(req, res);
      getObj._id = req.params.ticketId;
      const ticket = await Ticket.findOne(getObj);
      if (!ticket) {
        return res.status(404).send({ error: `ticket not found` });
      }
      if (req.params.fileName) {
        const file = ticket.files.find(
          () => file.filename === req.params.fileName
        );
        if (!(file && (await utils.checkFileExists(file.path)))) {
          return res.status(404).send({ error: `file not found` });
        }
        return res.status(200).sendFile(file.path);
      }
      return res.status(200).send(ticket.files);
    } catch (error) {
      logger.error(`Error in getFile.ticket.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
};
