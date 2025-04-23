const { returnError } = require("../../utils/common");
const { client_Vaidation_Schema } = require("./schemas/clientvalidation_schema");

const client_validation = {
  // vehicle type validtaion
  createVehicleTypeValidation: async (req, res, next) => {
    try {
      await client_Vaidation_Schema.createVehicleTypeValidation.validate(req.body)
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  updateVehicleTypeValidation: async (req, res, next) => {
    try {
      await client_Vaidation_Schema.updateVehicleTypeValidation.validate({...req.body,...req.params})
      // if the schema values are correct
      next()
    } catch (err) {
      returnError(res, err)
    }
  },
  
};
module.exports = { client_validation };
