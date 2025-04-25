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
        dob: Yup.string().test("dob", (value, context) => {
            let isTrue = value !== undefined && value !== null && value !== "";
            if (isTrue && !REGEX.DOB_FORMAT.test(value)) {
                throw context.createError({
                    message: "Date of birth must be in the format `YYYY-MM-DD`",
                });
            }
            return true;
        }),
        contact_no: Yup.string()
            .required("Contact number is required")
            .matches(REGEX.PHONE_NO, "Enter a valid mobile number"),
        profile_image: Yup.string().notRequired(),
        username: Yup.string()
            .required("Username is required"),
        gender: Yup.string()
            .required("gender is required")
            .matches(
                REGEX.GENDER_VALID,
                "Gender must be male, female or others"
            ),
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
        gender: Yup.string()
            .required("gender is required")
            .matches(
                REGEX.GENDER_VALID,
                "Gender must be male, female or others"
            ),
        dob: Yup.string().required("Date of birth is required"),
        contact_no: Yup.string()
            .required("Contact number is required")
            .matches(REGEX.PHONE_NO, "Enter a valid mobile number"),
        profile_image: Yup.string().notRequired(),
    }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`)




};

module.exports = { valuator_Schema };
