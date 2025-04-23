const Yup = require("yup");
const { CONSTANTS } = require("../../../utils/constants");
const { REGEX } = require("../../../utils/regEx");


const so_Schema = {
 
     // create so lead schema
    createso_schema: Yup.object({
        name: Yup.string().required("Name is required"),
        city: Yup.string().required("City is required"),
        email: Yup.string().email("Enter valid email").required("Email is Required")
                  .matches(REGEX.EMAIL, "Please enter valid email address"),
        pincode: Yup.string().required("Pincode is required"),
        state: Yup.string().required("State is required"),
        caller_id: Yup.string().required("secondary number is required"),
        area: Yup.string().required("Area is required"),
        address: Yup.string().required("Area is required"),
        contact_no: Yup.string()
            .required("Contact number is required")
            .matches(/^[6-9]\d{9}$/, "Enter a valid mobile number"),
          profile_image: Yup.string().notRequired(),
          username: Yup.string()
            .required("Username is required")
            .matches(REGEX.USERNAME, "Please enter valid username"),
        password: Yup.string()
            .required("Password is required")
            .matches(REGEX.PASSWORD, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
        confirm_password: Yup.string()
            .required("Confirm password is required")
            .oneOf([Yup.ref("password"), null], "Passwords must match"),
    })
        

};

module.exports = { so_Schema };
