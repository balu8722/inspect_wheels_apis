const { returnError } = require("../../utils/common");
const { auth_Schema } = require("./schemas/authvalidation_schema");
const { valuator_Schema } = require("./schemas/valuatorvalidation_schema");


const valuator_validation = {
    // create roles validation
    create_valuator_Validation: async (req, res, next) => {
        try {
            let data = { ...req.body }
            await valuator_Schema.create_valuator_schema.validate(data)
            next()
        } catch (err) {
            returnError(res, err)
        }
    },

    // UPDATE VALUATOR
    update_valuator_Validation: async (req, res, next) => {
        try {
            let data = { ...req.body }
            await valuator_Schema.update_caluator_schema.validate(data)
            next()
        } catch (err) {
            returnError(res, err)
        }
    },


};
module.exports = { valuator_validation };
