const express = require("express");
const { CONSTANTS } = require("../utils/constants");
const { CONTROLLERS } = require("../controllers/controllers.index");
const {
    auth_validation,
} = require("../middlewares/validation/authvalidations");
const {
    endPointDetectMiddleware,
} = require("../middlewares/validation/endpointDetect");
const {
    verifyToken,
    verifyAdminToken,
} = require("../middlewares/validation/tokenValidation");
const { uploads } = require("../middlewares/s3bucket/s3bucket");
const router = express.Router();
// #swagger.start
// sign up
router.post(
    CONSTANTS.API_END_POINTS.AUTH.SIGNUP,
    endPointDetectMiddleware,
    auth_validation.signupValidation,
    CONTROLLERS.AUTH_CONTROLLERS.signup
);
// signup otp validation for users
router.post(
    CONSTANTS.API_END_POINTS.AUTH.VERIFY_SIGNUP_OTP,
    endPointDetectMiddleware,
    auth_validation.signupOTPValidation,
    CONTROLLERS.AUTH_CONTROLLERS.verifySignUpOTP
);
// signin
router.post(
    CONSTANTS.API_END_POINTS.AUTH.SIGNIN,
    endPointDetectMiddleware,
    auth_validation.signinValidation,
    CONTROLLERS.AUTH_CONTROLLERS._signin
);
router.post(
    CONSTANTS.API_END_POINTS.AUTH.VERIFY_LOGIN_OTP,
    auth_validation.otpValidation,
    CONTROLLERS.AUTH_CONTROLLERS.verifyLoginOtp
);
router.post(
    CONSTANTS.API_END_POINTS.AUTH.FORGOT_PASSWORD,
    endPointDetectMiddleware,
    auth_validation.forgotValidation,
    CONTROLLERS.AUTH_CONTROLLERS.forgotPassword
);
router.post(
    CONSTANTS.API_END_POINTS.AUTH.VERIFY_FORGOT_OTP,
    auth_validation.forgototpValidation,
    CONTROLLERS.AUTH_CONTROLLERS.verifyForgotOtp
);
router.put(
    CONSTANTS.API_END_POINTS.AUTH.RESET_PASSWORD,
    endPointDetectMiddleware,
    auth_validation.resetPassValidation,
    CONTROLLERS.AUTH_CONTROLLERS.resetPassword
);

// for the admin reset password
router.put(
    CONSTANTS.API_END_POINTS.AUTH.CHANGE_PASSWORD,
    endPointDetectMiddleware,
    auth_validation.resetAdminPassValidation,
    verifyAdminToken,
    CONTROLLERS.AUTH_CONTROLLERS.changePassword
);
router.put(
    CONSTANTS.API_END_POINTS.AUTH.UPDATE_USER,
    endPointDetectMiddleware,
    auth_validation.updateUserDetailsValidation,
    verifyToken,
    CONTROLLERS.AUTH_CONTROLLERS.updateUsersDetails
);
router.get(
    CONSTANTS.API_END_POINTS.AUTH.USER_LIST,
    endPointDetectMiddleware,
    auth_validation.getUserListValidation,
    verifyToken,
    CONTROLLERS.AUTH_CONTROLLERS.getUsersList
);
router.get(
    CONSTANTS.API_END_POINTS.AUTH.USER_DETAILS_BY_ID,
    endPointDetectMiddleware,
    auth_validation.getUserListByIdValidation,
    verifyToken,
    CONTROLLERS.AUTH_CONTROLLERS.getUsersListById
);
router.delete(
    CONSTANTS.API_END_POINTS.AUTH.DELETE_USER,
    endPointDetectMiddleware,
    auth_validation.deleteUserValidation,
    verifyToken,
    CONTROLLERS.AUTH_CONTROLLERS.deleteUsersOrAdmin
);

// refresh token
router.get(
    CONSTANTS.API_END_POINTS.AUTH.REFRESH_TOKEN,
    CONTROLLERS.AUTH_CONTROLLERS.refreshtoken
);

//roles
router.post(
    CONSTANTS.API_END_POINTS.AUTH.CREATE_ROLE,
    auth_validation.createRoleValidation,
    verifyAdminToken,
    CONTROLLERS.AUTH_CONTROLLERS.createRole
);
router.put(
    CONSTANTS.API_END_POINTS.AUTH.UPDATE_ROLE,
    auth_validation.updateRoleValidation,
    verifyAdminToken,
    CONTROLLERS.AUTH_CONTROLLERS.updateRole
);
router.get(
    CONSTANTS.API_END_POINTS.AUTH.GET_ROLE,
    verifyAdminToken,
    CONTROLLERS.AUTH_CONTROLLERS.getRoleList
);
router.delete(
    CONSTANTS.API_END_POINTS.AUTH.DELETE_ROLE,
    verifyAdminToken,
    CONTROLLERS.AUTH_CONTROLLERS.deleterole
);

