const Yup = require("yup");
const { CONSTANTS } = require("../../../utils/constants");
const { REGEX } = require("../../../utils/regEx");


const valuator_Schema = {
    create_valuator_schema: Yup.object({
        name: Yup.string().required("Name is required"),
        email: Yup.string()
            .email("Enter valid email")
            .required("Email is Required")
            .matches(REGEX.EMAIL, "Please enter valid email address"),
        city: Yup.string().notRequired(),
        pincode: Yup.string().notRequired(),
        state: Yup.string().notRequired(),
        secondary_contact_no: Yup.string().notRequired(),
        area: Yup.string().notRequired(),
        address: Yup.string().notRequired(),
        dob: Yup.string().notRequired(),
        contact_no: Yup.string()
            .required("Contact number is required")
            .matches(REGEX.PHONE_NO, "Enter a valid mobile number"),
        profile_image: Yup.string().notRequired(),
        username: Yup.string()
            .required("Username is required"),
        gender: Yup.string().notRequired(),
        password: Yup.string()
            .required("Password is Required")
            .matches(
                REGEX.PASSWORD,
                CONSTANTS.STATUS_MSG.ERROR.PASSWORD_INVALID
            ),
        confirmPassword: Yup.string()
            .required("confirm password required")
            .oneOf(
                [Yup.ref("password"), null],
                "Confirm password must match with new password"
            )
    }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`),


    update_caluator_schema: Yup.object({
        name: Yup.string().required("Name is required"),
        email: Yup.string()
            .email("Enter valid email")
            .required("Email is Required")
            .matches(REGEX.EMAIL, "Please enter valid email address"),
        city: Yup.string().notRequired(),
        pincode: Yup.string().notRequired(),
        state: Yup.string().notRequired(),
        secondary_contact_no: Yup.string().notRequired(),
        area: Yup.string().notRequired(),
        address: Yup.string().notRequired(),
        gender: Yup.string().notRequired(),
        dob: Yup.string().notRequired(),
        contact_no: Yup.string()
            .required("Contact number is required")
            .matches(REGEX.PHONE_NO, "Enter a valid mobile number"),
        profile_image: Yup.string().notRequired(),
    }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`)




};

module.exports = { valuator_Schema };
