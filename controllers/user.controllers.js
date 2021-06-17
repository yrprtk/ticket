const User = require('../models/User');
const utils = require('../utils/utils');
const logger = require('../utils/logger');

module.exports = {
  getUsers: async (req, res) => {
    try {
      const getObj = {};
      if (req.query.role) {
        getObj.role = req.query.role;
      }
      const [{ users, usersCount }] = await User.aggregate([
        {
          $facet: {
            users: [
              { $match: getObj },
              { $skip: req.query.skip },
              { $limit: req.query.limit },
              { $sort: { created: req.query.sort } },
            ],
            usersCount: [{ $match: {} }, { $count: 'usersCount' }],
          },
        },
      ]);
      if (!users.length) {
        return res.status(404).send({ error: `user not found` });
      }
      res.setHeader('X-Total-Count', usersCount[0].usersCount);
      return res.status(200).send(users);
    } catch (error) {
      logger.error(`Error in getUser.user.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.userId });
      if (!user) {
        return res.status(404).send({ error: `user not found` });
      }
      return res.status(200).send(user);
    } catch (error) {
      logger.error(`Error in getUser.user.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  postUser: async (req, res) => {
    try {
      utils.deletePropFromObj(req.body, ['created', 'updated']);
      const newUser = new User(req.body);
      await newUser.save();
      res.status(201).send(newUser);
    } catch (error) {
      logger.error(`Error in postUser.user.controllers: ${error}`);
      res.status(500).send({ error });
    }
  },
  patchUser: async (req, res) => {
    try {
      utils.deletePropFromObj(req.body, ['created', 'updated']);
      res.status(200).send(
        await User.updateOne({ _id: req.params.userId }, req.body, {
          runValidators: true,
        })
      );
    } catch (error) {
      logger.error(`Error in patchUser.user.controllers: ${error}`);
      res.status(500).send({ error });
    }
  },
};
