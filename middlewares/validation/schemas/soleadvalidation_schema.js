const Yup = require("yup");
const { CONSTANTS } = require("../../../utils/constants");
const { REGEX } = require("../../../utils/regEx");

const solead_Schema = {
 
     // create so lead schema
    createsolead_schema: Yup.object({
        client_name: Yup.string().required("Client name is required"),
        client_city: Yup.string().required("Client city is required"),
        vehicle_type: Yup.string().required("Vehicle type is required"),
        vehicle_category: Yup.string().required("Vehicle category is required"),
        reg_no: Yup.string().required("Registration number is required"),
        prospect_no: Yup.string().required("Prospect number is required"),
        vehicle: Yup.string().required("Vehicle is required"),
        customer_name: Yup.string().required("Customer name is required"),
        customer_mobile: Yup.string()
            .required("Customer mobile is required")
            .matches(/^[6-9]\d{9}$/, "Enter a valid mobile number"),
        extra_km: Yup.number()
            .typeError("Extra KM must be a number")
            .required("Extra KM is required"),
        state: Yup.string().required("State is required"),
        city: Yup.string().required("City is required"),
        area: Yup.string().required("Area is required"),
        street: Yup.string().required("Street is required"),
        pincode: Yup.string()
            .required("Pincode is required")
            .matches(/^\d{6}$/, "Enter a valid 6-digit pincode"),
        rc_status: Yup.string().required("RC status is required"),
        manufacture_year: Yup.number()
            .typeError("Manufacture year must be a number")
            .required("Manufacture year is required"),
        executive_name: Yup.string().required("Executive name is required"),
        executive_mobile: Yup.string()
            .required("Executive mobile is required")
            .matches(/^[6-9]\d{9}$/, "Enter a valid mobile number"),
        report_to: Yup.string().required("Report to is required"),
    })
        

};

module.exports = { solead_Schema };
