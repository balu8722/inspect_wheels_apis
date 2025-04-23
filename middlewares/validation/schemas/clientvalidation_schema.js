const Yup = require("yup");
const { CONSTANTS } = require("../../../utils/constants");
const { REGEX } = require("../../../utils/regEx");

const client_Vaidation_Schema = {
  // vehicletype validation schema
    createVehicleTypeValidation: Yup.object().shape({
       name: Yup.string()
        .required("type Name is required"),
        description: Yup.string()
        .notRequired()
    }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`),

    updateVehicleTypeValidation: Yup.object().shape({
        id:Yup.string().required("id is required").matches(REGEX.NUMBERS_ONLY,CONSTANTS.STATUS_MSG.ERROR.NUMBERS_ONLY),
        name: Yup.string()
        .required("type Name is required"),
        description: Yup.string()
        .notRequired()
    }).strict(true).noUnknown((val) => `${val.unknown} - unknown property`)
};

module.exports = { client_Vaidation_Schema };
