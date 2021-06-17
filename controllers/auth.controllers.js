const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');
const logger = require('../utils/logger');

async function deleteRefreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(404).send({ error: `refreshToken not entered` });
    }
    const payload = jwt.verify(refreshToken, config.tokenKey);
    // findOne (await User.findOne({email: req.headers.user_email}, {refreshTokens: {$elemMatch: {refreshToken}}})).refreshTokens[0]
    // deleteOne await User.updateOne({email: req.headers.user_email}, {$pull:{refreshTokens:{refreshToken}}})
    // deleteMany await User.updateOne({email: req.headers.user_email}, {$pull:{refreshTokens:{}}})
    const Token = (
      await User.findOne(
        { email: req.headers.user_email },
        { refreshTokens: { $elemMatch: { refreshToken } } }
      )
    ).refreshTokens[0];
    if (!Token) {
      await User.updateOne(
        { email: req.headers.user_email },
        { $pull: { refreshTokens: {} } }
      );
      return res
        .status(404)
        .send({ error: `refreshToken previously used, delete all session` });
    }
    await User.updateOne(
      { email: req.headers.user_email },
      { $pull: { refreshTokens: { refreshToken } } }
    );
    return payload._id;
  } catch (error) {
    logger.error(`Error in deleteRefreshToken.auth.controllers: ${error}`);
    return res.status(500).send({ error });
  }
}
function createTokens(user) {
  const accessToken = jwt.sign(
    { _id: user._id, role: user.role, email: user.email, iat: Date.now() },
    config.tokenKey
  );
  const refreshToken = jwt.sign(
    { _id: user._id, iat: Date.now() },
    config.tokenKey
  );
  return { accessToken, refreshToken };
}
module.exports = {
  postLogin: async (req, res) => {
    try {
      if (!req.body.email || !req.body.password) {
        return res.status(401).send({ error: `email or password not entered` });
      }
      const user = await User.getByEmail(req.body.email);
      if (!user) {
        return res.status(401).send({ error: `email not found` });
      }
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (!compare) {
        return res.status(401).send({ error: `password does not match` });
      }
      const { accessToken, refreshToken } = createTokens(user);
      await User.updateOne(
        { email: req.body.email },
        { $push: { refreshTokens: { refreshToken } } }
      );
      return res.status(201).send({ accessToken, refreshToken });
    } catch (error) {
      logger.error(`Error in postLogin.auth.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  postRefreshTokens: async (req, res) => {
    try {
      const _id = await deleteRefreshToken(req, res, false);
      const user = await User.findOne({ _id });
      if (!user) {
        return res
          .status(404)
          .send({ error: `user with id (${_id}) not found` });
      }
      const { accessToken, refreshToken } = createTokens(user);
      await User.updateOne(
        { email: req.headers.user_email },
        { $push: { refreshTokens: { refreshToken } } }
      );
      return res.status(201).send({ accessToken, refreshToken });
    } catch (error) {
      logger.error(`Error in postRefreshTokens.auth.controllers: ${error}`);
      return res.status(500).send({ error });
    }
  },
  postLogout: async (req, res) => {
    try {
      await deleteRefreshToken(req, res);
      res.status(200).send('ok');
    } catch (error) {
      logger.error(`Error in postLogout.auth.controllers: ${error}`);
      res.status(500).send({ error });
    }
  },
};
