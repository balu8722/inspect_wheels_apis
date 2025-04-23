const { CONSTANTS } = require("../../utils/constants");

module.exports = {
    insert_so: `
        INSERT INTO ${CONSTANTS.DATA_TABLES.SO} (
            name, city, email, pincode, state,
            secondary_contact_no, area, address, contact_no, profile_image,
            username, password, gender, dob,createdBy
        ) VALUES (?);
    `,
    update_so: `
        UPDATE ${CONSTANTS.DATA_TABLES.SO}
        SET
            name = ?, city = ?, email = ?, pincode = ?, state = ?,
            secondary_contact_no = ?, area = ?, address = ?, contact_no = ?, profile_image = ?, updatedAt = ?,
            gender = ?, dob = ?, updatedBy = ?
        WHERE id = ?;
    `,

    
    
};