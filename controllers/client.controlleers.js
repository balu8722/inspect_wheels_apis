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
const { authQueries } = require("../database/queries/auth_queries.js");


// create type
module.exports.createVehicleType = async (req, res) => {
    try {
        const { name,short_code, description } = req.body;
        const {id: createdBy} = req.user;

        let result=await mySQLInstance.executeQuery(clientQueries.isName_Exists(CONSTANTS.DATA_TABLES.VEHICLE_TYPE))

        let _typeName = await result.filter(item => {
            return ((splitMergeString(item.name) === splitMergeString(name))||(item.short_code===short_code))
        })
        
        if((_typeName?.[0]?.short_code===short_code) &&
         (splitMergeString(_typeName?.[0]?.name)!=splitMergeString(name))){
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.SHORT_CODE_EXISTS)
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.SHORT_CODE_EXISTS)
        }else if (_typeName?.[0]?.status === 0) {
            const reactivateValues = [
                name.trim(),
                description||null,
                createdBy,
                presenttimestamp(),
                _typeName[0].id,
            ];
            let reactivateType = await mySQLInstance.executeQuery(
                clientQueries.Reactivate_Type_Category(CONSTANTS.DATA_TABLES.VEHICLE_TYPE),
                reactivateValues
            );
            return returnData(res, 201, CONSTANTS.STATUS_MSG.SUCCESS.DATADDED);
        } else if (_typeName?.[0]?.status === 1) {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS)
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS)
        } else {
            const values = [
                name.trim(),
                short_code,
                description||null,
                createdBy
            ];
            await mySQLInstance.executeQuery(clientQueries.create_type_category(CONSTANTS.DATA_TABLES.VEHICLE_TYPE), [values]);
            return returnData(res, 201, CONSTANTS.STATUS_MSG.SUCCESS.DATADDED);
        }
    } catch (err) {
        saveLoggers(req, err);
        if (err && err.code === "ER_DUP_ENTRY") {
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS);
        }
        return serverErrorMsg(res, err.message);
    }
};

// update type
module.exports.updateType = async (req, res) => {
    try {
        const { typeId } = req.params;
        const { name, description } = req.body;
        const {id:updatedBy}=req.user

        const isTypeExist=await mySQLInstance.executeQuery(clientQueries.is_Type_Category_Exists(CONSTANTS.DATA_TABLES.VEHICLE_TYPE),[typeId])
            if(isTypeExist.length<1){
                saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND)  
                return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND)
            }
        const _nameExists = await mySQLInstance.executeQuery(clientQueries._isUpdateTypeCategoryName_Exists(CONSTANTS.DATA_TABLES.VEHICLE_TYPE), [typeId])
        
        let _typeName = _nameExists.filter(item => {
            return splitMergeString(item.name) === splitMergeString(name)
        })
        
        if (_typeName.length > 0) {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS)
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS)
        }
        const values = [
            name.trim(),
            description||null,
            updatedBy,
            presenttimestamp(),
            typeId,
        ];
        let result = await mySQLInstance.executeQuery(clientQueries.update_type_category(CONSTANTS.DATA_TABLES.VEHICLE_TYPE), values)
        if (result.affectedRows < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
        }
        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.DATA_UPDATED);
    } catch (err) {
        saveLoggers(req, err);
        return serverErrorMsg(res, err.message);
    }
};

