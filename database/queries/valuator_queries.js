const { CONSTANTS } = require("../../utils/constants");

module.exports = {
    insert_valuator: `
        INSERT INTO ${CONSTANTS.DATA_TABLES.VALUATOR} (
            name, city, email, pincode, state,
            secondary_contact_no, area, address, contact_no, profile_image,
            username, password, gender, dob,createdBy
        ) VALUES (?);
    ` ,
    find_valuator_by: `SELECT id FROM ${CONSTANTS.DATA_TABLES.VALUATOR} WHERE id = ?` ,
    
    update_valuator: `
        UPDATE ${CONSTANTS.DATA_TABLES.VALUATOR}
        SET
            name = ?, city = ?, email = ?, contact_no = ?, pincode = ?, state = ?,
            secondary_contact_no = ?, area = ?, address = ?, profile_image = ?,
            gender = ?, dob = ?, updatedBy = ? WHERE id = ?;
    `, 
    update_so_themselves: `
        UPDATE ${CONSTANTS.DATA_TABLES.VALUATOR}
        SET
            name = ?, city = ?, pincode = ?, state = ?,
            secondary_contact_no = ?, area = ?, address = ?, profile_image = ?,
            gender = ?, dob = ?, updatedBy = ? WHERE id = ?;
    `,  
    get_valuator_list: `SELECT * FROM ${CONSTANTS.DATA_TABLES.VALUATOR}`,

    get_valuator_by_id: `SELECT * FROM ${CONSTANTS.DATA_TABLES.VALUATOR} WHERE id = ?`,

    delete_valuator_by: `DELETE FROM ${CONSTANTS.DATA_TABLES.VALUATOR} WHERE id = ?`,
    
};