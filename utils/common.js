var moment = require("moment");
const momentTz = require("moment-timezone");
const { CONSTANTS } = require("../utils/constants.js");
const { saveLoggers } = require("../middlewares/logger/logger.js");

var jwt = require("jsonwebtoken");
const { ENV_DATA } = require("../config/config");
const { log } = require("winston");

// timestamp
const _presenttimestamp = moment().format("YYYY-MM-DD HH:mm:ss");
const presenttimestamp = () => {
  // const indianTime = momentTz().tz("Asia/Kolkata");
  const indianTime = momentTz();
  const formattedTime = indianTime.format("YYYY-MM-DD HH:mm:ss");
  return formattedTime;
};

// encryptionkey
const encryptionKey = "inspectWheelsEncryptionKey";
// Encryption function
const encryptData = (data) => {
  let encryptedData = "";
  for (let i = 0; i < data.length; i++) {
    const charCode =
      data.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
    encryptedData += String.fromCharCode(charCode);
  }
  return encryptedData;
};
// Decryption function
const decryptData = (data) => {
  let decryptedData = "";
  for (let i = 0; i < data.length; i++) {
    const charCode =
      data.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
    decryptedData += String.fromCharCode(charCode);
  }
  return decryptedData;
};

// return function with status code
const returnData = (res, status, message, data) => {
  let _data = data
    ? res.status(status).json({ status: status, message: message, data: data })
    : res.status(status).json({ status: status, message: message });
  return _data;
};

const convertToYearFormat = (date) => {
  return moment(new Date(date)).format("YYYY-MM-DD");
};

const serverErrorMsg = (res, msg) => {
  return returnData(res, 500, msg || CONSTANTS.STATUS_MSG.ERROR.SERVER);
};
const _serverErrorMsg = (res, err) => {
  saveLoggers(res, err);
  return returnData(
    res,
    500,
    err?.message || CONSTANTS.STATUS_MSG.ERROR.SERVER
  );
};

// log errors if error occurs
const returnError = (res, err) => {
  saveLoggers(res, err);
  if (err?.errors?.[0]) {
    return returnData(res, 400, err?.errors?.[0]);
  } else {
    return serverErrorMsg(res);
  }
};

// get the string by removing the space and and joining them

const splitMergeString = (title) => {
  return title.trim().toLowerCase().split(" ").join("");
};

const convertDateFormat = (date) => {
  if (date) {
    let _date = new Date(date);
    let year = _date.getFullYear();
    let month = (_date.getMonth() + 1).toString().padStart(2, "0");
    let day = _date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return null;
};

const checkAuthUser = async (tokenVal) => {
  if (tokenVal) {
    let token = tokenVal?.split(" ")[1];

    let data = await jwt.verify(token, ENV_DATA.JWT_SECRET_KEY);
    let isUser = JSON.parse(decryptData(data.encryptedData));
    return isUser;
  }
};


module.exports = {
  presenttimestamp,
  _presenttimestamp,
  encryptData,
  returnData,
  decryptData,
  convertToYearFormat,
  serverErrorMsg,
  returnError,
  _serverErrorMsg,
  splitMergeString,
  convertDateFormat,
  checkAuthUser
};
