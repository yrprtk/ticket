const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const config = require('../config.js');
const User = require("../models/User");
const utils = require("../utils/utils");
const logger = require('../utils/logger');

module.exports = {
  postLogin: async (req, res) => {
    try {
      if(!req.body.email || !req.body.password){return res.status(401).send({error: `email or password not entered`});}
      let user = await User.getByEmail(req.body.email); 
      if(!user){return res.status(401).send({error: `email not found`});}
      let compare = await bcrypt.compare(req.body.password, user.password);
      if(!compare){return res.status(401).send({error: `password does not match`});}
      let {accessToken, refreshToken} = createTokens(user);
      await User.updateOne({email: req.body.email}, {$push:{refreshTokens:{refreshToken}}});
      res.status(201).send({accessToken, refreshToken});
    } catch (error) {
      logger.error(`Error in postLogin.auth.controllers: ${error}`);
      res.status(500).send({error});
    }
  },
  postRefreshTokens: async (req, res) => {
    try {
      let _id = await deleteRefreshToken(req, res, false);
      let user = await User.findOne({_id});
      if(!user){return res.status(404).send({error: `user with id (${_id}) not found`});};
      let {accessToken, refreshToken} = createTokens(user);
      await User.updateOne({email: req.headers.user_email}, {$push:{refreshTokens:{refreshToken}}});
      res.status(201).send({accessToken, refreshToken});
    } catch (error) {
      logger.error(`Error in postRefreshTokens.auth.controllers: ${error}`);
      res.status(500).send({error});
    } 
  },
  postLogout: async (req, res) => {
    try {
      await deleteRefreshToken(req, res);
      res.status(200).send("ok");
    } catch (error) {
      logger.error(`Error in postLogout.auth.controllers: ${error}`);
      res.status(500).send({error});
    }
  },
}
async function deleteRefreshToken(req, res){
  try {
    let refreshToken = req.body.refreshToken;
    if(!refreshToken){return res.status(404).send({error: `refreshToken not entered`});}
    let payload = jwt.verify(refreshToken, config.tokenKey);
    // findOne (await User.findOne({email: req.headers.user_email}, {refreshTokens: {$elemMatch: {refreshToken}}})).refreshTokens[0]
    // deleteOne await User.updateOne({email: req.headers.user_email}, {$pull:{refreshTokens:{refreshToken}}})
    // deleteMany await User.updateOne({email: req.headers.user_email}, {$pull:{refreshTokens:{}}})
    let Token = (await User.findOne({email: req.headers.user_email}, {refreshTokens: {$elemMatch: {refreshToken}}})).refreshTokens[0]
    if(!Token){
      await User.updateOne({email: req.headers.user_email}, {$pull:{refreshTokens:{}}})
      return res.status(404).send({error: `refreshToken previously used, delete all session`});
    }
    await User.updateOne({email: req.headers.user_email}, {$pull:{refreshTokens:{refreshToken}}});
    return payload._id;
  } catch (error) {
    logger.error(`Error in deleteRefreshToken.auth.controllers: ${error}`);
    res.status(500).send({error});
  }
}
function createTokens(user){
  let accessToken = jwt.sign({_id: user._id, role: user.role, email: user.email, iat: Date.now()}, config.tokenKey);
  let refreshToken = jwt.sign({ _id: user._id, iat: Date.now()} , config.tokenKey);
  return {accessToken, refreshToken}
}