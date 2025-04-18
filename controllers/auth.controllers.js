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
module.exports.signup = (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phoneNumber,
            refferedBy,
            isAdmin,
            role,
            createdBy,
            gender,
        } = req.body;

        if (isAdmin) {
            mySQLInstance.executeQuery(authQueries.isPresent_lab_hospital, [email, phoneNumber, email, phoneNumber]).then((result) => {
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)
                if (result.length > 0) {
                    if (result[0].email.toLowerCase() === email.toLowerCase()) {
                        return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS} in ${result[0].source_table}`)
                    } else if (result[0].phoneNumber === phoneNumber) {
                        return returnData(res, 409, `${CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS} in ${result[0].source_table}`)
                    }
                } else {
                    bcrypt.hash(password, 9, async (err, hash) => {
                        if (err) {
                            saveLoggers(req, err || "");
                            return serverErrorMsg(res, err.message || '');
                        } else {
                            // values to store in user database table
                            // const userValues = [name, email, phoneNumber, hash, `MDLFL_${phoneNumber}`, refferedBy, presenttimestamp, 1];
                            const adminValues = [
                                name,
                                email,
                                phoneNumber,
                                hash,
                                `MDLFL_ADMIN_${phoneNumber}`,
                                role,
                                presenttimestamp(),
                                1,
                                createdBy,
                                gender,
                            ];
                            const values = adminValues;

                            // executing the query
                            mySQLInstance
                                .executeQuery(authQueries.adminSignUpQuery, values)
                                .then(async (result) => {
                                    let payload = {
                                        to: email,
                                        subject: "Admin Credentials",
                                        html: MAIL_HTML_TEMPLATES.SIGNUP_TEMPLATE(email, password),
                                    };
                                    await mailService.sendMail(payload);
                                    return returnData(
                                        res,
                                        201,
                                        CONSTANTS.STATUS_MSG.SUCCESS.ADMIN_REGISTERED
                                    );
                                })
                                .catch((err) => {
                                    // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
                                    saveLoggers(req, err);
                                    if (err && err.code === "ER_DUP_ENTRY") {
                                        const duplicateEntryRegex =
                                            /Duplicate entry '(.*)' for key '(.*)'/;
                                        const matches = err.message.match(duplicateEntryRegex);
                                        if (matches && matches.length >= 3) {
                                            const duplicatedKey = matches[2];
                                            if (
                                                duplicatedKey === "email" ||
                                                duplicatedKey === "email"
                                            ) {
                                                return returnData(
                                                    res,
                                                    409,
                                                    CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS
                                                );
                                            } else if (
                                                duplicatedKey === "phoneNumber" ||
                                                duplicatedKey === "phoneNumber"
                                            ) {
                                                return returnData(
                                                    res,
                                                    409,
                                                    CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
                                                );
                                            }
                                        }
                                    }
                                    // if any other error occurs
                                    return serverErrorMsg(res, err?.message);
                                });
                        }
                    });
                }
            }).catch(err => {
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
                saveLoggers(req, err);
                return serverErrorMsg(res, err?.message);
            })
        } else {
            mySQLInstance
                .executeQuery(authQueries.isCustomerPresent, [email, phoneNumber])
                .then(async (result) => {
                    // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)
                    if (result.length > 0) {
                        if (result[0].email === email) {
                            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS);
                            return returnData(
                                res,
                                409,
                                CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS
                            );
                        } else if (result[0].phoneNumber === phoneNumber) {
                            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS);
                            return returnData(
                                res,
                                409,
                                CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
                            );
                        }
                    }
                    await OtpHandler.storeNumber(email, false, email, false, true);
                    return returnData(
                        res,
                        200,
                        CONSTANTS.STATUS_MSG.SUCCESS.SIGNUP_OTP_EMAIL_SENT
                    );
                })
                .catch((err) => {
                    saveLoggers(req, err);
                    return serverErrorMsg(res, err?.message);
                });
        }
    } catch (err) {
        saveLoggers(req, err);
        return serverErrorMsg(res, err?.message);
    }
};

// admin or user signin
module.exports._signin = async (req, res) => {
    try {
        // request body
        const { email_phoneNumber, password, phoneNumber, isAdmin } = req.body;
        // console.log("🚀 ~ module.exports.signin= ~ isAdmin:", isAdmin)
        if (email_phoneNumber) {
            // console.log("🚀 ~ module.exports.signin= ~ query:", query)
            if (isAdmin) {
                let adminValues = [email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber]
                const adminResult = await mySQLInstance.executeQuery(authQueries.adminPanelSigninQuery, adminValues)
                // console.log("🚀 ~ module.exports._signin= ~ adminResult:", adminResult)
                if (adminResult.length < 1) {
                    saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                    return returnData(
                        res,
                        404,
                        CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND
                    );
                }
                let user = adminResult[0];
                // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ user:", user)

                let _user = { ...user };
                delete _user.password;

                bcrypt.compare(
                    password,
                    user.password,
                    async (bcryptErr, isPasswordValid) => {
                        if (bcryptErr) {
                            saveLoggers(req, bcryptErr);
                            return serverErrorMsg(res, err?.message);
                        }
                        if (!isPasswordValid) {
                            // if password is wrong, throw error
                            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD);
                            return returnData(
                                res,
                                401,
                                CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD
                            );
                        }

                        /**
                         * encrypting the userdetails to generate the token
                         */
                        const userDataString = JSON.stringify({
                            id: user.id,
                            email: user.email,
                            phoneNumber: user.phoneNumber,
                            role: user.sourcetable === "admins" ? user.role : "",
                            accountId: user.accountId,
                            sourcetable: user.sourcetable
                        });
                        const encryptedData = encryptData(userDataString);
                        // token generated
                        var token = jwt.sign({ encryptedData }, ENV_DATA.JWT_SECRET_KEY, {
                            expiresIn: ENV_DATA.ACCESS_TOKEN_EXPIRY_TIME
                        });

                        // refresh token for regenerating the token
                        var refereshtoken = jwt.sign(
                            { encryptedData },
                            ENV_DATA.JWT_SECRET_KEY,
                            { expiresIn: ENV_DATA.REFRESH_TOKEN_EXPIRY_TIME }
                        );

                        let data = {
                            ..._user,
                            token: token,
                            refreshtoken: refereshtoken,
                            role: user.sourcetable === "admins" ? user.role : "",
                        };

                        if (user.sourcetable === "admins") {
                            const roleResult = await mySQLInstance.executeQuery(authQueries.GET_ROLELIST_BY_ID, [user.role])
                            // console.log("🚀 ~ roleResult:", roleResult[0])
                            data = {
                                ...data, featurePermissions: roleResult?.[0]?.featurePermissions || "",
                                roleName: roleResult?.[0]?.roleName || ""
                            }
                        }

                        return returnData(
                            res,
                            200,
                            CONSTANTS.STATUS_MSG.SUCCESS.LOGIN,
                            data
                        );
                    }
                );
            } else {
                const query = authQueries.isUserPresent(isAdmin);
                await mySQLInstance
                    .executeQuery(query, [email_phoneNumber, email_phoneNumber])
                    .then((result) => {
                        // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ result:", result)
                        if (result.length < 1) {
                            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                            return returnData(
                                res,
                                404,
                                CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND
                            );
                        }

                        let user = result[0];
                        // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ user:", user)

                        let _user = { ...user };
                        delete _user.password;
                        // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ user:", user)

                        bcrypt.compare(
                            password,
                            user.password,
                            (bcryptErr, isPasswordValid) => {
                                if (bcryptErr) {
                                    saveLoggers(req, bcryptErr);
                                    return serverErrorMsg(res, err?.message);
                                }
                                if (!isPasswordValid) {
                                    // if password is wrong, throw error
                                    saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD);
                                    return returnData(
                                        res,
                                        401,
                                        CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD
                                    );
                                }

                                /**
                                 * encrypting the userdetails to generate the token
                                 */
                                const userDataString = JSON.stringify({
                                    id: user.id,
                                    email: user.email,
                                    phoneNumber: user.phoneNumber,
                                    role: isAdmin ? user.role : "user",
                                    accountId: user.accountId,
                                });
                                const encryptedData = encryptData(userDataString);
                                // token generated
                                var token = jwt.sign({ encryptedData }, ENV_DATA.JWT_SECRET_KEY, {
                                    expiresIn: ENV_DATA.CUSTOMER_ACCESS_TOKEN_EXPIRY_TIME,
                                });

                                let data = {
                                    ..._user,
                                    dob: convertDateFormat(_user.dob),
                                    token: token,
                                    role: "user",
                                };
                                return returnData(
                                    res,
                                    200,
                                    CONSTANTS.STATUS_MSG.SUCCESS.LOGIN,
                                    data
                                );
                            }
                        );
                    })
                    .catch((err) => {
                        saveLoggers(req, err);
                        return serverErrorMsg(res, err?.message);
                    });
            }

        } else {
            await mySQLInstance
                .executeQuery(authQueries.isUserPresent(false), ["", phoneNumber])
                .then(async (result) => {
                    // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ result:", result)
                    if (result.length < 1) {
                        saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                        return returnData(
                            res,
                            404,
                            CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND
                        );
                    }

                    let user = result[0];
                    // sending otp to mail
                    await OtpHandler.storeNumber(phoneNumber, false, user.email, false);

                    return returnData(
                        res,
                        200,
                        CONSTANTS.STATUS_MSG.SUCCESS.LOGIN_OTP_EMAIL_SENT
                    );
                })
                .catch((err) => {
                    saveLoggers(req, err);
                    return serverErrorMsg(res, err.message);
                });
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports._signin= ~ err:", err)
        saveLoggers(req, err || "");
        return serverErrorMsg(res, err?.message);
    }
};

// verify signUp otp
module.exports.verifySignUpOTP = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phoneNumber,
            refferedBy,
            isAdmin,
            role,
            otp,
        } = req.body;

        const response = await OtpHandler.checkOTP(email, otp);
        // console.log("🚀 ~ module.exports.verifySignUpOTP= ~ response:", response)
        if (response) {
            bcrypt.hash(password, 9, async (err, hash) => {
                if (err) {
                    saveLoggers(req, err || "");
                    return serverErrorMsg(res, err?.message);
                } else {
                    // values to store in user database table
                    const userValues = [
                        name,
                        email,
                        phoneNumber,
                        hash,
                        refferedBy,
                        presenttimestamp(),
                        1,
                    ];

                    // executing the query
                    mySQLInstance
                        .executeQuery(authQueries._signUpQuery, userValues)
                        .then(async (result) => {
                            // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)

                            let user = result[2][0];
                            let _user = { ...user };
                            delete _user.password;
                            /**
                             * encrypting the userdetails to generate the token
                             */
                            const userDataString = JSON.stringify({
                                id: user.id,
                                email: user.email,
                                phoneNumber: user.phoneNumber,
                                role: "user",
                                accountId: user.accountId,
                            });
                            const encryptedData = encryptData(userDataString);
                            // token generated
                            var token = jwt.sign({ encryptedData }, ENV_DATA.JWT_SECRET_KEY, {
                                expiresIn: ENV_DATA.CUSTOMER_ACCESS_TOKEN_EXPIRY_TIME,
                            });

                            // refresh token for regenerating the token
                            // var refereshtoken = jwt.sign(
                            //     { encryptedData }, ENV_DATA.JWT_SECRET_KEY, { expiresIn: ENV_DATA.REFRESH_TOKEN_EXPIRY_TIME });

                            let data = {
                                ..._user,
                                dob: convertDateFormat(_user.dob),
                                token: token,
                                role: "user",
                            };
                            return returnData(
                                res,
                                201,
                                CONSTANTS.STATUS_MSG.SUCCESS.LOGIN,
                                data
                            );
                        })
                        .catch((err) => {
                            // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err);
                            saveLoggers(req, err);
                            if (err && err.code === "ER_DUP_ENTRY") {
                                const duplicateEntryRegex =
                                    /Duplicate entry '(.*)' for key '(.*)'/;
                                const matches = err.message.match(duplicateEntryRegex);
                                if (matches && matches.length >= 3) {
                                    const duplicatedKey = matches[2];
                                    if (
                                        duplicatedKey === "users.email" ||
                                        duplicatedKey === "admins.email"
                                    ) {
                                        return returnData(
                                            res,
                                            409,
                                            CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS
                                        );
                                    } else if (
                                        duplicatedKey === "users.phoneNumber" ||
                                        duplicatedKey === "admins.phoneNumber"
                                    ) {
                                        return returnData(
                                            res,
                                            409,
                                            CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
                                        );
                                    }
                                }
                            }
                            // if any other error occurs
                            return serverErrorMsg(res, err?.message);
                        });
                }
            });
        } else {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.INVALID_OTP);
            return returnData(res, 403, CONSTANTS.STATUS_MSG.ERROR.INVALID_OTP);
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.verifySignUpOTP= ~ err:", err)
        saveLoggers(req, err.message);
        return returnData(res, 403, CONSTANTS.STATUS_MSG.ERROR.OTP_EXPIRED);
    }
};

// verify login otp
module.exports.verifyLoginOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    // console.log("🚀 ~ module.exports.verifyLoginOtp= ~ otp:", otp)
    try {
        const response = await OtpHandler.checkOTP(phoneNumber, otp);
        // console.log("🚀 ~ module.exports.verifyLoginOtp= ~ response:", response)
        if (response) {
            await mySQLInstance
                .executeQuery(authQueries.isUserPresent(false), ["", phoneNumber])
                .then((result) => {
                    // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ result:", result)
                    if (result.length < 1) {
                        saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                        return returnData(
                            res,
                            404,
                            CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND
                        );
                    }

                    let user = result[0];
                    let _user = { ...user };
                    delete _user.password;
                    // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ user:", user)

                    /**
                     * encrypting the userdetails to generate the token
                     */
                    const userDataString = JSON.stringify({
                        id: user.id,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        role: "user",
                        accountId: user.accountId,
                    });
                    const encryptedData = encryptData(userDataString);
                    // token generated
                    var token = jwt.sign({ encryptedData }, ENV_DATA.JWT_SECRET_KEY, {
                        expiresIn: ENV_DATA.CUSTOMER_ACCESS_TOKEN_EXPIRY_TIME,
                    });

                    // refresh token for regenerating the token
                    // var refereshtoken = jwt.sign(
                    //     { encryptedData }, ENV_DATA.JWT_SECRET_KEY, { expiresIn: ENV_DATA.REFRESH_TOKEN_EXPIRY_TIME });

                    let data = {
                        ..._user,
                        dob: convertDateFormat(_user.dob),
                        token: token,
                        role: "user",
                    };
                    return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.LOGIN, data);
                })
                .catch((err) => {
                    // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ err:", err)
                    saveLoggers(req, err);
                    return serverErrorMsg(res, err?.message);
                });
        } else {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.INVALID_OTP);
            return returnData(res, 403, CONSTANTS.STATUS_MSG.ERROR.INVALID_OTP);
        }
    } catch (err) {
        saveLoggers(req, err || "");
        // if (err.message == CONSTANTS.STATUS_MSG.ERROR.OTP_EXPIRED) {
        //     return returnData(res, 403, CONSTANTS.STATUS_MSG.ERROR.OTP_EXPIRED)
        // } else {
        return returnData(res, 403, CONSTANTS.STATUS_MSG.ERROR.OTP_EXPIRED);
        // return serverErrorMsg(res, err?.message)
        // }
    }
};

// forgot password
module.exports.forgotPassword = async (req, res) => {
    const { email_phoneNumber, isAdmin } = req.body;
    // console.log("🚀 ~ module.exports.forgotPassword= ~ email_phoneNumber:", email_phoneNumber)
    try {
        if (isAdmin) {
            let forgotquery = authQueries.adminPanelSigninQuery;
            const values = [email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber]
            await mySQLInstance
                .executeQuery(forgotquery, values)
                .then(async (result) => {
                    // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ result:", result)
                    if (result.length < 1) {
                        saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                        return returnData(
                            res,
                            404,
                            CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND
                        );
                    }

                    let user = result[0];
                    // sending otp to mail
                    await OtpHandler.storeNumber(
                        email_phoneNumber,
                        false,
                        user.email,
                        true
                    );

                    return returnData(
                        res,
                        200,
                        CONSTANTS.STATUS_MSG.SUCCESS.FORGOT_OTP_MAIL
                    );
                })
                .catch((err) => {
                    saveLoggers(req, err.message || "");
                    return serverErrorMsg(res, err?.message);
                });
        } else {
            let forgotquery = authQueries.isUserPresent(isAdmin);
            await mySQLInstance
                .executeQuery(forgotquery, [email_phoneNumber, email_phoneNumber])
                .then(async (result) => {
                    // console.log("🚀 ~ awaitmySQLInstance.executeQuery ~ result:", result)
                    if (result.length < 1) {
                        saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                        return returnData(
                            res,
                            404,
                            CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND
                        );
                    }

                    let user = result[0];
                    // sending otp to mail
                    await OtpHandler.storeNumber(
                        email_phoneNumber,
                        false,
                        user.email,
                        true
                    );

                    return returnData(
                        res,
                        200,
                        CONSTANTS.STATUS_MSG.SUCCESS.FORGOT_OTP_MAIL
                    );
                })
                .catch((err) => {
                    saveLoggers(req, err.message || "");
                    return serverErrorMsg(res, err?.message);
                });
        }
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

// verify forgot otp
module.exports.verifyForgotOtp = async (req, res) => {
    const { email_phoneNumber, otp, isAdmin } = req.body;
    // console.log("🚀 ~ module.exports.verifyLoginOtp= ~ otp:", otp)
    try {
        const response = await OtpHandler.checkOTP(email_phoneNumber, otp);
        // console.log("🚀 ~ module.exports.verifyLoginOtp= ~ response:", response)
        if (response) {
            return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.OTP_VERIFIED);
        } else {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.INVALID_OTP);
            return returnData(res, 403, CONSTANTS.STATUS_MSG.ERROR.INVALID_OTP);
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.verifyLoginOtp= ~ err:", err)
        saveLoggers(req, err.message || "");
        // if (err.message == CONSTANTS.STATUS_MSG.ERROR.OTP_EXPIRED) {
        //     return returnData(res, 403, CONSTANTS.STATUS_MSG.ERROR.OTP_EXPIRED)
        // } else {
        return returnData(res, 403, CONSTANTS.STATUS_MSG.ERROR.OTP_EXPIRED);
        // }
    }
};

// update user or admin details
module.exports.resetPassword = async (req, res) => {
    try {
        const { email_phoneNumber, newPassword, isAdmin } = req.body;

        if (isAdmin) {
            // checking the previous data
            let values = [email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber];

            mySQLInstance.executeQuery(authQueries.adminPanelSigninQuery, values).then((result) => {
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)
                if (result.length < 1) {
                    saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                    return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                }
                let user = result?.[0];

                bcrypt.hash(newPassword, 9, async (err, hash) => {
                    if (err) {
                        saveLoggers(req, err.message || "");
                        return serverErrorMsg(res, err?.message);
                    }
                    const updateQuery = authQueries.updateAdminPasswordQuery(user.sourcetable);
                    const updateValues = [hash, presenttimestamp(), user.email];

                    mySQLInstance
                        .executeQuery(updateQuery, updateValues)
                        .then((result) => {
                            // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)

                            return returnData(
                                res,
                                200,
                                CONSTANTS.STATUS_MSG.SUCCESS.PASSWORD_CHANGED
                            );
                        })
                        .catch((err) => {
                            saveLoggers(req, err.message || "");
                            return serverErrorMsg(res, err?.message);
                        });
                });
            });
        }

        else {
            // checking the previous data
            const isQuery = authQueries.isUserPresent(isAdmin);
            let isQueryValues = [email_phoneNumber, email_phoneNumber];

            mySQLInstance.executeQuery(isQuery, isQueryValues).then((result) => {
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)
                if (result.length < 1) {
                    saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                    return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                }
                let user = result?.[0];

                bcrypt.hash(newPassword, 9, async (err, hash) => {
                    if (err) {
                        saveLoggers(req, err.message || "");
                        return serverErrorMsg(res, err?.message);
                    }
                    const updateQuery = authQueries.updateUserPasswordQuery(isAdmin);
                    const updateValues = [hash, presenttimestamp(), user.email, ""];

                    mySQLInstance
                        .executeQuery(updateQuery, updateValues)
                        .then((result) => {
                            // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)

                            return returnData(
                                res,
                                200,
                                CONSTANTS.STATUS_MSG.SUCCESS.PASSWORD_CHANGED
                            );
                        })
                        .catch((err) => {
                            saveLoggers(req, err.message || "");
                            return serverErrorMsg(res, err?.message);
                        });
                });
            });
        }
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

// change password of admin details
module.exports.changePassword = async (req, res) => {
    try {
        const { email_phoneNumber, currentPassword, newPassword, isAdmin } = req.body;

        // checking the previous data
        const isQuery = authQueries.adminPanelSigninQuery;
        let isQueryValues = [email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber, email_phoneNumber];

        mySQLInstance.executeQuery(isQuery, isQueryValues).then((result) => {
            // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)
            if (result.length < 1) {
                saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
            }
            let user = result?.[0];
            // console.log("🚀 ~ mySQLInstance.executeQuery ~ user:", user)

            bcrypt.compare(currentPassword, user.password, (bcryptErr, isPasswordValid) => {
                // console.log("🚀 ~ bcrypt.compare ~ isPasswordValid:", isPasswordValid)
                if (bcryptErr) {
                    saveLoggers(req, bcryptErr)
                    return serverErrorMsg(res, err?.message)
                }
                if (!isPasswordValid) {
                    // if password is same as old password, throw error
                    saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.INVALID_CURRENT_PASSWORD)
                    return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.INVALID_CURRENT_PASSWORD)
                }

                bcrypt.hash(newPassword, 9, async (err, hash) => {
                    if (err) {
                        saveLoggers(req, err.message || "");
                        return serverErrorMsg(res, err?.message);
                    }
                    const updateQuery = authQueries.updateAdminPasswordQuery(user.sourcetable);
                    const updateValues = [hash, presenttimestamp(), user.email];

                    mySQLInstance
                        .executeQuery(updateQuery, updateValues)
                        .then((result) => {
                            // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)

                            return returnData(
                                res,
                                200,
                                CONSTANTS.STATUS_MSG.SUCCESS.PASSWORD_CHANGED
                            );
                        })
                        .catch((err) => {
                            saveLoggers(req, err.message || "");
                            return serverErrorMsg(res, err?.message);
                        });
                });
            });

        }).catch((err) => {
            saveLoggers(req, err.message || '')
            return serverErrorMsg(res, err?.message)
        })
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};


// update the user or admin Details
module.exports.updateUsersDetails = async (req, res) => {
    try {
        const {
            name,
            role,
            isAdmin,
            houseno,
            buildingno,
            pincode,
            state,
            district,
            city,
            location,
            locationlatlng,
            gender,
            dob,
            email,
            phoneNumber,
        } = req.body;
        const { userId } = req.params;
        const { tokenresult } = req.decodedToken;
        // console.log("🚀 ~ module.exports.updateUsersDetails= ~ tokenresult:", tokenresult)

        const updateQuery = isAdmin
            ? authQueries.updateAdminDetailQuery
            : authQueries.updateUserDetailQuery;
        const updateValues = isAdmin
            ? [
                name,
                role,
                houseno,
                buildingno,
                pincode,
                state,
                district,
                city,
                location,
                locationlatlng,
                presenttimestamp(),
                gender || "",
                dob || null,
                tokenresult[0].accountId,
                email,
                phoneNumber,
                parseInt(userId),
            ]
            : [
                name,
                houseno,
                buildingno,
                pincode || null,
                state,
                district,
                city,
                location,
                locationlatlng,
                presenttimestamp(),
                gender || null,
                dob || null,
                tokenresult[0].accountId,
                parseInt(userId),
            ];

        mySQLInstance
            .executeQuery(updateQuery, updateValues)
            .then((result) => {
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)
                if (result.affectedRows < 1) {
                    saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                    return returnData(
                        res,
                        404,
                        CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND
                    );
                }
                return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.DATA_UPDATED);
            })
            .catch((err) => {
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
                saveLoggers(req, err || "");
                if (err && err.code === "ER_DUP_ENTRY") {
                    const duplicateEntryRegex = /Duplicate entry '(.*)' for key '(.*)'/;
                    const matches = err.message.match(duplicateEntryRegex);
                    if (matches && matches.length >= 3) {
                        const duplicatedKey = matches[2];
                        if (
                            duplicatedKey === "email"
                        ) {
                            return returnData(
                                res,
                                409,
                                CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS
                            );
                        } else if (
                            duplicatedKey === "phoneNumber"
                        ) {
                            return returnData(
                                res,
                                409,
                                CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
                            );
                        }
                    }
                }
                return serverErrorMsg(res, err?.message);
            });
    } catch (err) {
        saveLoggers(req, err || "");
        return serverErrorMsg(res, err?.message);
    }
};

// get admin or users list
module.exports.getUsersList = async (req, res) => {
    try {
        const { isAdmin } = req.body;
        const getUsersListQuery = isAdmin
            ? authQueries.adminList
            : authQueries.userList;
        mySQLInstance
            .executeQuery(getUsersListQuery)
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
                saveLoggers(req, err.message || "");
                return serverErrorMsg(res, err?.message);
            });
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

// get admin or users list
module.exports.getUsersListById = async (req, res) => {
    try {
        const { isAdmin } = req.body;
        const { id } = req.params;

        const getUsersListQuery = isAdmin
            ? authQueries.adminListById
            : authQueries.userListById;
        mySQLInstance
            .executeQuery(getUsersListQuery, [id])
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
                saveLoggers(req, err);
                return serverErrorMsg(res, err.message);
            });
    } catch (err) {
        saveLoggers(req, err);
        return serverErrorMsg(res, err.message);
    }
};

// delete the users
module.exports.deleteUsersOrAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isAdmin } = req.body;
        const { tokenresult } = req.decodedToken;
        // console.log("🚀 ~ module.exports.deleteUsersOrAdmin ~ tokenresult:", tokenresult)

        const deleteQuery = isAdmin
            ? authQueries.deleteAdmin_User(CONSTANTS.DATA_TABLES.ADMINS)
            : authQueries.deleteAdmin_User(CONSTANTS.DATA_TABLES.USERS);
        let values = [0, presenttimestamp(), tokenresult[0].accountId, userId];

        mySQLInstance
            .executeQuery(deleteQuery, values)
            .then((result) => {
                if (result.affectedRows < 1) {
                    saveLoggers(req, isAdmin ? CONSTANTS.STATUS_MSG.ERROR.ADMIN_NOT_FOUND : CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                    return returnData(
                        res,
                        404,
                        isAdmin ? CONSTANTS.STATUS_MSG.ERROR.ADMIN_NOT_FOUND : CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND
                    );
                }
                return returnData(res, 200, isAdmin ? CONSTANTS.STATUS_MSG.SUCCESS.ADMIN_DELETED : CONSTANTS.STATUS_MSG.SUCCESS.USER_DELETED);
            })
            .catch((err) => {
                saveLoggers(req, err);
                return serverErrorMsg(res, err?.message);
            });
    } catch (err) {
        saveLoggers(req, err || "");
        return serverErrorMsg(res, err?.message);
    }
};

// refreshtoken
module.exports.refreshtoken = async (req, res) => {
    const { refreshtoken } = req.params;
    try {
        // verify the refershtoken
        let data = await jwt.verify(refreshtoken, ENV_DATA.JWT_SECRET_KEY);
        // console.log("🚀 ~ module.exports.refreshtoken= ~ data:", data)

        const encryptedData = data.encryptedData;
        // console.log("🚀 ~ module.exports.refreshtoken= ~ encryptedData:", encryptedData)

        // generate the new access token
        var token = jwt.sign({ encryptedData }, ENV_DATA.JWT_SECRET_KEY, {
            expiresIn: ENV_DATA.ACCESS_TOKEN_EXPIRY_TIME,
        });

        return returnData(res, 201, CONSTANTS.STATUS_MSG.SUCCESS.TOKEN_GENERATED, {
            token: token,
        });
    } catch (err) {
        saveLoggers(res, err);
        return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.TOKEN_EXPIRED);
    }
};

// create roles
module.exports.createRole = async (req, res) => {
    try {
        const { roleName, featurePermissions, createdBy } = req.body;

        mySQLInstance.executeQuery(authQueries._isRoleName_Exists).then(async (result) => {
            let _roleName = await result.filter(item => {
                return splitMergeString(item.roleName) === splitMergeString(roleName)
            })
            // console.log("🚀 ~ mySQLInstance.executeQuery ~ _roleName:", _roleName)
            if (_roleName?.[0]?.status === 0) {
                const reactivateValues = [
                    roleName.trim(),
                    featurePermissions,
                    createdBy,
                    presenttimestamp(),
                    _roleName[0].roleId,
                ];
                let reactivateRole = await mySQLInstance.executeQuery(
                    authQueries.reactivate_Rolename,
                    reactivateValues
                );
                return returnData(res, 201, CONSTANTS.STATUS_MSG.SUCCESS.ROLE_CREATED);
            } else if (_roleName?.[0]?.status === 1) {
                saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.ROLENAME_EXISTS)
                return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.ROLENAME_EXISTS)
            } else {
                const values = [
                    roleName.trim(),
                    featurePermissions,
                    createdBy,
                    presenttimestamp(),
                    1,
                ];
                await mySQLInstance.executeQuery(authQueries.create_Role, values);
                return returnData(res, 201, CONSTANTS.STATUS_MSG.SUCCESS.ROLE_CREATED);
            }
        }).catch(err => {
            // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
            return _serverErrorMsg(res, err?.message)
        })
    } catch (err) {
        saveLoggers(req, err);
        if (err && err.code === "ER_DUP_ENTRY") {
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.ROLENAME_EXISTS);
        }
        return serverErrorMsg(res, err.message);
    }
};

// update roles
module.exports.updateRole = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { roleName, featurePermissions, updatedBy } = req.body;
        // let _roleName = roleName.trim().toLowerCase();

        const _nameExists = await mySQLInstance.executeQuery(authQueries._isUpdateRoleName_Exists, [roleId])
        // console.log("🚀 ~ module.exports.updateRole= ~ _nameExists:", _nameExists)

        let _roleName = _nameExists.filter(item => {
            return splitMergeString(item.roleName) === splitMergeString(roleName)
        })
        // console.log("🚀 ~ module.exports.updateRole= ~ _roleName:", _roleName)
        if (_roleName.length > 0) {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.ROLENAME_EXISTS)
            return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.ROLENAME_EXISTS)
        }
        const values = [
            roleName.trim(),
            featurePermissions,
            updatedBy,
            presenttimestamp(),
            roleId,
        ];
        mySQLInstance
            .executeQuery(authQueries.update_Role, values)
            .then((result) => {
                if (result.affectedRows < 1) {
                    saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.ROLE_NOT_FUND);
                    return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.ROLE_NOT_FUND);
                }
                return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.ROLE_UPDATED);
            })
            .catch((err) => {
                saveLoggers(req, err);
                if (err && err.code === "ER_DUP_ENTRY") {
                    return returnData(
                        res,
                        409,
                        CONSTANTS.STATUS_MSG.ERROR.ROLENAME_EXISTS
                    );
                }
                return serverErrorMsg(res, err.message);
            });
    } catch (err) {
        // console.log("🚀 ~ module.exports.createRole= ~ err:", err)
        saveLoggers(req, err);
        return serverErrorMsg(res, err.message);
    }
};

// get roles list
module.exports.getRoleList = async (req, res) => {
    try {
        mySQLInstance
            .executeQuery(authQueries.GET_ROLELIST)
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
        // console.log("🚀 ~ module.exports.getRoleList= ~ err:", err)
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

// delete the roles
module.exports.deleterole = async (req, res) => {
    try {
        const { roleId, updatedBy } = req.params;
        // console.log("🚀 ~ module.exports.deleterole ~ roleId:", roleId)

        if (roleId === "1") {
            saveLoggers(req, err);
            return returnData(res, 401, CONSTANTS.STATUS_MSG.ERROR.NOT_AUTHORIZED);
        } else {
            let values = [updatedBy, presenttimestamp(), roleId];

            mySQLInstance
                .executeQuery(authQueries.DELETE_ROLE, values)
                .then(async (result) => {
                    if (result.affectedRows < 1) {
                        saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NO_DATA_FOUND);
                        return returnData(
                            res,
                            404,
                            CONSTANTS.STATUS_MSG.ERROR.ROLE_NOT_FUND
                        );
                    }
                    const result2 = await mySQLInstance.executeQuery(authQueries.REMOVE_ROLE_ID, [roleId])
                    return returnData(
                        res,
                        200,
                        CONSTANTS.STATUS_MSG.SUCCESS.ROLE_DELETED
                    );
                })
                .catch((err) => {
                    // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
                    saveLoggers(req, err);
                    return serverErrorMsg(res, err?.message);
                });
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.deleterole ~ err:", err)
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

// create user from admin only
module.exports.userSignup = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, organizationId } = req.body;
        // console.log("🚀 ~ module.exports.userSignup= ~ organizationId:", organizationId)
        const { tokenresult } = req.decodedToken;

        bcrypt.hash(password, 9, async (err, hash) => {
            if (err) {
                saveLoggers(req, err || "");
                return serverErrorMsg(res, err?.message);
            } else {
                // values to store in user database table
                const userValues = [
                    name,
                    email,
                    phoneNumber,
                    hash,
                    tokenresult[0].accountId,
                    presenttimestamp(),
                    1,
                    organizationId || null
                ];

                // executing the query
                mySQLInstance
                    .executeQuery(authQueries.usersignUpQuery, [userValues])
                    .then(async (result) => {
                        let payload = {
                            to: email,
                            subject: "User Credentials",
                            html: MAIL_HTML_TEMPLATES.SIGNUP_TEMPLATE(email, password, true),
                        };
                        await mailService.sendMail(payload);
                        return returnData(
                            res,
                            201,
                            CONSTANTS.STATUS_MSG.SUCCESS.ADMIN_REGISTERED
                        );
                    })
                    .catch((err) => {
                        // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
                        saveLoggers(req, err);
                        if (err && err.code === "ER_DUP_ENTRY") {
                            const duplicateEntryRegex =
                                /Duplicate entry '(.*)' for key '(.*)'/;
                            const matches = err.message.match(duplicateEntryRegex);
                            if (matches && matches.length >= 3) {
                                const duplicatedKey = matches[2];
                                if (
                                    duplicatedKey === "email" ||
                                    duplicatedKey === "email"
                                ) {
                                    return returnData(
                                        res,
                                        409,
                                        CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS
                                    );
                                } else if (
                                    duplicatedKey === "phoneNumber" ||
                                    duplicatedKey === "phoneNumber"
                                ) {
                                    return returnData(
                                        res,
                                        409,
                                        CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
                                    );
                                }
                            }
                        } else if (err && err.message === "Unable to send mail") {
                            return serverErrorMsg(res, CONSTANTS.STATUS_MSG.ERROR.UNABLE_SEND_MAIL);
                        } else {
                            // if any other error occurs
                            return serverErrorMsg(res, err?.message);
                        }
                    });
            }
        });
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

// get  users list for admins only
module.exports.getUsersListForAdmins = async (req, res) => {
    try {
        const result = await mySQLInstance.executeQuery(authQueries.userList);
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
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

// update the user Details by admin only
module.exports.updateUsersDetailsByAdmin = async (req, res) => {
    try {
        const {
            name,
            role,
            isAdmin,
            houseno,
            buildingno,
            pincode,
            state,
            district,
            city,
            location,
            locationlatlng,
            gender,
            dob,
            email,
            phoneNumber,
            organizationId
        } = req.body;
        const { userId } = req.params;
        const { tokenresult } = req.decodedToken;

        const updateValues = [
            name,
            houseno,
            buildingno,
            pincode || null,
            state,
            district,
            city,
            location,
            locationlatlng,
            presenttimestamp(),
            gender || null,
            dob || null,
            tokenresult[0].accountId,
            email,
            phoneNumber,
            organizationId || null,
            parseInt(userId),
        ];

        const result = await mySQLInstance.executeQuery(
            authQueries.updateUserDetailByAdminQuery,
            updateValues
        );
        // console.log("🚀 ~ mySQLInstance.executeQuery ~ result:", result)
        if (result.affectedRows < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
        }
        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.DATA_UPDATED);
    } catch (err) {
        saveLoggers(req, err || "");
        if (err && err.code === "ER_DUP_ENTRY") {
            // console.log("🚀 ~ module.exports.updateUsersDetails= ~ r:", err)
            const duplicateEntryRegex = /Duplicate entry '(.*)' for key '(.*)'/;
            const matches = err.message.match(duplicateEntryRegex);
            if (matches && matches.length >= 3) {
                const duplicatedKey = matches[2];
                if (
                    duplicatedKey === "email"
                ) {
                    return returnData(res, 409, CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS);
                } else if (
                    duplicatedKey === "phoneNumber"
                ) {
                    return returnData(
                        res,
                        409,
                        CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
                    );
                }
            }
        } else {
            return serverErrorMsg(res, err?.message);
        }
    }
};

// delete the users by admin only
module.exports.deleteUsersByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { tokenresult } = req.decodedToken;
        if (REGEX.NUMBERS_ONLY.test(userId)) {
            // console.log("🚀 ~ module.exports.deleteUsersOrAdmin ~ tokenresult:", tokenresult)

            const deleteQuery = authQueries.deleteAdmin_User(
                CONSTANTS.DATA_TABLES.USERS
            );
            let values = [0, presenttimestamp(), tokenresult[0].accountId, userId];

            const result = await mySQLInstance.executeQuery(deleteQuery, values);
            if (result.affectedRows < 1) {
                saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
                return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
            }
            return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.USER_DELETED);
        } else {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.NUMBERS_ONLY);
            return returnData(res, 400, CONSTANTS.STATUS_MSG.ERROR.NUMBERS_ONLY);
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.deleteUsersByAdmin ~ err:", err)
        saveLoggers(req, err || "");
        return serverErrorMsg(res, err?.message);
    }
};

// permanently delete the user
module.exports.deletePermanentlyUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await mySQLInstance.executeQuery(deleteUserPermanentQuery, [
            id,
        ]);
        return returnData(res, 200, "deleted user permanently");
    } catch (err) {
        // console.log("🚀 ~ module.exports.deletePermanentlyUsers ~ err:", err)
        serverErrorMsg(res, err?.message);
    }
};

// check duplicates
const check_EMAIL_PHONE_Duplicates = (users) => {

    const emailSet = new Set();
    const phoneNumberSet = new Set();

    const duplicates = {
        emails: [],
        phoneNumbers: []
    };

    users.forEach(user => {
        if (emailSet.has(splitMergeString(user.email))) {
            duplicates.emails.push(user.email);
        } else {
            emailSet.add(splitMergeString(user.email));
        }

        if (phoneNumberSet.has(user.phoneNumber.trim())) {
            duplicates.phoneNumbers.push(user.phoneNumber);
        } else {
            phoneNumberSet.add(user.phoneNumber.trim());
        }
    });

    return duplicates;
}

//user bulk upload
module.exports.importuser = async (req, res, next) => {
    try {
        const { organization, users } = req.body;

        const nameMap = {}; // Map to keep track of processed phonenumbers and emails
        let hasDublicate = false; // Initialize response variable as false


        const duplicates = await check_EMAIL_PHONE_Duplicates(users);

        if (duplicates.emails.length > 0) {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_USER_EMAIL);
            return returnData(res, 400, [
                `${duplicates.emails[0]} - ${CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_USER_EMAIL}`,
            ]);
        } else if (duplicates.phoneNumbers.length > 0) {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_PHONENUMBER_EXISTS);
            return returnData(res, 400,
                `${duplicates.phoneNumbers[0]} - ${CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_PHONENUMBER_EXISTS}`);
        } else {
            for (const detail of users) {
                const userExists = await mySQLInstance.executeQuery(
                    authQueries.isUser_exists,
                    [detail.email, detail.phoneNumber]
                );
                // console.log("🚀 ~ module.exports.importuser= ~ userExists:", userExists)

                if (userExists[0].count > 0) {
                    hasDublicate = false;
                    let message = (detail.email == userExists[0].email) ? `${detail.email} - ${CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_USER_EMAIL_DB}`
                        : `${detail.phoneNumber} - ${CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS}`
                    saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_USER_EMAIL_DB);
                    return returnData(res, 400, message);
                } else {
                    hasDublicate = true;
                    // Mark processed names and emails in the map
                    nameMap[detail.phoneNumber] = true;
                    nameMap[splitMergeString(detail.email)] = true;
                    continue;
                }

            }
        }

        // Insert user into the database if not already existing
        if (hasDublicate) {
            for (const detail of users) {
                // Generate a random password for each user
                let passwordVal = generateRandomString();

                const hashedPassword = await new Promise((resolve, reject) => {
                    bcrypt.hash(passwordVal, 9, (err, hash) => {
                        if (err) reject(err);
                        else resolve(hash);
                    });
                });

                // Set the hashed password in the user object
                detail.password = hashedPassword;
                detail.createdBy = req.decodedToken.tokenresult[0].accountId;
                detail.status = 1
                detail.createdAt = presenttimestamp();
                if (organization && organization != "") {
                    detail.organizationId = organization;
                }

                const createUserResult = await mySQLInstance.executeQuery(
                    authQueries.import_user,
                    [detail]
                );
                let payload = {
                    to: detail.email,
                    subject: "User Credentials",
                    html: MAIL_HTML_TEMPLATES.SIGNUP_TEMPLATE(detail.email, passwordVal, true),
                };
                await mailService.sendMail(payload);

            }
            // console.log(hasDublicate, "-", users);
            return returnData(res, 201, CONSTANTS.STATUS_MSG.SUCCESS.USER_CREATED);
        }
        // Send success response after processing all users
    } catch (err) {
        saveLoggers(res, err)
        return serverErrorMsg(res, err?.message);
    }
};

function generateRandomString() {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const numbers = "0123456789";

    let randomString = "";

    randomString += uppercaseChars.charAt(
        Math.floor(Math.random() * uppercaseChars.length)
    );
    randomString += lowercaseChars.charAt(
        Math.floor(Math.random() * lowercaseChars.length)
    );
    randomString += specialChars.charAt(
        Math.floor(Math.random() * specialChars.length)
    );
    randomString += numbers.charAt(Math.floor(Math.random() * numbers.length));

    const remainingLength = 4;
    const allowedChars = uppercaseChars + lowercaseChars + specialChars + numbers;

    for (let i = 0; i < remainingLength; i++) {
        randomString += allowedChars.charAt(
            Math.floor(Math.random() * allowedChars.length)
        );
    }

    // Shuffle the string to ensure randomness
    randomString = randomString
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");

    return randomString;
}

//create organization
// module.exports.createOrg = async (req, res) => {
//     try {
//         const org = req.body;
//         const org_name = org.oraganizationName;
//         let _orgName = org_name.trim().toLowerCase();

//         org.createdAt = presenttimestamp();
//         org.createdBy = req.decodedToken.tokenresult[0].accountId;

//         const result = await mySQLInstance.executeQuery(authQueries.isOrgName_Exists, [_orgName])
//         if (result[0].count == 0) {
//             await mySQLInstance.executeQuery(authQueries.create_org, org)
//             return returnData(
//                 res,
//                 201,
//                 CONSTANTS.STATUS_MSG.SUCCESS.ORG_CREATED
//             );
//         } else {
//             return returnData(
//                 res,
//                 409,
//                 CONSTANTS.STATUS_MSG.ERROR.ORGANIZATION_EXISTS
//             );
//         }
//     } catch (err) {
//         // console.log("🚀 ~ module.exports.createRole= ~ err:", err);
//         saveLoggers(req, err);
//         if (err && err.code === "ER_DUP_ENTRY") {
//             const duplicateEntryRegex =
//                 /Duplicate entry '(.*)' for key '(.*)'/;
//             const matches = err.message.match(duplicateEntryRegex);
//             if (matches && matches.length >= 3) {
//                 const duplicatedKey = matches[2];
//                 if (
//                     duplicatedKey === "contactPersonEmail" ||
//                     duplicatedKey === "email"
//                 ) {
//                     return returnData(
//                         res,
//                         409,
//                         CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS
//                     );
//                 } else if (
//                     duplicatedKey === "contactPersonPhone" ||
//                     duplicatedKey === "phoneNumber"
//                 ) {
//                     return returnData(
//                         res,
//                         409,
//                         CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
//                     );
//                 }
//             }
//         }
//         return serverErrorMsg(res, err.message);
//     }
// };
module.exports.createOrg = async (req, res) => {
    try {
        const { tokenresult } = req.decodedToken
        const org = { ...req.body };
        const org_name = org.oraganizationName;
        let _orgName = org_name.trim().toLowerCase();

        org.createdAt = presenttimestamp();
        org.createdBy = req.decodedToken.tokenresult[0].accountId;
        let _org = { ...org }
        // if (req.body.paymentstatus === "pending") {
        delete _org.paymentamount
        delete _org.transactionid
        // }
        const result = await mySQLInstance.executeQuery(authQueries.isOrgName_Exists, [_orgName])
        if (result[0].count == 0) {
            const createOrg = await mySQLInstance.executeQuery(authQueries.create_org, _org)
            console.log("🚀 ~ module.exports.createOrg= ~ createOrg:", createOrg)
            let orgName = createOrg[2][0]
            if (req.body.paymentstatus === "success") {
                const transValues = [
                    orgName.organizationID,
                    org.paymentamount,
                    presenttimestamp(),
                    org.transactionid,
                    presenttimestamp(),
                    getExpiryDate(presenttimestamp(), 1),
                    "active",
                    org.paymentstatus,
                    tokenresult[0].accountId,
                    0,
                ];

                const createpaymentDetails = await mySQLInstance.executeQuery(
                    `${authQueries.insert_orgcard_transaction}`,
                    [transValues]
                );
            }
            return returnData(
                res,
                201,
                CONSTANTS.STATUS_MSG.SUCCESS.ORG_CREATED
            );
        } else {
            return returnData(
                res,
                409,
                CONSTANTS.STATUS_MSG.ERROR.ORGANIZATION_EXISTS
            );
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.createRole= ~ err:", err);
        saveLoggers(req, err);
        if (err && err.code === "ER_DUP_ENTRY") {
            const duplicateEntryRegex =
                /Duplicate entry '(.*)' for key '(.*)'/;
            const matches = err.message.match(duplicateEntryRegex);
            if (matches && matches.length >= 3) {
                const duplicatedKey = matches[2];
                if (
                    duplicatedKey === "contactPersonEmail" ||
                    duplicatedKey === "email"
                ) {
                    return returnData(
                        res,
                        409,
                        CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS
                    );
                } else if (
                    duplicatedKey === "contactPersonPhone" ||
                    duplicatedKey === "phoneNumber"
                ) {
                    return returnData(
                        res,
                        409,
                        CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
                    );
                }
            }
        }
        return serverErrorMsg(res, err.message);
    }
};

module.exports.updateOrg = async (req, res) => {
    try {
        const { tokenresult } = req.decodedToken
        const org = req.body;
        const id = req.params.id;
        const org_name = org.oraganizationName;
        let _orgName = org_name.trim().toLowerCase();

        org.updatedAt = presenttimestamp();
        org.updatedBy = req.decodedToken.tokenresult[0].accountId;
        const result = await mySQLInstance
            .executeQuery(authQueries.isOrg_Exists, [id])
        // console.log("🚀 ~ module.exports.updateOrg= ~ result:", result)

        if (result[0].count > 0) {
            const result2 = await mySQLInstance
                .executeQuery(authQueries.isOrgName_Exists_table, [_orgName, id])
            if (result2[0].count == 0) {
                let _org = { ...org }
                delete _org.paymentamount
                delete _org.transactionid
                await mySQLInstance.executeQuery(authQueries.update_org, [_org, id])
                if (result[0].paymentstatus !== "success" && req.body.paymentstatus === "success") {
                    const transValues = [
                        result[0].organizationID,
                        org.paymentamount || null,
                        presenttimestamp(),
                        org.transactionid,
                        presenttimestamp(),
                        getExpiryDate(presenttimestamp(), 1),
                        "active",
                        org.paymentstatus,
                        tokenresult[0].accountId,
                        0,
                    ];

                    const createpaymentDetails = await mySQLInstance.executeQuery(
                        `${authQueries.insert_orgcard_transaction}`,
                        [transValues]
                    );
                }
                return returnData(
                    res,
                    200,
                    CONSTANTS.STATUS_MSG.SUCCESS.ORG_UPDATED
                );
            } else {
                return returnData(
                    res,
                    409,
                    CONSTANTS.STATUS_MSG.ERROR.ORGANIZATION_EXISTS
                );
            }
        } else {
            return returnData(
                res,
                409,
                CONSTANTS.STATUS_MSG.ERROR.INVALID_ORG_ID
            );
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.createRole= ~ err:", err);
        saveLoggers(req, err);
        if (err && err.code === "ER_DUP_ENTRY") {
            const duplicateEntryRegex =
                /Duplicate entry '(.*)' for key '(.*)'/;
            const matches = err.message.match(duplicateEntryRegex);
            if (matches && matches.length >= 3) {
                const duplicatedKey = matches[2];
                if (
                    duplicatedKey === "contactPersonEmail" ||
                    duplicatedKey === "email"
                ) {
                    return returnData(
                        res,
                        409,
                        CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS
                    );
                } else if (
                    duplicatedKey === "contactPersonPhone" ||
                    duplicatedKey === "phoneNumber"
                ) {
                    return returnData(
                        res,
                        409,
                        CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
                    );
                }
            }
        }
        return serverErrorMsg(res, err.message);
    }
};

module.exports.readOrg = async (req, res) => {
    try {
        const result = await mySQLInstance
            .executeQuery(authQueries.get_orglist)
        // .then((result) => {
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
        // })
        // .catch((err) => {
        //     // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err);
        //     saveLoggers(req, err.message || "");
        //     return serverErrorMsg(res, err?.message);
        // });
    } catch (err) {
        // console.log("🚀 ~ module.exports.getRoleList= ~ err:", err)
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

module.exports.getPaidOrg = async (req, res) => {
    try {
        let query = authQueries.get_paid_orglist
        const result = await mySQLInstance
            .executeQuery(query)
        // .then((result) => {
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
        // })
        // .catch((err) => {
        //     // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err);
        //     saveLoggers(req, err.message || "");
        //     return serverErrorMsg(res, err?.message);
        // });
    } catch (err) {
        // console.log("🚀 ~ module.exports.getRoleList= ~ err:", err)
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

module.exports.readOrgbyid = async (req, res) => {
    try {
        const id = req.params.id;
        mySQLInstance
            .executeQuery(authQueries.read_all_org_id, [id])
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
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err);
                saveLoggers(req, err.message || "");
                return serverErrorMsg(res, err?.message);
            });
    } catch (err) {
        // console.log("🚀 ~ module.exports.getRoleList= ~ err:", err)
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};

module.exports.deleteOrg = async (req, res) => {
    try {
        const org = req.body;
        const id = req.params.id;

        org.updatedAt = presenttimestamp();
        org.updatedBy = req.decodedToken.tokenresult[0].accountId;

        mySQLInstance
            .executeQuery(authQueries.isOrg_Exists, [id])
            .then((result) => {
                if (result[0].count == 1) {
                    mySQLInstance
                        .executeQuery(authQueries.delete_org, [id])
                        .then((result) => {
                            return returnData(
                                res,
                                200,
                                CONSTANTS.STATUS_MSG.SUCCESS.ORG_DELETED
                            );
                        })
                        .catch((err) => {
                            // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
                            saveLoggers(req, err);
                            return serverErrorMsg(res, err?.message);
                        });
                } else {
                    return returnData(
                        res,
                        409,
                        CONSTANTS.STATUS_MSG.ERROR.INVALID_ORG_ID
                    );
                }
            })
            .catch((err) => {
                // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
                saveLoggers(req, err);
                return serverErrorMsg(res, err?.message);
            });
    } catch (err) {
        // console.log("🚀 ~ module.exports.createRole= ~ err:", err);
        saveLoggers(req, err);
        return serverErrorMsg(res, err.message);
    }
};

// Function to get content type based on file extension
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.bmp':
            return 'image/bmp';
        case '.svg':
            return 'image/svg+xml';
        default:
            return 'application/octet-stream';
    }
}


// upload admin profiel pic
module.exports.uploadAdminImage = async (req, res) => {
    try {
        const { tokenresult } = req.decodedToken;
        // console.log("🚀 ~ module.exports.uploadAdminImage= ~ tokenresult:", tokenresult)
        const file = req.file;
        // console.log("🚀 ~ module.exports.uploadAdminImage= ~ file:", file)
        if (file) {
            const compressedImage = await compressImage(res, file.path)

            // Upload file to S3
            const params = {
                Bucket: ENV_DATA.S3BUCKET_NAME,
                Key: file.originalname,
                Body: compressedImage,
                ContentType: getContentType(file.path),
                CacheControl: 'max-age=3600',
                ContentDisposition: 'inline',
            };

            s3.upload(params, async (err, data) => {
                if (err) {
                    saveLoggers(res, 'Error uploading image to S3')
                    return returnData(res, 500, 'Error uploading image to S3');
                }

                // Store S3 URL in MySQL
                const imageUrl = data.Location;
                const result = await mySQLInstance.executeQuery(authQueries.adminImageupdtaeQuery, [imageUrl, tokenresult[0].id])
                // console.log("🚀 ~ s3.upload ~ result:", result)

                // Delete file from server
                fs.unlink(file.path, (err) => {
                    if (err) {
                        // console.log("🚀 ~ fs.unlink ~ err:", err)
                        saveLoggers(res, err)
                        console.log("Error deleting file from server")
                    }
                    // console.log('File deleted from server');
                });

                await deleteObjectByUrl(res, tokenresult[0].profileImage)

                return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.PROFILE_IMG_UPLOADED)

            });
        } else {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.IMAGE_REQUIRED)
            return serverErrorMsg(res, CONSTANTS.STATUS_MSG.ERROR.IMAGE_REQUIRED)
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.uploadAdminImage= ~ err:", err)
        return _serverErrorMsg(res, err)
    }
}

// upload the users image
module.exports.uploadCustomerImage = async (req, res) => {
    try {
        const { tokenresult } = req.decodedToken;
        const file = req.file;
        if (file) {
            const compressedImage = await compressImage(res, file.path)

            // Upload file to S3
            const params = {
                Bucket: ENV_DATA.S3BUCKET_NAME,
                Key: file.originalname,
                Body: compressedImage,
                ContentType: getContentType(file.path),
                CacheControl: 'max-age=3600',
                ContentDisposition: 'inline',
            };

            s3.upload(params, async (err, data) => {
                if (err) {
                    saveLoggers(res, 'Error uploading image to S3')
                    return returnData(res, 500, 'Error uploading image to S3');
                }

                // Store S3 URL in MySQL
                const imageUrl = data.Location;
                const result = await mySQLInstance.executeQuery(authQueries.customerImageUpdateQuery, [imageUrl, tokenresult[0].id])
                // console.log("🚀 ~ s3.upload ~ result:", result)

                // Delete file from server
                await fs.unlink(file.path, (err) => {
                    if (err) {
                        // console.log("🚀 ~ fs.unlink ~ err:", err)
                        saveLoggers(res, err)
                        console.log("Error deleting file from server")
                    }
                    // console.log('File deleted from server');
                });

                await deleteObjectByUrl(res, tokenresult[0].profileImage)

                return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.PROFILE_IMG_UPLOADED)
            });
        } else {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.IMAGE_REQUIRED)
            return serverErrorMsg(res, CONSTANTS.STATUS_MSG.ERROR.IMAGE_REQUIRED)
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.uploadAdminImage= ~ err:", err)
        return _serverErrorMsg(res, err)
    }
}

// upload the hospital profile
module.exports.uploadHospitalImage = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        // console.log("🚀 ~ module.exports.uploadHospitalImage= ~ tokenresult:", tokenresult)
        const file = req.file;
        // console.log("🚀 ~ module.exports.uploadHospitalImage= ~ file:", file)
        if (file) {
            let getHospitalData = await mySQLInstance.executeQuery(authQueries.hospitalDetailById, [hospitalId])

            const compressedImage = await compressImage(res, file.path)

            // Upload file to S3
            const params = {
                Bucket: ENV_DATA.S3BUCKET_NAME,
                Key: file.originalname,
                Body: compressedImage,
                ContentType: getContentType(file.path),
                CacheControl: 'max-age=3600',
                ContentDisposition: 'inline',
            };

            s3.upload(params, async (err, data) => {
                if (err) {
                    saveLoggers(res, 'Error uploading image to S3')
                    return returnData(res, 500, 'Error uploading image to S3');
                }

                // Store S3 URL in MySQL
                const imageUrl = data.Location;
                const result = await mySQLInstance.executeQuery(authQueries.hospitalImageupdtaeQuery, [imageUrl, hospitalId])
                // console.log("🚀 ~ s3.upload ~ result:", result)

                // Delete file from server
                fs.unlink(file.path, (err) => {
                    if (err) {
                        // console.log("🚀 ~ fs.unlink ~ err:", err)
                        saveLoggers(res, err)
                        console.log("Error deleting file from server")
                    }
                    // console.log('File deleted from server');
                });

                await deleteObjectByUrl(res, getHospitalData[0].hospitalImage)

                return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.PROFILE_IMG_UPLOADED)

            });
        } else {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.IMAGE_REQUIRED)
            return serverErrorMsg(res, CONSTANTS.STATUS_MSG.ERROR.IMAGE_REQUIRED)
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.uploadAdminImage= ~ err:", err)
        return _serverErrorMsg(res, err)
    }
}

// upload the lab profile
module.exports.uploadLabImage = async (req, res) => {
    try {
        const { labId } = req.params;
        const file = req.file;
        if (file) {
            let getLabData = await mySQLInstance.executeQuery(authQueries.labDetailById, [labId])

            const compressedImage = await compressImage(res, file.path)

            // Upload file to S3
            const params = {
                Bucket: ENV_DATA.S3BUCKET_NAME,
                Key: file.originalname,
                Body: compressedImage,
                ContentType: getContentType(file.path),
                CacheControl: 'max-age=3600',
                ContentDisposition: 'inline',
            };

            s3.upload(params, async (err, data) => {
                if (err) {
                    saveLoggers(res, 'Error uploading image to S3')
                    return returnData(res, 500, 'Error uploading image to S3');
                }

                // Store S3 URL in MySQL
                const imageUrl = data.Location;
                const result = await mySQLInstance.executeQuery(authQueries.labImageupdateQuery, [imageUrl, labId])
                // console.log("🚀 ~ s3.upload ~ result:", result)

                // Delete file from server
                fs.unlink(file.path, (err) => {
                    if (err) {
                        saveLoggers(res, err)
                        console.log("Error deleting file from server")
                    }
                    // console.log('File deleted from server');
                });

                await deleteObjectByUrl(res, getLabData[0].labImage)

                return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.PROFILE_IMG_UPLOADED)

            });
        } else {
            saveLoggers(res, CONSTANTS.STATUS_MSG.ERROR.IMAGE_REQUIRED)
            return serverErrorMsg(res, CONSTANTS.STATUS_MSG.ERROR.IMAGE_REQUIRED)
        }
    } catch (err) {
        // console.log("🚀 ~ module.exports.uploadAdminImage= ~ err:", err)
        return _serverErrorMsg(res, err)
    }
}


// update fcp token
module.exports.updateFCMtoken = async (req, res) => {
    try {
        const { id, fcmtoken } = req.params
        const result = await mySQLInstance.executeQuery(authQueries.updateFCMtoken, [fcmtoken, id])
        if (result.affectedRows < 1) {
            saveLoggers(req, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
            return returnData(res, 404, CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
        }
        return returnData(res, 200, CONSTANTS.STATUS_MSG.SUCCESS.FCM_UPDATED);
    } catch (error) {
        return _serverErrorMsg(res, error)
    }
}

// get the organization users based on the organization id
module.exports.getUsersListByOrgId = async (req, res) => {
    try {
        const { orgId } = req.params;

        mySQLInstance
            .executeQuery(authQueries.getUsersByOrgId, [orgId])
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
                saveLoggers(req, err);
                return serverErrorMsg(res, err.message);
            });
    } catch (err) {
        saveLoggers(req, err);
        return serverErrorMsg(res, err.message);
    }
};

// add users to the organisations
// create user from admin only
module.exports.userSignupToOrg = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, organizationId } = req.body;
        // console.log("🚀 ~ module.exports.userSignup= ~ organizationId:", organizationId)
        const { tokenresult } = req.decodedToken;

        bcrypt.hash(password, 9, async (err, hash) => {
            if (err) {
                saveLoggers(req, err || "");
                return serverErrorMsg(res, err?.message);
            } else {
                // values to store in user database table
                const userValues = [
                    name,
                    email,
                    phoneNumber,
                    hash,
                    tokenresult[0].accountId,
                    presenttimestamp(),
                    1,
                    organizationId || null
                ];

                // executing the query
                mySQLInstance
                    .executeQuery(authQueries.usersignUpQuery, [userValues])
                    .then(async (result) => {
                        let payload = {
                            to: email,
                            subject: "User Credentials",
                            html: MAIL_HTML_TEMPLATES.SIGNUP_TEMPLATE(email, password, true),
                        };
                        await mailService.sendMail(payload);
                        return returnData(
                            res,
                            201,
                            CONSTANTS.STATUS_MSG.SUCCESS.ADMIN_REGISTERED
                        );
                    })
                    .catch((err) => {
                        // console.log("🚀 ~ mySQLInstance.executeQuery ~ err:", err)
                        saveLoggers(req, err);
                        if (err && err.code === "ER_DUP_ENTRY") {
                            const duplicateEntryRegex =
                                /Duplicate entry '(.*)' for key '(.*)'/;
                            const matches = err.message.match(duplicateEntryRegex);
                            if (matches && matches.length >= 3) {
                                const duplicatedKey = matches[2];
                                if (
                                    duplicatedKey === "email" ||
                                    duplicatedKey === "email"
                                ) {
                                    return returnData(
                                        res,
                                        409,
                                        CONSTANTS.STATUS_MSG.ERROR.EMAIL_EXISTS
                                    );
                                } else if (
                                    duplicatedKey === "phoneNumber" ||
                                    duplicatedKey === "phoneNumber"
                                ) {
                                    return returnData(
                                        res,
                                        409,
                                        CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXISTS
                                    );
                                }
                            }
                        } else if (err && err.message === "Unable to send mail") {
                            return serverErrorMsg(res, CONSTANTS.STATUS_MSG.ERROR.UNABLE_SEND_MAIL);
                        } else {
                            // if any other error occurs
                            return serverErrorMsg(res, err?.message);
                        }
                    });
            }
        });
    } catch (err) {
        saveLoggers(req, err.message || "");
        return serverErrorMsg(res, err?.message);
    }
};