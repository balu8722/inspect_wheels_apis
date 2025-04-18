const REGEX = {
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,64}$/,
    PHONE_NO: /^[0-9]{10}$/,
    PINCODE: /^[0-9]{6}$/,
    NUMBERS_ONLY: /^\d+$/,
    EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
    LETTERS_ONLY: /^[a-zA-Z\s]+$/,
    DOB_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
    GENDER_VALID: /^(male|female|others)$/,
    MARTIAL_VALID: /^(married|single)$/,
    PAYMENT_VALID: /^(success|fail)$/,
}

module.exports = { REGEX }