const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const {
    presenttimestamp,
    serverErrorMsg,
    returnData,
    encryptData,
    convertDateFormat,
    splitMergeString,
    _serverErrorMsg
} = require("../utils/common.js");
const mySQLInstance = require("../database/database_connection.js");
const {
    authQueries,
    deleteUserPermanentQuery,
} = require("../database/queries/auth_queries.js");
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
const soQueries = require('../database/queries/so_queries.js');
const { log } = require("console");
const { generateCrossTableExistQuery } = require('../database/queries/so_queries.js');

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


module.exports.createso = async (req, res) => {
    try {
        const {
            name,
            // emp_id,
            city,
            email,
            pincode,
            state,
            caller_id,
            area,
            address,
            contact_no,
            profile_image,
            username,
            password,
            confirm_password,
            gender,
            dob,
            createdBy,
            updatedBy,
        } = req.body;

        // Optional: Validate password match
        if (password !== confirm_password) {
            return returnData(res, 400, "Password and Confirm Password do not match.");
        }
       

        const tables = [CONSTANTS.DATA_TABLES.SO, CONSTANTS.DATA_TABLES.ADMINS];
       
        const checkValueAcrossTables = async (column, value, tables) => {
            const query = soQueries.generateCrossTableExistQuery(column, tables.length);
            const params = tables.flatMap(table => [column, table, column, value]);
            const result = await mySQLInstance.executeQuery(query, params);
            return result.length > 0;
        };

        if (await checkValueAcrossTables('username', username, tables)) {
            return returnData(res, 409, "Username already exists.");
        }

        if (await checkValueAcrossTables('email', email, tables)) {
            return returnData(res, 409, "Email already exists.");
        }

        if (await checkValueAcrossTables('contact_no', contact_no, tables)) {
            return returnData(res, 409, "Contact number already exists.");
        }

        // 

        // 3. Generate emp_id
        const lastEmp = await mySQLInstance.executeQuery(
            `SELECT emp_id FROM ${CONSTANTS.DATA_TABLES.SO} ORDER BY id DESC LIMIT 1`
        );
        let newEmpId = 'IWSO0001';
        if (lastEmp.length > 0 && lastEmp[0].emp_id) {
            const lastNum = parseInt(lastEmp[0].emp_id.slice(5)) + 1;
            newEmpId = 'IWSO' + lastNum.toString().padStart(4, '0');
        }
        const saltRounds = 9;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const soValues = [
            name,
            newEmpId,
            city,
            email,
            pincode,
            state,
            caller_id,
            area,
            address,
            contact_no,
            profile_image,
            username,
            hashedPassword,
            // confirm_password,
            presenttimestamp(), // createdAt
            null,               // updatedAt
            1,                  // status (default active)
            presenttimestamp(), // lastPasswordUpdated
            gender,
            dob,
        ];

        await mySQLInstance.executeQuery(soQueries.insert_so, soValues);
        let payload = {
            to: email,
            subject: "SO Credentials",
            html: MAIL_HTML_TEMPLATES.SIGNUP_TEMPLATE(username, password),
        };
        await mailService.sendMail(payload);
         return returnData(
            res, 
            201,
             CONSTANTS.STATUS_MSG.SUCCESS.SO_REGISTERED
            );

    } catch (err) {
        console.error("Error in createso:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }
};


// UPDATE SO LEAD

module.exports.updateso = async (req, res) => {

    const id = req.params.id || req.body.id;

    try {
        const {
            // id, // ID of the SO to update
            name,
            city,
            email,
            pincode,
            state,
            caller_id,
            area,
            address,
            contact_no,
            profile_image,
            username,
            password,
            confirm_password,
            gender,
            dob,
            updatedBy,
        } = req.body;

        
        // Validate required fields
        if (!id) {
            return returnData(res, 400, "SO ID is required for update.");
        }

        // Optional: Validate password match
        if (password && password !== confirm_password) {
            return returnData(res, 400, "Password and Confirm Password do not match.");
        }

        // Check if username, email, or contact_no already exists in other records
        const tables = [CONSTANTS.DATA_TABLES.SO, CONSTANTS.DATA_TABLES.ADMINS];
        const checkValueAcrossTables = async (column, value, tables, excludeId) => {
            const query = soQueries.generateCrossTableExistQuery(column, tables.length);
            const params = tables.flatMap(table => [column, table, column, value]);
            const result = await mySQLInstance.executeQuery(query, params);
            return result.some(row => row.id !== excludeId); // Exclude the current record
        };

        if (await checkValueAcrossTables('username', username, tables, id)) {
            return returnData(res, 409, "Username already exists.");
        }

        if (await checkValueAcrossTables('email', email, tables, id)) {
            return returnData(res, 409, "Email already exists.");
        }

        if (await checkValueAcrossTables('contact_no', contact_no, tables, id)) {
            return returnData(res, 409, "Contact number already exists.");
        }

        // Hash the password if it is being updated
        let hashedPassword = null;
        if (password) {
            const saltRounds = 9;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Prepare the update values
        const updateValues = [
            name,
            city,
            email,
            pincode,
            state,
            caller_id,
            area,
            address,
            contact_no,
            profile_image,
            username,
            hashedPassword, // Only update if password is provided
            presenttimestamp(), // updatedAt
            gender,
            dob,
            updatedBy,
            id, // ID of the SO to update
        ];

        // Execute the update query
        await mySQLInstance.executeQuery(soQueries.update_so, updateValues);

        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.SO_UPDATED);
    } catch (err) {
        console.error("Error in updateso:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }
};
