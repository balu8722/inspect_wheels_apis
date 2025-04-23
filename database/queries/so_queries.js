const { CONSTANTS } = require("../../utils/constants");

module.exports = {
    insert_so: `
        INSERT INTO ${CONSTANTS.DATA_TABLES.SO} (
            name, emp_id, city, email, pincode, state,
            caller_id, area, address, contact_no, profile_image,
            username, password, createdAt,
            updatedAt, status, lastPasswordUpdated, gender, dob
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    update_so: `
        UPDATE ${CONSTANTS.DATA_TABLES.SO}
        SET
            name = ?, city = ?, email = ?, pincode = ?, state = ?,
            caller_id = ?, area = ?, address = ?, contact_no = ?, profile_image = ?,
            username = ?, password = COALESCE(?, password), updatedAt = ?,
            gender = ?, dob = ?, updatedBy = ?
        WHERE id = ?;
    `,

    generateCrossTableExistQuery: (column, tableCount) => {
        const parts = Array.from({ length: tableCount }, () => `SELECT ?? FROM ?? WHERE ?? = ?`);
        return parts.join(" UNION ") + " LIMIT 1";
    }
    
};