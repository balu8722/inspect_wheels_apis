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
            name = ?, city = ?, email = ?, contact_no = ?, pincode = ?, state = ?,
            secondary_contact_no = ?, area = ?, address = ?, profile_image = ?,
            gender = ?, dob = ?, updatedBy = ? WHERE id = ?;
    `,  
    update_so_themselves: `
        UPDATE ${CONSTANTS.DATA_TABLES.SO}
        SET
            name = ?, city = ?, pincode = ?, state = ?,
            secondary_contact_no = ?, area = ?, address = ?, profile_image = ?,
            gender = ?, dob = ?, updatedBy = ? WHERE id = ?;
    `,  

    get_so_list : `SELECT * FROM ${CONSTANTS.DATA_TABLES.SO}
    `,
    get_so_by_id: `SELECT * FROM ${CONSTANTS.DATA_TABLES.SO} WHERE id = ?`,

    delete_so_by: `DELETE FROM ${CONSTANTS.DATA_TABLES.SO} WHERE id = ?`,

    find_so_by: `SELECT id FROM ${CONSTANTS.DATA_TABLES.SO} WHERE id = ?`,

     isSoExistsQuery: `SELECT * FROM ${CONSTANTS.DATA_TABLES.SO} WHERE id=? AND status=1`,

    // get Valuator list
    soListQuery: (id) => `SELECT * FROM ${CONSTANTS.DATA_TABLES.SO} ${id ? ` WHERE id=?` : ` ORDER BY createdAt DESC
  LIMIT ? OFFSET ?`}`,

    totalCountQuery: (tablename) => `SELECT COUNT(*) AS total FROM ${tablename}`
    
};