// get type list
module.exports.getVehicleTypeList = async (req, res) => {
    try {
        mySQLInstance
            .executeQuery(clientQueries.GET_LIST(CONSTANTS.DATA_TABLES.VEHICLE_TYPE))
            .then((result) => {
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)
                if (result.length < 1) {
                    return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
                }
                return returnData(
                    res,
                    200,
                    CONSTANTS.STATUS_MSG.SUCCESS.DATA_FOUND,
                    result
                );
            })
            .catch((err) => {
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
                saveLoggers(req, err.message || "");
                return serverErrorMsg(res, err?.message);
            });
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

// delete the type
module.exports.deleteVehicleType = async (req, res) => {
    try {
        const { typeId } = req.params;
        const { id: updatedBy } = req.user;

            let values = [updatedBy, presenttimestamp(), typeId];

            let deleteType = await mySQLInstance.executeQuery(clientQueries.DELETE_Type_Category(CONSTANTS.DATA_TABLES.VEHICLE_TYPE), values)

            if (deleteType.affectedRows < 1) {
                saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
                return returnData(
                    res,
                    404,
                    CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND
                );
            }
            
            return returnData(
                res,
                200,
                CONSTANTS.STATUS_MSG.SUCCESS.DATA_DELETED
            );
        
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};


// create category
module.exports.createVehicalCategory = async (req, res) => {
    try {
        const { name,short_code, description } = req.body;
        const {id: createdBy} = req.user;

        let result=await mySQLInstance.executeQuery(clientQueries.isName_Exists(CONSTANTS.DATA_TABLES.VEHICLE_CATEGORY))

        let _categoryName = await result.filter(item => {
            return ((splitMergeString(item.name) === splitMergeString(name))||(item.short_code===short_code))
        })

        if((_categoryName?.[0]?.short_code===short_code) &&
         (splitMergeString(_categoryName?.[0]?.name)!=splitMergeString(name))){
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.SHORT_CODE_EXISTS)
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.SHORT_CODE_EXISTS)
        }else if (_categoryName?.[0]?.status === 0) {
            const reactivateValues = [
                name.trim(),
                description||null,
                createdBy,
                presenttimestamp(),
                _categoryName[0].id,
            ];
            await mySQLInstance.executeQuery(
                clientQueries.Reactivate_Type_Category(CONSTANTS.DATA_TABLES.VEHICLE_CATEGORY),
                reactivateValues
            );
            return returnData(res, 201, CONSTANTS.STATUS_MSG.SUCCESS.DATADDED);
        } else if (_categoryName?.[0]?.status === 1) {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS)
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS)
        } else {
            const values = [
                name.trim(),
                short_code,
                description||null,
                createdBy
            ];
            await mySQLInstance.executeQuery(clientQueries.create_type_category(CONSTANTS.DATA_TABLES.VEHICLE_CATEGORY), [values]);
            return returnData(res, 201, CONSTANTS.STATUS_MSG.SUCCESS.DATADDED);
        }
    } catch (err) {
        saveLoggers(req, err);
        if (err && err.code === "ER_DUP_ENTRY") {
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS);
        }
        return serverErrorMsg(res, err.message);
    }
};

// update cateory
module.exports.updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;
        const {id:updatedBy}=req.user

        const isCategoryExist=await mySQLInstance.executeQuery(clientQueries.is_Type_Category_Exists(CONSTANTS.DATA_TABLES.VEHICLE_CATEGORY),[categoryId])
            if(isCategoryExist.length<1){
                saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND)  
                return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND)
            }
        const _nameExists = await mySQLInstance.executeQuery(clientQueries._isUpdateTypeCategoryName_Exists(CONSTANTS.DATA_TABLES.VEHICLE_CATEGORY), [categoryId])
        
        let _categoryName = _nameExists.filter(item => {
            return splitMergeString(item.name) === splitMergeString(name)
        })
        
        if (_categoryName.length > 0) {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS)
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.NAME_EXISTS)
        }
        const values = [
            name.trim(),
            description||null,
            updatedBy,
            presenttimestamp(),
            categoryId,
        ];
        let result = await mySQLInstance.executeQuery(clientQueries.update_type_category(CONSTANTS.DATA_TABLES.VEHICLE_CATEGORY), values)
        if (result.affectedRows < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
        }
        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.DATA_UPDATED);
    } catch (err) {
        saveLoggers(req, err);
        return serverErrorMsg(res, err.message);
    }
};

