module.exports = {
    isExist_solead: 'SELECT * FROM solead WHERE reg_no = ? AND prospect_no = ?',
    insert_solead: `
        INSERT INTO solead (client_name, client_city, vehicle_type, vehicle_category, reg_no,prospect_no, vehicle, customer_name, customer_mobile, extra_km,state, city, area, street, pincode, rc_status, manufacture_year,executive_name, executive_mobile, report_to, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
 
    };
