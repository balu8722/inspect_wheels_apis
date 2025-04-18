const createErrors = require("http-errors")
const nodemailer = require('nodemailer')
const { ENV_DATA } = require("../../config/config")
const { CONSTANTS } = require("../../utils/constants")
const { MAIL_HTML_TEMPLATES } = require("./mail_templates")


class MailService {
    #transporter = null
    #from = ENV_DATA.MAIL_SENDER
    #pass = ENV_DATA.MAIL_PASS
    #mailService = 'gmail'

    constructor() {
        this.#createConnection()
    }

    // create connection
    #createConnection = async () => {
        this.#transporter = nodemailer.createTransport({
            service: this.#mailService,
            auth: {
                user: this.#from,
                pass: this.#pass
            },
            from: this.#from,
            tls: {
                rejectUnauthorized: false,
            }
        })
    }

    // send mail
    sendMail = async (payload) => {

        try {
            const mailoptions = {
                from: ENV_DATA.SENDER_EMAIL,
                ...payload
            }
            const info = await this.#transporter.sendMail(mailoptions)

            return { message: `mail send successfully to ${payload.to}`, isSent: true }
        } catch (error) {
            // console.log("🚀 ~ file: email.controller.js:43 ~ MailService ~ sendMail= ~ error", error.message)
            throw createErrors.InternalServerError('Unable to send mail')
        }
    }
}

const mailService = new MailService()

// generate random otp
const generateRandomNumber = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

// send, store, and verify otp
class OTPHandler {

    #data = new Map()
    // otp will expire in 1 min
    #number_of_Seconds = ENV_DATA.OTP_VALIDATION_TIME * 60 * 1000

    // store number
    storeNumber = async (email_mobile_number, isMobileOTP, email, isForgot, isSignUp) => {
        try {
            // console.log("🚀 ~ OTPHandler ~ #data:", this.#data)

            let data = null
            // generate random 4 digits number and store
            let randomNumber = generateRandomNumber().toString()
            // sometimes randomNumber will get 2 or 3 digit at that time we need to loop,
            while (randomNumber.length < 4) {
                randomNumber = generateRandomNumber()
            }
            // template
            // const smsMessage = SMS_TEMPLATES.OTP_TEMPLATE.replace("{#var#}", randomNumber)
            // send otp to mobile
            if (isMobileOTP) {
                // const resp = await sendSMSToMobile(email_mobile_number, smsMessage)
                // data = resp.message
            } else {
                // this template will take otp and email's to send OTP,
                // return {subject,to,html}
                data = isSignUp ? MAIL_HTML_TEMPLATES.SIGNUP_OTP(randomNumber, email) : (isForgot ? MAIL_HTML_TEMPLATES.OTP(randomNumber, email) : MAIL_HTML_TEMPLATES.LOGIN_OTP(randomNumber, email))
                // pass data to, send mail method, this send mail will take params, {subject,to,html}
                // if success it will return {
                //   message: 'mail send successfully to saiamarendrareddy@gmail.com',
                //   isSent: true
                // }
                const resp = await mailService.sendMail(data)
                data = resp?.message
            }
            // store
            this.#data.set(email_mobile_number, randomNumber)
            // after 2mins , delete the data
            const clear = setTimeout(() => {
                // delete the number
                this.#data.delete(email_mobile_number)

                clearTimeout(clear)

            }, this.#number_of_Seconds)
            // return the random number
            return data
        } catch (error) {
            // console.log("🚀 ~ file: sms-otp.middleware.js:88 ~ OTPHandler ~ storeNumber= ~ error", error)
            error = error?.status ? error : createErrors.InternalServerError('Internal server error, OTP genearate')
            // console.log("=======🚀 ~ file: sms-otp.middleware.js:68 ~ OTPHandler ~ storeNumber= ~ error", error)
            throw (error)
        }
    }

    /* used to send url to user */
    sendEmail = async (url, linkExpiry, to_emai) => {
        try {
            /* rest password template */
            let email_payload = MAIL_HTML_TEMPLATES.FORGOT_PASSWORD_ADMIN(url, linkExpiry, to_emai)
            /* send email */
            await mailService.sendMail(email_payload)
            /* send message */
            return "rest password link send successfully"
        } catch (error) {
            error = error?.status ? error : createErrors.InternalServerError('Internal server error, unable to send email')
            throw error
        }
    }

    // check wether otp exist or not
    checkOTP = (email_mobile_number, otp) => {
        // check wether number exist or not
        const isExist = this.#data.has(email_mobile_number)
        // if exist 
        if (isExist) {
            // check otp in data, wether otp match or not
            const storedOTP = this.#data.get(email_mobile_number)
            const isOTPMatch = otp == storedOTP

            return isOTPMatch
        }
        // if not exist, send otp expired
        else {
            throw createErrors.Forbidden(CONSTANTS.STATUS_MSG.ERROR.OTP_EXPIRED)
        }
    }
}

const OtpHandler = new OTPHandler()

module.exports = { mailService, OtpHandler, MAIL_HTML_TEMPLATES }