// get category list
module.exports.getVehicleCategoryList = async (req, res) => {
    try {
       let result=await mySQLInstance.executeQuery(clientQueries.GET_LIST(CONSTANTS.DATA_TABLES.VEHICLE_CATEGORY))
       if (result.length < 1) {
        return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
        }
        return returnData(
            res,
            200,
            CONSTANTS.STATUS_MSG.SUCCESS.DATA_FOUND,
            result
        );
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

// delete the category
module.exports.deleteVehicleCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { id: updatedBy } = req.user;

            let values = [updatedBy, presenttimestamp(), categoryId];

            let deleteCategory = await mySQLInstance.executeQuery(clientQueries.DELETE_Type_Category(CONSTANTS.DATA_TABLES.VEHICLE_CATEGORY), values)

            if (deleteCategory.affectedRows < 1) {
                saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
                return returnData(
                    res,
                    404,
                    CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND
                );
            }
            
            return returnData(
                res,
                200,
                CONSTANTS.STATUS_MSG.SUCCESS.DATA_DELETED
            );
        
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};


// create client 
module.exports.createClient = async (req, res) => {
    try {
        const { name,  email, contact_no, username, password, address, city,area, state,
            pincode,dob,vehicletypes } = req.body;
        const {id:createdBy}=req.user;

        let isAllTypesExists=await mySQLInstance.executeQuery(clientQueries.isVehicleTypesExist,vehicletypes)
        if(vehicletypes.length!=isAllTypesExists.length){
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.VEHICLE_TYPES_NOT_FOUND)
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.VEHICLE_TYPES_NOT_FOUND)
        }

        let checkValues=[username, email, contact_no,username, email, contact_no, username, email, contact_no,username, email, contact_no];
        let isDuplicateExists=await mySQLInstance.executeQuery(authQueries.isExist_admins_so_client_valuator, checkValues)
            
        if (isDuplicateExists.length > 0) {
            if (isDuplicateExists[0].email.toLowerCase() == email.toLowerCase()) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS} in ${isDuplicateExists[0].source_table}`)
            } else if (isDuplicateExists[0].contact_no == contact_no) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS} in ${isDuplicateExists[0].source_table}`)
            }else if (isDuplicateExists[0].username == username) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.USERNAME_EXISTS} in ${isDuplicateExists[0].source_table}`)
            }
        } else {
            bcrypt.hash(password, 9, async (err, hash) => {
                if (err) {
                    saveLoggers(req, err || "");
                    return serverErrorMsg(res, err.message || '');
                } else {
                   const adminValues = [
                        name,
                        email,
                        contact_no,
                        username,
                        hash,
                        (address||null),(city||null),(area||null),(state||null),(pincode||null),
                        (dob||null),vehicletypes,createdBy
                    ];

                    // create client
                    let addNewClient=await mySQLInstance.executeQuery(clientQueries.createClientQuery, [adminValues])
                    let payload = {
                        to: email,
                        subject: "Client Credentials",
                        html: MAIL_HTML_TEMPLATES.SIGNUP_TEMPLATE(username, password),
                    };
                    await mailService.sendMail(payload);
                    return returnData(
                        res,
                        201,
                        CONSTANTS.STATUS_MSG.SUCCESS.ADMIN_REGISTERED
                    );
                }
            });
        }
    } catch (err) {
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message);
    }
};

module.exports.updateClientDetailsByAdmin = async (req, res) => {
    try {
        const {
            name,  email, contact_no,  address, city,area, state,
            pincode,dob,vehicletypes
        } = req.body;
        const { clientId } = req.params;
        const { id:updatedBy } = req.user;
console.log("clientId",clientId)

        let isUserExists=await mySQLInstance.executeQuery(clientQueries.isClientExistsQuery,[clientId])

        if(isUserExists.length<1){
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.CLIENT_NOT_FOUND)
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.CLIENT_NOT_FOUND)
        }

        let isAllTypesExists=await mySQLInstance.executeQuery(clientQueries.isVehicleTypesExist,[vehicletypes])
        if(vehicletypes.length!=isAllTypesExists.length){
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.VEHICLE_TYPES_NOT_FOUND)
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.VEHICLE_TYPES_NOT_FOUND)
        }

        let checkValues=[email,contact_no,email,contact_no,clientId,email,contact_no,email,contact_no]
        console.log("checkquery",authQueries.isExist_email_contact_no(CONSTANTS.DATA_TABLES.CLIENT))

        let isDuplicateFieldsExist=await mySQLInstance.executeQuery(authQueries.isExist_email_contact_no(CONSTANTS.DATA_TABLES.CLIENT),checkValues)
        if (isDuplicateFieldsExist.length > 0) {
            if (isDuplicateFieldsExist[0].email.toLowerCase() == email.toLowerCase()) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS} in ${isDuplicateFieldsExist[0].source_table}`)
            } else if (isDuplicateFieldsExist[0].contact_no == contact_no) {
                return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS} in ${isDuplicateFieldsExist[0].source_table}`)
            }
        }

        const updateQuery = clientQueries.updateClientQuery
        const updateValues = [
                name,
                email,
                contact_no,
                (address||null),(city||null),(area||null),(state||null),(pincode||null),
                (dob||null),vehicletypes,
                updatedBy,presenttimestamp(),
                clientId
            ]

        const result = await mySQLInstance.executeQuery(updateQuery, updateValues);
        // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)
        if (result.affectedRows < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.CLIENT_NOT_FOUND);
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.CLIENT_NOT_FOUND);
        }
        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.DATA_UPDATED);
    } catch (err) {
        saveLoggers(req, err || "");
        return serverErrorMsg(res, err?.message);
    }
};

module.exports.getClientList = async (req, res) => {
    try {
        const {pageNo=1,rowsPerPage=10 }=req.params;        

        let totalCountQuery=clientQueries.totalCountQuery(CONSTANTS.DATA_TABLES.CLIENT)
        let totalCount =await mySQLInstance.executeQuery(totalCountQuery)
        totalCount=totalCount?.[0].total||0
        const totalPages = Math.ceil(totalCount / Number(rowsPerPage));

        if((totalCount<1)|| (totalPages<pageNo)){
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND)
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND)
        }

        const offset = (pageNo - 1) * Number(rowsPerPage);
        
        const getUsersListQuery = clientQueries.clientListQuery();
        let list =await mySQLInstance.executeQuery(getUsersListQuery,[Number(rowsPerPage),Number(offset)])
        if (list.length < 1) {
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
        }
        let _list= list.map((item) => {
            let user = { ...item };
            delete user.password;
            return user;
        })
        let data={pageNo,rowsPerPage,totalPages,totalCount,list:_list}
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

// delete the client
module.exports.deactivateClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { id:updatedBy } = req.user;
       

        const deleteQuery = authQueries.deleteAdmin_User(CONSTANTS.DATA_TABLES.CLIENT)
        let values = [presenttimestamp(), updatedBy, clientId];

        let deleteUser=await mySQLInstance.executeQuery(deleteQuery, values)
        if (deleteUser.affectedRows < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.CLIENT_NOT_FOUND);
            return returnData(
                res,
                404,
               CONSTANTS.STATUS_MSG.ERROR.CLIENT_NOT_FOUND 
            );
        }
        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.CLIENT_DEACTIVATED);            
    } catch (err) {
        saveLoggers(req, err || "");
        return serverErrorMsg(res, err?.message);
    }
};

// delete the client
module.exports.activateClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { id:updatedBy } = req.user;
       

        const deleteQuery = authQueries.activate_Admin_User(CONSTANTS.DATA_TABLES.CLIENT)
        let values = [presenttimestamp(), updatedBy, clientId];

        let deleteUser=await mySQLInstance.executeQuery(deleteQuery, values)
        if (deleteUser.affectedRows < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.CLIENT_NOT_FOUND);
            return returnData(
                res,
                404,
               CONSTANTS.STATUS_MSG.ERROR.CLIENT_NOT_FOUND 
            );
        }
        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.CLIENT_ACTIVATED);            
    } catch (err) {
        saveLoggers(req, err || "");
        return serverErrorMsg(res, err?.message);
    }
};