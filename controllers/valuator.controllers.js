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
    checkValueAcrossTables
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
const soQueries = require('../database/queries/valuator_queries.js');
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

module.exports.createvaluator = async (req, res) => {
 
    try {
        const {
            name,
            city,
            email,
            pincode,
            state,
            secondary_contact_no,
            area,
            address,
            contact_no,
            profile_image,
            username,
            password,
            gender,
            dob,
        } = req.body;

        const {id:createdBy}=req.user;

       
        // checking the duplicates for username, email and contact number
        const tables = [CONSTANTS.DATA_TABLES.SO, CONSTANTS.DATA_TABLES.ADMINS, CONSTANTS.DATA_TABLES.VALUATOR];

        if (await checkValueAcrossTables('username', username, tables)) {
            return returnData(res, 409, "Username already exists.");
        }

        if (await checkValueAcrossTables('email', email, tables)) {
            return returnData(res, 409, "Email already exists.");
        }

        if (await checkValueAcrossTables('contact_no', contact_no, tables)) {
            return returnData(res, 409, "Contact number already exists.");
        }

        
        const saltRounds = 9;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const valuatorValues = [name, city,
            email,
            pincode||null,
            state||null,
            secondary_contact_no||null,
            area||null,
            address||null,
            contact_no,
            profile_image||null,
            username,
            hashedPassword,
            gender,
            dob||null,
            createdBy
        ];

        await mySQLInstance.executeQuery(soQueries.insert_valuator, [valuatorValues]);

        let payload = {
            to: email,
            subject: "Valuaror Credentials",
            html: MAIL_HTML_TEMPLATES.SIGNUP_TEMPLATE(username, password),
        };
        await mailService.sendMail(payload);
         return returnData(
            res, 
            201,
             CONSTANTS.STATUS_MSG.SUCCESS.VALUATOR_REGISTERED
            );

    } catch (err) {
        console.error("Error in createso:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }
};

// UPDATE SO 
module.exports.updatevaluator = async (req, res) => {

    const id = req.params.id || req.body.id;

    console.log("tester====>",req.body);
    

    try {
        const {
            name,
            email,
            contact_no,
            city,
            pincode,
            state,
            secondary_contact_no,
            area,
            address,
            profile_image,
            gender,
            dob
        } = req.body;

        const { id: updatedBy } = req.user;


        // Validate required fields
        if (!id) {
            return returnData(res, 400, "Valuator ID is required for update.");
        }


        const checkResult = await mySQLInstance.executeQuery(soQueries.find_valuator_by, [id]);

        if (checkResult.length === 0) {
            return returnData(res, 404, "The specified Valuator could not be found.");
        }
        // 
        // checking the duplicates for username, email and contact number
        const tables = [CONSTANTS.DATA_TABLES.SO, CONSTANTS.DATA_TABLES.ADMINS, CONSTANTS.DATA_TABLES.VALUATOR];


        if (id != checkResult[0].id){
            if (await checkValueAcrossTables('email', email, tables)) {
                return returnData(res, 409, "Email already exists.");
            }

            if (await checkValueAcrossTables('contact_no', contact_no, tables)) {
                return returnData(res, 409, "Contact number already exists.");
            }
        }

     

        // Prepare the update values
        const updateValues = [
            name, 
            city,
            email,
            contact_no,
            pincode || null,
            state || null,
            secondary_contact_no || null,
            area || null,
            address || null,
            profile_image || null,
            gender,
            dob || null,
            updatedBy,
            id
        ];

        // Execute the update query
        await mySQLInstance.executeQuery(soQueries.update_valuator, updateValues);

        return returnData(
            res, 200,
            CONSTANTS.STATUS_MSG.SUCCESS.VALUATOR_UPDATED
            );
    } catch (err) {
        console.error("Error in updateso:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }
};


// UPDATE VALUATOR THEMSELVES
module.exports.updatethemselves = async (req, res) => {
    
    const id = req.params.id || req.body.id;
    try {
        const {
            name,
            city,
            pincode,
            state,
            secondary_contact_no,
            area,
            address,
            profile_image,
            gender,
            dob
        } = req.body;

        const { id: updatedBy } = req.user;

        console.log("Update SO request body:", name);

        // Validate required fields
        if (!id) {
            return returnData(res, 400, "Sub officer ID is required for update.");
        }
        if (!name || name == ' ' || name == null) {
            return returnData(res, 400, "Name is required");
        }


        const checkResult = await mySQLInstance.executeQuery(soQueries.find_valuator_by, [id]);

        if (checkResult.length === 0) {
            return returnData(res, 404, "The specified Sub Officer could not be found.");
        }

        // Prepare the update values
        const updateValues = [
            name,
            city,
            pincode || null,
            state || null,
            secondary_contact_no || null,
            area || null,
            address || null,
            profile_image || null,
            gender,
            dob || null,
            updatedBy,
            id
        ];

        // Execute the update query
        await mySQLInstance.executeQuery(soQueries.update_so_themselves, updateValues);

        return returnData(
            res, 200,
            CONSTANTS.STATUS_MSG.SUCCESS.VALUATOR_UPDATED
            );
    } catch (err) {
        console.error("Error in updateso:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }

}

// GET VALUATOR LIST

module.exports.getValuatorList = async (req, res) => {
    try {
        const valuatorList = await mySQLInstance.executeQuery(soQueries.get_valuator_list);
        // Remove password field from each record
        const filteredResult = valuatorList.map(({ password, ...rest }) => rest);

        return returnData(
            res, 200,
            CONSTANTS.STATUS_MSG.SUCCESS.VALUATOR_LIST,
            filteredResult
            );
    } catch (err) { 
        console.error("Error in getROList:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }
};

// GET VALUATOR BY ID

module.exports.getValuatorById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await mySQLInstance.executeQuery(soQueries.get_valuator_by_id, [id]);

        if (result.length === 0) {
            return returnData(
                res, 404,
                CONSTANTS.STATUS_MSG.ERROR.NO_VALUATOR_FOUND
                );
        }

        // Remove password before sending the data
        const { password, ...soDetails } = result[0];

        return returnData(
            res,
            200,
            CONSTANTS.STATUS_MSG.SUCCESS.VALUATOR_DETAILS,
            soDetails
        );
    } catch (err) {
        console.error("Error in getSOById:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }
};

// DELETE VALUATOR BY ID  
module.exports.deleteValuatorById = async (req, res) => {
    try {
        const { id } = req.params;
        const checkQuery = `SELECT id FROM ${CONSTANTS.DATA_TABLES.VALUATOR} WHERE id = ?`;
        const checkResult = await mySQLInstance.executeQuery(checkQuery, [id]);


        const result = await mySQLInstance.executeQuery(soQueries.delete_valuator_by, [id])
       
        
        // First, check if the SO exists
        if (checkResult.length === 0) {
            return returnData(
                res, 404,
                CONSTANTS.STATUS_MSG.ERROR.NO_VALUATOR_FOUND
            );
        }

        return returnData(
            res,
            200,
            CONSTANTS.STATUS_MSG.ERROR.VALUATOR_DELETED
        );
    } catch (err) {
        console.error("Error in deleteSOById:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }
};

