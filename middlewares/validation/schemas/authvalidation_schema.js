const Yup = require("yup");
const { CONSTANTS } = require("../../../utils/constants");
const { REGEX } = require("../../../utils/regEx");

const auth_Schema = {
  // signup schema
  signUp_Schema: (reqBody) => {

    const signUpValidationSchema = Yup.object({
        name: Yup.string()
          .required("Name is required")
          .matches(REGEX.LETTERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.NAME_FIELD),
        email: Yup.string()
          .email("Enter valid email")
          .required("Email is Required")
          .matches(REGEX.EMAIL, "Please enter valid email address"),
        contact_no: Yup.string()
          .required("Contact number is required")
          .matches(
            REGEX.PHONE_NO,
            "ContactNumber must contain only numbers and be exactly 10 digits"
          ),
        gender: Yup.string()
          .required("gender is required")
          .matches(
            REGEX.GENDER_VALID,
            "Gender must be male, female or others"
          ),
        username: Yup.string()
          .required("Username is Required"),
        password: Yup.string()
          .required("Password is Required")
          .matches(
            REGEX.PASSWORD,
            CONSTANTS.STATUS_MSG.ERROR.PASSWORD_INVALID
          ),
        confirmPassword: Yup.string()
          .oneOf(
            [Yup.ref("password"), null],
            "Confirm password must match with new password"
          )
          .required("confirm password required"),
        roleId: Yup.number()
          .required("RoleId is Required")
          .typeError("RoleId must be number"),
          address: Yup.string().notRequired(),
          city: Yup.string().notRequired(),
          state: Yup.string().notRequired(),
          country: Yup.string().notRequired(),
          pincode: Yup.string().notRequired(),
          dob: Yup.string().test("dob", (value, context) => {
            let isTrue = value !== undefined && value !== null && value !== "";
            if (isTrue && !REGEX.DOB_FORMAT.test(value)) {
              throw context.createError({
                message: "Date of birth must be in the format `YYYY-MM-DD`",
              });
            }
            return true;
          }),
      }).strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`)
      
    return signUpValidationSchema;
  },

  // signin schema
  signin_schema: (reqBody) => {
    const validtionSchema =  Yup.object({
      username: Yup.string()
        .required("Username is required"),
      password: Yup.string().required("password required")})
        .strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`);

    // console.log("🚀 ~ file: common.js:67 ~ isValidPhonenumberOrEmail ~ validtionSchema", validtionSchema)

    return validtionSchema;
  },

  // otp schema
  otp_schema: Yup.object({
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(
        REGEX.PHONE_NO,
        "PhoneNumber must contain only numbers and be exactly 10 digits"
      ),
    otp: Yup.string().required("Otp is required"),
  })
    .strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  // forgot password
  forgot_schema: (reqBody) => {
    // it contains only digits or not
    const isPhoneNumber = REGEX.NUMBERS_ONLY.test(reqBody.email_phoneNumber);
    // if it is phone number
    const validtionSchema = isPhoneNumber
      ? Yup.object({
        email_phoneNumber: Yup.string()
          .required("Phone number or email required")
          .matches(
            REGEX.PHONE_NO,
            "PhoneNumber must contain only numbers and be exactly 10 digits"
          ),
        isAdmin: Yup.boolean().required("IsAdmin is Required"),
      })
        .strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`)
      : Yup.object({
        email_phoneNumber: Yup.string()
          .required("Phone number or email required")
          .matches(REGEX.EMAIL, "Please enter valid email address"),
        isAdmin: Yup.boolean().required("IsAdmin is Required"),
      })
        .strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`);

    return validtionSchema;
  },

  // verify forgot otp schema
  forgot_otp_schema: (reqBody) => {
    // it contains only digits or not
    const isPhoneNumber = REGEX.NUMBERS_ONLY.test(reqBody.email_phoneNumber);
    // if it is phone number
    const validtionSchema = isPhoneNumber
      ? Yup.object({
        email_phoneNumber: Yup.string()
          .required("Phone number or email required")
          .matches(
            REGEX.PHONE_NO,
            "PhoneNumber must contain only numbers and be exactly 10 digits"
          ),
        otp: Yup.string().required("OTP is Required"),
      })
        .strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`)
      : Yup.object({
        email_phoneNumber: Yup.string()
          .required("Phone number or email required")
          .matches(REGEX.EMAIL, "Please enter valid email address"),
        otp: Yup.string().required("OTP is Required"),
      })
        .strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`);

    return validtionSchema;
  },

  // reset password schema
  resetPass_Schema: (reqBody) => {
    const isPhoneNumber = REGEX.NUMBERS_ONLY.test(reqBody.email_phoneNumber);

    const validtionSchema = !isPhoneNumber
      ? Yup.object({
        email_phoneNumber: Yup.string()
          .email("Enter valid email or phone number")
          .required("Email or phone number is Required")
          .matches(REGEX.EMAIL, "Enter valid email or phone number"),
        newPassword: Yup.string()
          .required("Password required")
          .matches(
            REGEX.PASSWORD,
            CONSTANTS.STATUS_MSG.ERROR.PASSWORD_INVALID
          ),
        confirmPassword: Yup.string()
          .oneOf(
            [Yup.ref("newPassword"), null],
            "Confirm password must match with new password"
          )
          .required("password required"),
        isAdmin: Yup.boolean().required("IsAdmin is Required"),
      })
        .strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`)
      : Yup.object({
        email_phoneNumber: Yup.string()
          .required("Email or phone number is required")
          .matches(
            REGEX.PHONE_NO,
            "PhoneNumber must contain only numbers and be exactly 10 digits"
          ),
        newPassword: Yup.string()
          .required("Password required")
          .matches(
            REGEX.PASSWORD,
            CONSTANTS.STATUS_MSG.ERROR.PASSWORD_INVALID
          ),
        confirmPassword: Yup.string()
          .oneOf(
            [Yup.ref("newPassword"), null],
            "Confirm password must match with new password"
          )
          .required("password required"),
        isAdmin: Yup.boolean().required("IsAdmin is Required"),
      })
        .strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`);

    // console.log("🚀 ~ file: common.js:67 ~ isValidPhonenumberOrEmail ~ validtionSchema", validtionSchema)

    return validtionSchema;
  },

  // reset password schema for admin
  resetAdminPass_Schema: Yup.object({
    email_phoneNumber: Yup.string()
      .email("Enter valid email")
      .required("Email is Required")
      .matches(REGEX.EMAIL, "Enter valid email"),
    currentPassword: Yup.string().required("CurrentPassword required"),
    newPassword: Yup.string()
      .required("newPassword required")
      .matches(REGEX.PASSWORD, CONSTANTS.STATUS_MSG.ERROR.PASSWORD_INVALID),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("newPassword"), null],
        "Confirm password must match with new password"
      )
      .required("password required")
      .test(
        "same-password",
        "New Password must be different from Current Password",
        function (value) {
          const { currentPassword } = this.parent;
          return value !== currentPassword;
        }
      ),
    isAdmin: Yup.boolean().required("IsAdmin is Required"),
  })
    .strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  // update user detail schema
  updateUserDetail_Schema: () => {
    const updateDetailsValidationSchema =  Yup.object({
        name: Yup.string()
          .required("Name is required")
          .matches(REGEX.LETTERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.NAME_FIELD),
        address: Yup.string().notRequired(),
        pincode: Yup.number()
          .notRequired()
          .typeError("pincode must be number")
          .test("pincode", (value, context) => {
            let isTrue =
              value !== undefined && value !== null && value !== "";
            if (isTrue && !REGEX.PINCODE.test(value)) {
              throw context.createError({
                message:
                  "Pincode must be Numbners and contain exactly 6 digits",
              });
            }
            return true;
          }),
        state: Yup.string().notRequired().typeError("state must be string"),
        city: Yup.string().notRequired().typeError("city must be string"),
        country: Yup.string().notRequired().typeError("country must be string"),
        gender: Yup.string()
          .notRequired()
          .test("gender", (value, context) => {
            let isTrue =
              value !== undefined && value !== null && value !== "";
            if (isTrue && !REGEX.GENDER_VALID.test(value)) {
              throw context.createError({
                message: "Gender must be male, female or others",
              });
            }
            return true;
          }),
        dob: Yup.string().test("dob", (value, context) => {
          let isTrue = value !== undefined && value !== null && value !== "";
          if (isTrue && !REGEX.DOB_FORMAT.test(value)) {
            throw context.createError({
              message: "Date of birth must be in the format `YYYY-MM-DD`",
            });
          }
          return true;
        }),
        userId: Yup.string()
      .required("UserId is required")
      .matches(REGEX.NUMBERS_ONLY, "UserId with numbers only"),
      }).strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`)
      

    return updateDetailsValidationSchema;
  },

  // update user detail schema
  updateUserDetailByAdmin_Schema: Yup.object({
    name: Yup.string()
      .required("Name is required")
      .matches(REGEX.LETTERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.NAME_FIELD),
    email: Yup.string()
      .email("Enter valid email")
      .required("Email is Required")
      .matches(REGEX.EMAIL, "Please enter valid email address"),
    contact_no: Yup.string()
      .required("Phone number is required")
      .matches(
        REGEX.PHONE_NO,
        "PhoneNumber must contain only numbers and be exactly 10 digits"
      ),
      roleId: Yup.number()
      .required("Role is Required")
      .typeError("Role must be number"),
    address: Yup.string().nonNullable("address must be string"),
    city: Yup.string().nonNullable("city must be string"),
    pincode: Yup.number()
      .notRequired()
      .typeError("pincode must be number")
      .test("pincode", (value, context) => {
        let isTrue = value !== undefined && value !== null && value !== "";
        if (isTrue && !REGEX.PINCODE.test(value)) {
          throw context.createError({
            message: "Pincode must be Numbners and contain exactly 6 digits",
          });
        }
        return true;
      }),
    state: Yup.string().notRequired().typeError("state must be string"),
    country: Yup.string().notRequired().typeError("country must be string"),
    gender: Yup.string()
      .notRequired()
      .test("gender", (value, context) => {
        let isTrue = value !== undefined && value !== null && value !== "";
        if (isTrue && !REGEX.GENDER_VALID.test(value)) {
          throw context.createError({
            message: "Gender must be male, female or others",
          });
        }
        return true;
      }),
    dob: Yup.string().test("dob", (value, context) => {
      let isTrue = value !== undefined && value !== null && value !== "";
      if (isTrue && !REGEX.DOB_FORMAT.test(value)) {
        throw context.createError({
          message: "Date of birth must be in the format `YYYY-MM-DD`",
        });
      }
      return true;
    }),
    userId: Yup.string()
      .required("UserId is required")
      .matches(REGEX.NUMBERS_ONLY, "UserId with numbers only"),
  }).strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  // get list of users or admin list validation
  getUserList_schema: Yup.object({
    isAdmin: Yup.boolean().required("IsAdmin is Required"),
  })
    .strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  // get list of users or admin list by id validation
  getUserListById_schema: Yup.object({
    id: Yup.string()
      .required("Id is required")
      .matches(REGEX.NUMBERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.ID_NUMBER_ONLY),
  })
    .strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  // delete users or admin
  deleteUserAdmin_schema: Yup.object({
    userId: Yup.string()
      .required("UserId is required")
      .matches(REGEX.NUMBERS_ONLY, "UserId with numbers only"),
  })
    .strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  // create role schema
  createRole_schema: Yup.object({
    name: Yup.string().required("roleName is Required"),
    featurePermissions: Yup.string().notRequired()
  })
    .strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  // update role schema
  updateRole_schema: Yup.object({
    name: Yup.string().required("roleName is Required"),
    featurePermissions: Yup.string().notRequired(),
    roleId: Yup.string()
      .required("roleId is required")
      .matches(REGEX.NUMBERS_ONLY, "roleId must be number only"),
  })
    .strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  //import user validate fields
  importUser_schema: Yup.object({
    name: Yup.string()
      .required("name is Required in all rows")
      .matches(REGEX.LETTERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.NAME_FIELD),
    email: Yup.string()
      .email("Enter valid email")
      .required("Email is Required in all rows")
      .test("email", (value, context) => {
        let isTrue =
          value !== undefined && value !== null && value !== "";
        if (isTrue && !REGEX.EMAIL.test(value)) {
          throw context.createError({
            message:
              `${value} - Please enter valid email address`,
          });
        }
        return true;
      }),
    // .matches(REGEX.EMAIL, "Please enter valid email address"),
    phoneNumber: Yup.string()
      .required("Phone number is required in all rows")
      .test("phoneNumber", (value, context) => {
        let isTrue =
          value !== undefined && value !== null && value !== "";
        if (isTrue && !REGEX.PHONE_NO.test(value)) {
          throw context.createError({
            message:
              `${value} - PhoneNumber must contain only numbers and be exactly 10 digits`,
          });
        }
        return true;
      }),
    // .matches(
    //   REGEX.PHONE_NO,
    //   "PhoneNumber must contain only numbers and be exactly 10 digits"
    // ),
    // refferedBy: Yup.string().notRequired(),
    // profileImage: Yup.string().nonNullable("referredBy must be string"),
    // buildingno: Yup.string().notRequired(),
    // houseno: Yup.string().notRequired(),
    // pincode: Yup.number()
    //   .notRequired()
    //   .typeError("pincode must be number")
    //   .test(
    //     "is-six-digits",
    //     "Pincode must contain exactly 6 digits",
    //     (value) => String(value).length === 6
    //   ),
    // state: Yup.string().notRequired().typeError("state must be string"),
    // district: Yup.string().notRequired(),
    // city: Yup.string().notRequired(),
    // location: Yup.string().notRequired(),
    // locationlatlng: Yup.string().notRequired(),
    // gender: Yup.string()
    //   .required("gender required")
    //   .matches(
    //     /^(male|female|others)$/,
    //     "Gender must be male, female or others"
    //   ),
    // dob: Yup.string()
    //   .notRequired()
    //   .matches(
    //     /^\d{4}-\d{2}-\d{2}$/,
    //     'Date of birth must be in the format "YYYY-MM-DD"'
    //   ),
    // roleName: Yup.string().required("roleName is Required"),
    // featurePermissions: Yup.string().notRequired(),
    // updatedBy: Yup.string().required("updatedBy is required"),
    // roleId: Yup.string()
    //   .required("roleId is required")
    //   .matches(REGEX.NUMBERS_ONLY, "roleId must be number only"),
  })
    .strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  //Organization create validate
  createOrg_schema: Yup.object({
    oraganizationName: Yup.string().required("oraganizationName is Required"),
    contactPersonName: Yup.string().notRequired(),
    contactPersonEmail: Yup.string()
      .notRequired()
      .matches(REGEX.EMAIL, "Please enter valid email address"),
    contactPersonPhone: Yup.string().notRequired(),
    createdBy: Yup.string().notRequired(),
    updatedBy: Yup.string().notRequired(),
    discount: Yup.number().notRequired(),
    paymentstatus: Yup.string().required("paymentstatus is required"),
    paymentamount: Yup.string().notRequired(),
    transactionid: Yup.string().notRequired()
  }).strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),
  //Organization update validate
  updateOrg_schema: Yup.object({
    oraganizationName: Yup.string().required("oraganizationName is Required"),
    contactPersonName: Yup.string().notRequired(),
    contactPersonEmail: Yup.string()
      .notRequired()
      .matches(REGEX.EMAIL, "Please enter valid email address"),
    contactPersonPhone: Yup.string().notRequired(),
    createdBy: Yup.string().notRequired(),
    updatedBy: Yup.string().notRequired(),
    discount: Yup.number().notRequired(),
    paymentstatus: Yup.string().notRequired(),
    paymentamount: Yup.string().notRequired(),
    transactionid: Yup.string().notRequired()
  }).strict(true)
    .noUnknown((val) => `${val.unknown} - unknown property`),

  // fcp token schema
  updateFCMtoken_schema: Yup.object({
    fcmtoken: Yup.string().required("fcmtoken is Required"),
    id: Yup.string()
      .required("id is required")
      .matches(REGEX.NUMBERS_ONLY, "id must be number only"),
  }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`),
};

module.exports = { auth_Schema };
