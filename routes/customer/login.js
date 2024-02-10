var express = require('express');
var router = express.Router();
let MongoConnection = require('../../utilities/connection');
let Constants = require('../../utilities/constants');
let helper = require('../../utilities/helper');
let responseManager = require('../../utilities/responseManager');
let reviewModel = require('../../Models/customer/review.model');
let custmerModel = require('../../Models/customer.model');
let jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    let {email, password} = req.body;
    if(email && email.trim() != '' && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        if(password && password.trim() != ''){
            let primary = MongoConnection.useDb(Constants.DEFAULTDB);
            let customerData  = await primary.model(Constants.MODELS.customer, custmerModel).findOne({email : email}).lean();
        if(customerData && customerData != null){
            let decryptPassword = await helper.PasswordDecryptor(customerData.password);
            if(decryptPassword == password){
          let token = jwt.sign({id : customerData._id}, process.env.JWT_SECRET);
          return responseManager.onSuccess('customer login successfully...',token,res);
            }else{
                return responseManager.badrequest({message : 'Invalid password to login user, please try again'}, res);
            }
        }else{
            return responseManager.badrequest({message : 'Invalid details to login user, please try again'}, res);
        }
        }else{
            return responseManager.badrequest({message : 'Invalid password to login user, please try again'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid email to login user, please try again'}, res);

    }
});




module.exports = router;