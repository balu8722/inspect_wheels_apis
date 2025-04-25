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
    // retrieving token
    let token = req?.headers?.authorization?.split(" ")[1];
    // decrypting the token and parsing the data
    let data = await jwt.verify(token, ENV_DATA.JWT_SECRET_KEY);
    let isUser = JSON.parse(decryptData(data.encryptedData));
    /**
     * checking the user is exist or not by email
     */
    let isUserExists = await mySQLInstance.executeQuery(authQueries.isAdminPresent(isUser.source_table), [isUser.id])
   
    if (isUserExists.length < 1) {
      return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED);
    }
    
    req.user= {...isUserExists[0], ...isUser};
    next();
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
    /**
     * checking the user is exist or not by email
     */
    let isUserExists=await mySQLInstance.executeQuery(authQueries.isAdminPresent(CONSTANTS.DATA_TABLES.ADMINS), [isUser.id])

        if (isUserExists.length < 1) {
          return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED);
        }
        let {password, ...userData}=isUserExists[0]
        req.user= {...userData};
        next();
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

// check the forgot password token for admins
module.exports.verifyForgotPasswordToken = async (req, res, next) => {
  try {
    let {token} = req.params;
    if(token){
    // decrypting the token and parsing the data
    let data = await jwt.verify(token, ENV_DATA.JWT_SECRET_KEY);
    let isUser = JSON.parse(decryptData(data.encryptedData));

    /**
     * checking the user is exist or not by email
     */
    let isUserExists=await mySQLInstance.executeQuery(authQueries.isAdminPresent(CONSTANTS.DATA_TABLES.ADMINS), [isUser.id])

        if (isUserExists.length < 1) {
          return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED);
        }
        let {password, ...userData}=isUserExists[0]
        req.user= {...userData,...isUser};
        next();
      }else{
        return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED);
      }
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



