const fs = require("fs");
const path = require("path");
const mySQLInstance = require("../../database/database_connection");
const { CONSTANTS } = require("../../utils/constants");
const {
  presenttimestamp,
  _serverErrorMsg
} = require("../../utils/common");
var admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");

const deleteOldLogContent = () => {
  const logsDirectory = path.join(__dirname, "../../logs");
  const oneDayInMs = 2880 * 60 * 1000;

  // Get current timestamp
  const currentTime = new Date().getTime();

  // Iterate through log files in the logs directory
  fs.readdirSync(logsDirectory).forEach((file) => {
    const filePath = path.join(logsDirectory, file);

    // Get file stats
    const stats = fs.statSync(filePath);

    // Calculate the age of the log file in days
    const fileAgeInDays = Math.floor(
      (currentTime - stats.mtime.getTime()) / oneDayInMs
    );
    // console.log("🚀 ~ fs.readdirSync ~ fileAgeInDays:", fileAgeInDays)

    // delte the file if it's older than 1 day
    if (fileAgeInDays >= 1) {
      fs.writeFileSync(filePath, "");
      // console.log(`Deleted old log content in file: ${filePath}`);
    }
  });
};

module.exports = {
  deleteOldLogContent
};
