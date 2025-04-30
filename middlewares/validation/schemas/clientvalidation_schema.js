const Yup = require("yup");
const { CONSTANTS } = require("../../../utils/constants");
const { REGEX } = require("../../../utils/regEx");

const client_Vaidation_Schema = {
  // vehicletype validation schema
    createVehicleTypeValidation: Yup.object().shape({
       name: Yup.string().trim()
        .required("type Name is required"),
        short_code: Yup.string().trim()
        .required("short_code is required"),
        description: Yup.string().trim()
        .notRequired()
    }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`),

    updateVehicleTypeValidation: Yup.object().shape({
        typeId:Yup.string().required("typeId is required").matches(REGEX.NUMBERS_ONLY,CONSTANTS.STATUS_MSG.ERROR.ID_NUMBER_ONLY),
        name: Yup.string().trim()
        .required("type Name is required"),
        description: Yup.string().trim()
        .notRequired()
    }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`),

    updateVehicleCategoryValidation: Yup.object().shape({
      categoryId:Yup.string().required("categoryId is required").matches(REGEX.NUMBERS_ONLY,CONSTANTS.STATUS_MSG.ERROR.ID_NUMBER_ONLY),
      name: Yup.string().trim()
      .required("Name is required"),
      description: Yup.string().trim()
      .notRequired()
  }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`),

    typeIdValidation: Yup.object().shape({
        typeId: Yup.string()
        .required("typeId is required")
        .matches(REGEX.NUMBERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.ID_NUMBER_ONLY),
    }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`),

    categoryIdValidation: Yup.object().shape({
      categoryId: Yup.string()
      .required("categoryId is required")
      .matches(REGEX.NUMBERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.ID_NUMBER_ONLY),
  }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`),

  // clients 
  createClient_Schema:  Yup.object({
    contact_person_name: Yup.string().trim()
          .required("Name is required")
          .matches(REGEX.LETTERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.NAME_FIELD),
          company_name: Yup.string().trim()
          .required("Comapny Name is required"),
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
        username: Yup.string().trim()
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
          address: Yup.string().notRequired(),
          city: Yup.string().notRequired(),
          area: Yup.string().notRequired(),
          state: Yup.string().notRequired(),
          pincode: Yup.string().notRequired(),
          secondary_contact_no: Yup.string()
          .nullable() 
          .notRequired() 
          .test(
            'is-valid-phone',
            'Secondary Contact Number must contain only numbers and be exactly 10 digits',
            value => {
              if (!value) return true;
              return REGEX.PHONE_NO.test(value);
            }
          ),
          vehicletypes:Yup.array()
          .of(Yup.number().typeError('Must be a number').required('vehicletypes is Required'))
          .min(1, 'vehicletypes is Required'),
      }).strict(true)
        .noUnknown((val) => `${val.unknown} - unknown property`),

        updateClient_Schema:  Yup.object({
          clientId: Yup.string()
          .required("clientId is required")
          .matches(REGEX.NUMBERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.ID_NUMBER_ONLY),
          contact_person_name: Yup.string().trim()
            .required("Name is required")
            .matches(REGEX.LETTERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.NAME_FIELD),
            company_name: Yup.string().trim()
          .required("Comapny Name is required"),
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
            secondary_contact_no: Yup.string()
            .nullable() 
            .notRequired() 
            .test(
              'is-valid-phone',
              'Secondary Contact Number must contain only numbers and be exactly 10 digits',
              value => {
                if (!value) return true;
                return REGEX.PHONE_NO.test(value);
              }
            ),
            address: Yup.string().notRequired(),
            city: Yup.string().notRequired(),
            area: Yup.string().notRequired(),
            state: Yup.string().notRequired(),
            pincode: Yup.string().notRequired(),
            vehicletypes:Yup.array()
            .of(Yup.number().typeError('Must be a number').required('vehicletypes is Required'))
            .min(1, 'vehicletypes is Required'),
        }).strict(true)
          .noUnknown((val) => `${val.unknown} - unknown property`),

          clientIdValidation: Yup.object().shape({
            clientId: Yup.string()
            .required("clientId is required")
            .matches(REGEX.NUMBERS_ONLY, CONSTANTS.STATUS_MSG.ERROR.ID_NUMBER_ONLY),
        }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`),
      
};

module.exports = { client_Vaidation_Schema };
