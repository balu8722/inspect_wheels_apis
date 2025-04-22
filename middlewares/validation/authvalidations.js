const { returnError } = require("../../utils/common");
const { auth_Schema } = require("./schemas/authvalidation_schema");

const auth_validation = {
  // signup validation
  signupValidation: async (req, res, next) => {
    try {
      await auth_Schema.signUp_Schema(req.body, false).validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  // user signup validation for admin only
  userSignupValidation: async (req, res, next) => {
    try {
      let _reqBody = { ...req.body, isAdmin: false }
      await auth_Schema.signUp_Schema(_reqBody, false).validate(_reqBody)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },

  // signup otp validation
  signupOTPValidation: async (req, res, next) => {
    try {
      await auth_Schema.signUp_Schema(req.body, true).validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },

  // signin validation 
  signinValidation: async (req, res, next) => {
    try {
      await auth_Schema.signin_schema(req.body).validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      // console.log("🚀 ~ signinValidation: ~ err:", err)
      returnError(res, err)
    }
  },

  // verifyotp validation
  otpValidation: async (req, res, next) => {
    try {
      await auth_Schema.otp_schema.validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  // forgototp validation
  forgototpValidation: async (req, res, next) => {
    try {
      await auth_Schema.forgot_otp_schema(req.body).validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },

  // verifyotp validation
  forgotValidation: async (req, res, next) => {
    try {
      await auth_Schema.forgot_schema(req.body).validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  // reset pass validation
  resetPassValidation: async (req, res, next) => {
    try {
      await auth_Schema.resetPass_Schema(req.body).validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  // reset pass validation
  resetAdminPassValidation: async (req, res, next) => {
    try {
      await auth_Schema.resetAdminPass_Schema.validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },

  // update the details validation
  updateUserDetailsValidation: async (req, res, next) => {
    try {
      const reqBody = { ...req.params, ...req.body }
      // console.log("🚀 ~ updateUserDetailsValidation: ~ reqBody:", reqBody)
      await auth_Schema.updateUserDetail_Schema(reqBody).validate(reqBody)
      // if the schema values are correct
      next()
    } catch (err) {
      // console.log("🚀 ~ updateUserDetailsValidation: ~ err:", err)
      returnError(res, err)
    }
  },

  // update the user details validation from amin only
  updateUserDetailsFromAdminValidation: async (req, res, next) => {
    try {
      const reqBody = { ...req.params, ...req.body }
      // console.log("🚀 ~ updateUserDetailsValidation: ~ reqBody:", reqBody)
      await auth_Schema.updateUserDetailByAdmin_Schema.validate(reqBody)
      // if the schema values are correct
      next()
    } catch (err) {
      // console.log("🚀 ~ updateUserDetailsValidation: ~ err:", err)
      returnError(res, err)
    }
  },

  // validate the get list
  getUserListValidation: async (req, res, next) => {
    try {
      let data = { ...req.body, ...req.params }
      await auth_Schema.getUserList_schema.validate(data)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },

  // validate the get list
  getUserListByIdValidation: async (req, res, next) => {
    try {
      let data = { ...req.params }
      await auth_Schema.getUserListById_schema.validate(data)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },

  // validate the get list
  deleteUserValidation: async (req, res, next) => {
    try {
      let data = { ...req.body, ...req.params }
      await auth_Schema.deleteUserAdmin_schema.validate(data)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },


  // create roles validation
  createRoleValidation: async (req, res, next) => {
    try {
      let data = { ...req.body }
      await auth_Schema.createRole_schema.validate(data)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },

  // update roles validation
  updateRoleValidation: async (req, res, next) => {
    try {
      let data = { ...req.body, ...req.params }
      await auth_Schema.updateRole_schema.validate(data)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },

  orgCreateValidate: async (req, res, next) => {
    try {
      let data = { ...req.body };
      await auth_Schema.createOrg_schema.validate(data);
      // if the schema values are correct
      next();
    } catch (error) {
      console.log("middleware error", error);
      returnError(res, error);
    }
  },
  orgUpdateValidate: async (req, res, next) => {
    try {
      let data = { ...req.body };
      await auth_Schema.updateOrg_schema.validate(data);
      // if the schema values are correct
      next();
    } catch (error) {
      console.log("middleware error", error);
      returnError(res, error);
    }
  },

  userImportValidate: async (req, res, next) => {
    try {
      let { users } = { ...req.body };
      for (const detail of users) {
        let data = { ...detail };
        await auth_Schema.importUser_schema.validate(data);
      }
      next();
    } catch (error) {
      console.log("middleware error", error);
      returnError(res, error);
    }
  },


  // fcp token validation|
  fcmtokenvalidation: async (req, res, next) => {
    try {
      await auth_Schema.updateFCMtoken_schema.validate(req.params);
      next();
    } catch (error) {
      returnError(res, error);
    }
  },
};
module.exports = { auth_validation };
