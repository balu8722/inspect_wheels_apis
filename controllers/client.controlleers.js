const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const {
    presenttimestamp,
    serverErrorMsg,
    returnData,
    encryptData,
    convertDateFormat,
    splitMergeString,
    _serverErrorMsg,
    decryptData
} = require("../utils/common.js");
const mySQLInstance = require("../database/database_connection.js");
const { CONSTANTS } = require("../utils/constants.js");
const { ENV_DATA } = require("../config/config.js");
const {
    mailService,
    MAIL_HTML_TEMPLATES,
    OtpHandler,
} = require("../middlewares/mailandotp/mail_otp.js");
const { saveLoggers } = require("../middlewares/logger/logger.js");
const { REGEX } = require("../utils/regEx.js");
const fs = require('fs');
const path = require('path');
const { s3, deleteObjectByUrl, compressImage } = require("../middlewares/s3bucket/s3bucket.js");
const momentTz = require("moment-timezone");
const { clientQueries } = require("../database/queries/client_queries.js");

const getExpiryDate = (inputDateString, year) => {
    // return expiryDateIST
    const inputDate = momentTz(inputDateString);

    // Calculate expiry date and time (adding 1 year)
    const expiryDate = inputDate.clone().add(year, 'year');

    // Convert expiry date and time to IST (Indian Standard Time)
    const expiryDateIST = expiryDate
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");
    return expiryDateIST;
};

//users or subadmin signup
module.exports.createVehicleType = async (req, res) => {
    try {
        const { name, description } = req.body;
        const {id:createdBy}=req.user;

        let isDuplicateExists=await mySQLInstance.executeQuery(clientQueries.isExist_admins_ro_client, [username, email, contact_no])
            
        // if (isDuplicateExists.length > 0) {
        //     if (isDuplicateExists[0].email.toLowerCase() === email.toLowerCase()) {
        //         return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS} in ${isDuplicateExists[0].source_table}`)
        //     } else if (isDuplicateExists[0].contact_no === contact_no) {
        //         return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS} in ${isDuplicateExists[0].source_table}`)
        //     }else if (isDuplicateExists[0].username === username) {
        //         return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.USERNAME_EXISTS} in ${isDuplicateExists[0].source_table}`)
        //     }
        // } else {
        //     bcrypt.hash(password, 9, async (err, hash) => {
        //         if (err) {
        //             saveLoggers(req, err || "");
        //             return serverErrorMsg(res, err.message || '');
        //         } else {
        //            const adminValues = [
        //                 name,
        //                 email,
        //                 contact_no,
        //                 username,
        //                 hash,
        //                 roleId,
        //                 gender,
        //                 (address||null),(city||null),(state||null),(country||null),(pincode||null),
        //                 (dob||null),
        //                 createdBy
        //             ];

        //             const values = adminValues;

        //             let addNewUser=await mySQLInstance.executeQuery(authQueries.adminSignUpQuery, [values])
        //             let payload = {
        //                 to: email,
        //                 subject: "Admin Credentials",
        //                 html: MAIL_HTML_TEMPLATES.SIGNUP_TEMPLATE(username, password),
        //             };
        //             await mailService.sendMail(payload);
        //             return returnData(
        //                 res,
        //                 201,
        //                 CONSTANTS.STATUS_MSG.SUCCESS.ADMIN_REGISTERED
        //             );
                   
        //         }
        //     });
        // }
    } catch (err) {
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message);
    }
};


