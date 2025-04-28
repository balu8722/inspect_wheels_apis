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
const soQueries = require('../database/queries/so_queries.js');
const { log } = require("console");
const { generateCrossTableExistQuery } = require('../database/queries/so_queries.js');
const { authQueries } = require("../database/queries/auth_queries.js");

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


// *******************CREATE SUB OFFICER*************************
module.exports.createso = async (req, res) => {
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
        let checkValues = [username, email, contact_no, username, email, contact_no, username, email, contact_no, username, email, contact_no];
        let isDuplicateExists = await mySQLInstance.executeQuery(authQueries.isExist_admins_so_client_valuator, checkValues)

        if (isDuplicateExists.length > 0) {
            if (isDuplicateExists[0].email.toLowerCase() == email.toLowerCase()) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS} in ${isDuplicateExists[0].source_table}`)
            } else if (isDuplicateExists[0].contact_no == contact_no) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS} in ${isDuplicateExists[0].source_table}`)
            } else if (isDuplicateExists[0].username == username) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.USERNAME_EXISTS} in ${isDuplicateExists[0].source_table}`)
            }
        }

       

        
        const saltRounds = 9;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const soValues = [name, city,
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

        await mySQLInstance.executeQuery(soQueries.insert_so, [soValues]);

        let payload = {
            to: email,
            subject: "Sub officer Credentials",
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

// UPDATE SO 
module.exports.updateso = async (req, res) => {

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
        const id = req.params.id || req.body.id;
       
        let isUserExists = await mySQLInstance.executeQuery(soQueries.isSoExistsQuery, [id])
        
        if (isUserExists.length < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_SO_FOUND)
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_SO_FOUND)
        }

        const checkValues = [
            email, contact_no,
            email, contact_no,
            email, contact_no, id,
            email, contact_no, 
        ];
        const query = authQueries.isExist_email_contact_no(CONSTANTS.DATA_TABLES.SO);
        const isDuplicateFieldsExist = await mySQLInstance.executeQuery(query, checkValues);

        if (isDuplicateFieldsExist.length > 0) {
            if (isDuplicateFieldsExist[0].email.toLowerCase() == email.toLowerCase()) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS} in ${isDuplicateFieldsExist[0].source_table}`)
            } else if (isDuplicateFieldsExist[0].contact_no == contact_no) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS} in ${isDuplicateFieldsExist[0].source_table}`)
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
        await mySQLInstance.executeQuery(soQueries.update_so, updateValues);

        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.SO_UPDATED);
    } catch (err) {
        console.error("Error in updateso:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }
};


// UPDATE SO THEMSELVES
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
        let isUserExists = await mySQLInstance.executeQuery(soQueries.isSoExistsQuery, [id])

        if (isUserExists.length < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_SO_FOUND)
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_SO_FOUND)
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

        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.SO_UPDATED);
    } catch (err) {
        console.error("Error in updateso:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }

}

// GET SO LIST

module.exports.getROList = async (req, res) => {
     try {
            const { pageNo = 1, rowsPerPage = 10 } = req.params;
    
            let totalCountQuery = soQueries.totalCountQuery(CONSTANTS.DATA_TABLES.SO)
            let totalCount = await mySQLInstance.executeQuery(totalCountQuery)
            totalCount = totalCount?.[0].total || 0
            const totalPages = Math.ceil(totalCount / Number(rowsPerPage));
    
            if ((totalCount < 1) || (totalPages < pageNo)) {
                saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND)
                return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND)
            }
    
            const offset = (pageNo - 1) * Number(rowsPerPage);
    
           const getUsersListQuery = soQueries.soListQuery();
            let list = await mySQLInstance.executeQuery(getUsersListQuery, [Number(rowsPerPage), Number(offset)])
            if (list.length < 1) {
                return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
            }
            let _list = list.map((item) => {
                let user = { ...item };
                delete user.password;
                return user;
            })
            let data = { pageNo, rowsPerPage, totalPages, totalCount, list: _list }
            return returnData(
                res,
                200,
                CONSTANTS.STATUS_MSG.SUCCESS.DATA_FOUND,
                data
            );
        } catch (err) {
            saveLoggers(req, err.message || "");
            return serverErrorMsg(res, err?.message);
        }
};

// GET SO BY ID

module.exports.getSOById = async (req, res) => {
    try {
        const { id } = req.params;
       const result = await mySQLInstance.executeQuery(soQueries.get_so_by_id, [id]);

        if (result.length === 0) {
            return returnData(
                res, 404,
                CONSTANTS.STATUS_MSG.ERROR.NO_SO_FOUND
                );
        }

        // Remove password before sending the data
        const { password, ...soDetails } = result[0];

        return returnData(
            res,
            200,
            CONSTANTS.STATUS_MSG.SUCCESS.SO_DETAILS,
            soDetails
        );
    } catch (err) {
        console.error("Error in getSOById:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message || "Something went wrong");
    }
};

// DELETE SO BY ID  
module.exports.deleteSOById = async (req, res) => {
   
    try {

        const { id } = req.params;
        const { id: updatedBy } = req.user;
        const deleteQuery = authQueries.deleteAdmin_User(CONSTANTS.DATA_TABLES.SO)
        let values = [presenttimestamp(), updatedBy, id];
        let deleteUser = await mySQLInstance.executeQuery(deleteQuery, values)
        if (deleteUser.affectedRows < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_SO_FOUND);
            return returnData(
                res,
                404,
                CONSTANTS.STATUS_MSG.ERROR.NO_SO_FOUND
            );
        }
        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.SO_DEACTIVATED);
    } catch (err) {
        saveLoggers(req, err || "");
        return serverErrorMsg(res, err?.message);
    }
};

// *************ACTIVATE SO***********************
module.exports.activateso = async (req, res) => {

    try {
        const { id } = req.params;
        const { id: updatedBy } = req.user;


        const deleteQuery = authQueries.activate_Admin_User(CONSTANTS.DATA_TABLES.SO)
        let values = [presenttimestamp(), updatedBy, id];

        let deleteUser = await mySQLInstance.executeQuery(deleteQuery, values)
        if (deleteUser.affectedRows < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_SO_FOUND);
            return returnData(
                res,
                404,
                CONSTANTS.STATUS_MSG.ERROR.NO_SO_FOUND
            );
        }
        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.VALUATOR_ACTIVATED);
    } catch (err) {
        saveLoggers(req, err || "");
        return serverErrorMsg(res, err?.message);
    }
};
