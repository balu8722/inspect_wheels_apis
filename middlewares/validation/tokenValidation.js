var jwt = require("jsonwebtoken");
const { ENV_DATA } = require("../../config/config");
const {
  decryptData,
  returnData,
  _serverErrorMsg,
} = require("../../utils/common");
const { authQueries } = require("../../database/queries/auth_queries");
const { saveLoggers } = require("../logger/logger");
const { CONSTANTS } = require("../../utils/constants");
const mySQLInstance = require("../../database/database_connection");

// verify the token
module.exports.verifyToken = async (req, res, next) => {
  try {
    const { isAdmin } = req.body;
    // retrieving token
    let token = req?.headers?.authorization?.split(" ")[1];
    // decrypting the token and parsing the data
    let data = await jwt.verify(token, ENV_DATA.JWT_SECRET_KEY);
    let isUser = JSON.parse(decryptData(data.encryptedData));
    // console.log("🚀 ~ module.exports.verifyToken= ~ isUser:", isUser);
    req.body.userCode = isUser.accountId;

    /**
     * checking the user is exist or not by email
     */
    mySQLInstance
      .executeQuery(authQueries.isUserPresent(isAdmin), [
        isUser.email,
        isUser.phoneNumber,
      ])
      .then((result) => {
        if (result.length < 1) {
          return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED);
        }
        /**
         * including the result in req body to further usage
         */
        req.decodedToken = { tokenresult: result };
        next();
      })
      .catch((err) => {
        // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
        saveLoggers(res, err);
        return returnData(
          res,
          500,
          err.message || CONSTANTS.STATUS_MSG.ERROR.SERVER
        );
      });
  } catch (error) {
    saveLoggers(res, error);
    // token expired, throwing the error
    if (error.message === "jwt expired") {
      return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.TOKEN_EXPIRED);
    }
    return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED);
  }
};

// verify admin token
module.exports.verifyAdminToken = async (req, res, next) => {
  try {
    let token = req?.headers?.authorization?.split(" ")[1];
    // decrypting the token and parsing the data
    let data = await jwt.verify(token, ENV_DATA.JWT_SECRET_KEY);
    let isUser = JSON.parse(decryptData(data.encryptedData));
    // console.log("🚀 ~ module.exports.verifyAdminToken= ~ isUser:", isUser)

    /**
     * checking the user is exist or not by email
     */
    mySQLInstance
      .executeQuery(authQueries.isAdminPresent(isUser.sourcetable), [
        isUser.email,
        isUser.phoneNumber,
      ])
      .then((result) => {
        if (result.length < 1) {
          return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED);
        }
        /**
         * including the result in req body to further usage
         */
        // console.log("🚀 ~ .then ~ result:", result)
        result[0] = { ...result[0], sourcetable: isUser?.sourcetable || "" };

        req.decodedToken = { tokenresult: result };
        next();
      })
      .catch((err) => {
        // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
        saveLoggers(res, err);
        return returnData(
          res,
          500,
          err.message || CONSTANTS.STATUS_MSG.ERROR.SERVER
        );
      });
  } catch (error) {
    // console.log("🚀 ~ module.exports.verifyToken= ~ error:", error)
    saveLoggers(res, error.message);
    // token expired, throwing the error
    if (error.message === "jwt expired") {
      return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.TOKEN_EXPIRED);
    }
    return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED);
  }
};

// verify if it has the token or not
module.exports.verifyIsTokenExist = async (req, res, next) => {
  try {
    let token = req?.headers?.authorization?.split(" ")[1];
    if (token) {
      // decrypting the token and parsing the data
      let data = await jwt.verify(token, ENV_DATA.JWT_SECRET_KEY);
      let isUser = JSON.parse(decryptData(data.encryptedData));
      // console.log("🚀 ~ module.exports.verifyIsTokenExist= ~ isUser:", isUser)
      req.body.userCode = isUser.accountId;
    }
    next();
  } catch (error) {
    saveLoggers(res, error.message);
    return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED);
  }
};