//users
router.post(
    CONSTANTS.API_END_POINTS.AUTH.IMPORT_USER,
    verifyAdminToken,
    auth_validation.userImportValidate,
    CONTROLLERS.AUTH_CONTROLLERS.importuser
);

// all oranization 
router.get(
    CONSTANTS.API_END_POINTS.AUTH.READ_ORG,
    verifyAdminToken,
    CONTROLLERS.AUTH_CONTROLLERS.readOrg
);
// get oranization which are made payment
router.get(
    CONSTANTS.API_END_POINTS.AUTH.GET_ORG_PAYMENT,
    verifyAdminToken,
    CONTROLLERS.AUTH_CONTROLLERS.getPaidOrg
);

router.get(
    CONSTANTS.API_END_POINTS.AUTH.READ_ORGBYID,
    verifyAdminToken,
    CONTROLLERS.AUTH_CONTROLLERS.readOrgbyid
);

router.post(
    CONSTANTS.API_END_POINTS.AUTH.CREATE_ORG,
    verifyAdminToken,
    auth_validation.orgCreateValidate,
    CONTROLLERS.AUTH_CONTROLLERS.createOrg
);

router.put(
    CONSTANTS.API_END_POINTS.AUTH.UPDATE_ORG,
    verifyAdminToken,
    auth_validation.orgUpdateValidate,
    CONTROLLERS.AUTH_CONTROLLERS.updateOrg
);

router.delete(
    CONSTANTS.API_END_POINTS.AUTH.DELETE_ORG,
    verifyAdminToken,
    CONTROLLERS.AUTH_CONTROLLERS.deleteOrg
    // CONTROLLERS.AUTH_CONTROLLERS.updateOrg
);

// #swagger.end
// module.exports = router;
// users CRUD APIS
router.post(CONSTANTS.API_END_POINTS.AUTH.USER_CREATE, auth_validation.userSignupValidation, verifyAdminToken, CONTROLLERS.AUTH_CONTROLLERS.userSignup)
router.put(CONSTANTS.API_END_POINTS.AUTH.USER_UPDATE, auth_validation.updateUserDetailsFromAdminValidation, verifyAdminToken, CONTROLLERS.AUTH_CONTROLLERS.updateUsersDetailsByAdmin)
router.get(CONSTANTS.API_END_POINTS.AUTH.USER_GET, verifyAdminToken, CONTROLLERS.AUTH_CONTROLLERS.getUsersListForAdmins)
router.delete(CONSTANTS.API_END_POINTS.AUTH.USER_DELETE, verifyAdminToken, CONTROLLERS.AUTH_CONTROLLERS.deleteUsersByAdmin)

// upload the admin profile pictures
router.post(CONSTANTS.API_END_POINTS.AUTH.UPLOAD_ADMIN_IMAGE, uploads.single("image"), verifyAdminToken, CONTROLLERS.AUTH_CONTROLLERS.uploadAdminImage)
// upload the hospital profile pictures
router.post(CONSTANTS.API_END_POINTS.AUTH.UPLOAD_HOSPITAL_IMAGE, uploads.single("image"), verifyAdminToken, CONTROLLERS.AUTH_CONTROLLERS.uploadHospitalImage)
// upload the lab profile pictures
router.post(CONSTANTS.API_END_POINTS.AUTH.UPLOAD_LAB_IMAGE, uploads.single("image"), verifyAdminToken, CONTROLLERS.AUTH_CONTROLLERS.uploadLabImage)
// upload the customer Image
router.post(CONSTANTS.API_END_POINTS.AUTH.UPLOAD_CUSTOMER_IMAGE, uploads.single("image"), verifyToken, CONTROLLERS.AUTH_CONTROLLERS.uploadCustomerImage)

// delete user permanently
router.delete(CONSTANTS.API_END_POINTS.AUTH.DELTE_USER_PERMANENTLY, CONTROLLERS.AUTH_CONTROLLERS.deletePermanentlyUsers)

router.get(CONSTANTS.API_END_POINTS.AUTH.UPDATE_FCM_TOKEN, auth_validation.fcmtokenvalidation, verifyToken, CONTROLLERS.AUTH_CONTROLLERS.updateFCMtoken)

// get users based on orgid
router.get(CONSTANTS.API_END_POINTS.AUTH.GET_USERSLIST_BY_ORGID, verifyAdminToken, CONTROLLERS.AUTH_CONTROLLERS.getUsersListByOrgId)

// add users based on the org
router.post(CONSTANTS.API_END_POINTS.AUTH.ADD_USERS_ORG, auth_validation.userSignupValidation, verifyAdminToken, CONTROLLERS.AUTH_CONTROLLERS.userSignup)



module.exports = router;
