var express = require('express');
var router = express.Router();
var responseManager = require('../../utilities/responseManager');
var helper = require('../../utilities/helper');
var MongoConnection = require('../../utilities/connection');
var Constants = require('../../utilities/constants');
var adminModel = require('../../Models/admin.model');
var otpModel = require('../../Models/saveotp.model');

const nodemailer = require('nodemailer');

function generateOTP() {
    let digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

router.post('/forgot', async (req, res) => {
    const {email} = req.body;
    if(email && email.trim() != '' && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let checkExisting = await primary.model(Constants.MODELS.admin, adminModel).findOne({Email : email }).lean();
        if(checkExisting && checkExisting != null){
            let IntOtp = generateOTP();
            let StringOtp = await helper.PasswordEncryptor(IntOtp.toString());
            let saveOtp = await primary.model(Constants.MODELS.otp, otpModel).create({email : email, otp : StringOtp, expireAt : 7200});
            let mailTransporter =  nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass:process.env.PASSWORD
                }
            });

            let mailDetails = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Forgot Password',
                text: `forgot password verification code ${IntOtp} `
            };

            mailTransporter.sendMail(mailDetails, function (err, data) {
                if (err) {
                    console.log('Error Occurs', err);
                } else {
                   return responseManager.onSuccess('Otp send successfully...',1, res);
                }
            });
         

        }else{
            return responseManager.badrequest({message:'Invalid email to forget password'}, res);
        }
    }else{
        return responseManager.badrequest({message:'Invalid email to forget password'}, res);
    }
});

router.post('/verification', async (req, res) => {
    const {email ,otpcode} = req.body;
    if(otpcode.trim() != '' && otpcode.length === 4){
        if(email && email.trim() != '' && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            let primary = MongoConnection.useDb(Constants.DEFAULTDB);
            let checkExisting = await primary.model(Constants.MODELS.otp, otpModel).findOne({email : email}).lean();
            if(checkExisting && checkExisting != null){
                let checkExistingOtp = await helper.PasswordDecryptor(checkExisting.otp);
                if(otpcode === checkExistingOtp){
                    let success = await primary.model(Constants.MODELS.admin, adminModel).findOneAndUpdate({Email : email},{$set :{isVerified : true}});
                    return responseManager.onSuccess('verification successfully...',1, res);
                }else{
                    return responseManager.badrequest({message : 'Invalid otp to verification, please try again'}, res);
                }
            }else{
                return responseManager.badrequest({message : 'Invalid email to verification, please try again'}, res);
            }
        }else{
            return responseManager.badrequest({message : 'Invalid email to verification, please try again'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid otp to verification, please try again'}, res);
    }
});

router.post('/reset', async (req, res) => {
    let {email, password, cpassword} = req.body;
    if(password && password.trim() != ''){
        if(cpassword && cpassword.trim() != ''){
            if(password === cpassword){
                if(email && email.trim() != '' && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
                    let primary = MongoConnection.useDb(Constants.DEFAULTDB);
                    let checkExisting = await primary.model(Constants.MODELS.admin, adminModel).findOne({Email : email}).lean();
                    if(checkExisting && checkExisting != null && checkExisting.isVerified == true){
                        password = await helper.PasswordEncryptor(password);
                        let updatePassword = await primary.model(Constants.MODELS.admin, adminModel).findByIdAndUpdate(checkExisting._id,{Password : password}).lean();
                        let change = await primary.model(Constants.MODELS.admin, adminModel).findOneAndUpdate({Email : checkExisting.Email},{$unset : {isVerified : true}}).lean();
                        return responseManager.onSuccess('password change successfully....',1,res);
                    }else{
                        return responseManager.badrequest({message : 'Invalid verification to reset password, please try again'}, res);
                    }
                }else{
                return responseManager.badrequest({message : 'Invalid email to reset, please try again'}, res);
            }
            }else{
                return responseManager.badrequest({message : 'Invalid password to reset, please try again'}, res);
            }
        }else{
        return responseManager.badrequest({message : 'Invalid password to reset, please try again'}, res);
    }
    }else{
        return responseManager.badrequest({message : 'Invalid password to reset, please try again'}, res);
    }
});
module.exports = router;
