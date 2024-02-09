var express = require('express');
var router = express.Router();
var responseManager = require('../../utilities/responseManager');
var helper = require('../../utilities/helper');
var MongoConnection = require('../../utilities/connection');
var Constants = require('../../utilities/constants');
var adminModel = require('../../Models/admin.model');
var customerModel = require('../../Models/customer.model');
let mongoose = require('mongoose');


router.post('/', helper.authenticateToken, async (req, res) => {
    const {page, limit, search} = req.body;
    if(req.token && mongoose.Types.ObjectId.isValid(req.token.id)){
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(req.token.id).lean();
        if(adminData && adminData != null){
            primary.model(Constants.MODELS.customer, customerModel).paginate({
                $or : [
                    {fullname : {'$regex' : new RegExp(search,"i")} }
                ],
                createBy : new mongoose.Types.ObjectId(req.token.id)
            },{
                page,
                limit: parseInt(limit),
                select : "customerId fullname websiteName websiteStatus appStatus ",
                lean : true
            }).then((customerlist) => {
                return responseManager.onSuccess('all customer list....',customerlist, res);
            }).catch((error) => {
                return responseManager.onError(error, res);
            });
        }else{
            return responseManager.badrequest({message : 'Invalid token to get customer list, please try again'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid token to get customer list, please try again'}, res);
    }
});

router.post('/save', helper.authenticateToken, async (req, res) => {
    let { customerId, fullname, companyname, email, phone, country, websitename, password, cpassword } = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        if (fullname && fullname.trim() != '') {
            if (companyname && companyname.trim() != '') {
                if (email && email.trim() != '' && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                    if (phone && phone.trim() != '') {
                        if (country && country.trim() != '') {
                            if (websitename && websitename.trim() != '') {
                                if (password && password.trim() != '') {
                                    if (cpassword && cpassword.trim() != '') {
                                        if (password === cpassword) {
                                            let primary = MongoConnection.useDb(Constants.DEFAULTDB);
                                            let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(req.token.id).lean();
                                            if(adminData && adminData != null){
                                                if(customerId != '' ){
                                                    let checkCustomerExisting = await primary.model(Constants.MODELS.customer, customerModel).findOne({customerId:customerId}).lean();
                                                    if(checkCustomerExisting != null){
                                                        let checkExisting = await primary.model(Constants.MODELS.customer, customerModel).find({
                                                            $or: [
                                                                {email : email},
                                                                {phone : phone},
                                                                {websiteName : websitename}
                                                            ],
                                                            customerId : {$ne : customerId}
                                                        }).lean();
                                                        let checkAdminExisting = await primary.model(Constants.MODELS.admin, adminModel).findOne({
                                                            $or : [
                                                                {Email : email},
                                                                {PhoneNo : phone}
                                                            ]
                                                        }).lean();
                                                        if(checkExisting.length < 1 && checkAdminExisting == null){
                                                            let updateObj = {
                                                                fullname : fullname,
                                                                companyname : companyname,
                                                                email : email,
                                                                phone : phone,
                                                                country : country,
                                                                password : password,
                                                            }
                                                            let updateCustomer = await primary.model(Constants.MODELS.customer, customerModel).findByIdAndUpdate(checkCustomerExisting._id,updateObj,{returnOriginal: false}).lean();
                                                            return responseManager.onSuccess('customer update successfully....',updateCustomer,res);
                                                        }else{
                                                            return responseManager.badrequest({message:'email and phone number already exist, please try again'}, res);
                                                        }
                                                    }else{
                                                        return responseManager.badrequest({message:'Invalid customerId to update customer, please try again'}, res);
                                                    }
                                                }else{
                                                    let checkExisting = await primary.model(Constants.MODELS.customer, customerModel).findOne({
                                                        $or : [
                                                            {email : email},
                                                            {phone : phone},
                                                            {websiteName : websitename}
                                                        ]
                                                    }).lean();
                                                    let checkAdminExisting = await primary.model(Constants.MODELS.admin, adminModel).findOne({
                                                        $or : [
                                                            {Email : email},
                                                            {PhoneNo : phone}
                                                        ]
                                                    }).lean();
                                                    if(checkExisting == null && checkAdminExisting == null){
                                                        password = await helper.PasswordEncryptor(password);
                                                        let countCustomer = parseInt(await primary.model(Constants.MODELS.customer, customerModel).countDocuments({}).lean())
                                                        let Id = 'Sclfy' + parseInt(countCustomer + 1);
                                                        let obj = {
                                                            customerId : Id,
                                                            fullname : fullname,
                                                            companyname : companyname,
                                                            email : email,
                                                            phone : phone,
                                                            country : country,
                                                            websiteName : websitename,
                                                            password : password,
                                                            createBy : new mongoose.Types.ObjectId(req.token.id)
                                                        }
                                                        let newCustomer = await primary.model(Constants.MODELS.customer, customerModel).create(obj);
                                                        return responseManager.onSuccess('customer create successfully...',1,res);
                                                    }else{
                                                        return responseManager.badrequest({ message: 'email and phone already exist, please try again' }, res);
                                                    }
                                                }
                                            }else{
                                                return responseManager.badrequest({ message: 'Invalid token to create customer, please try again' }, res);
                                            }
                                        } else {
                                            return responseManager.badrequest({ message: 'Invalid password to create customer, please try again' }, res);
                                        }
                                    } else {
                                        return responseManager.badrequest({ message: 'Invalid password to create customer, please try again' }, res);
                                    }
                                } else {
                                    return responseManager.badrequest({ message: 'Invalid password to create customer, please try again' }, res);
                                }
                            } else {
                                return responseManager.badrequest({ message: 'Invalid websitename to create customer, please try again' }, res);
                            }
                        } else {
                            return responseManager.badrequest({ message: 'Invalid country to create customer, please try again' }, res);
                        }
                    } else {
                        return responseManager.badrequest({ message: 'Invalid phone to create customer, please try again' }, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid email to create customer, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid companyname to create customer, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid fullname to create customer, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to create customer, please try again' }, res);
    }
});

router.post('/getone' , helper.authenticateToken, async (req, res) => {
    const {customerId} = req.body;
    if(req.token && mongoose.Types.ObjectId.isValid(req.token.id)){
        if(customerId && customerId.trim() != ''){
            let primary = MongoConnection.useDb(Constants.DEFAULTDB);
            let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(req.token.id).lean();
            if(adminData && adminData != null){
                let customerDetails = await primary.model(Constants.MODELS.customer, customerModel).findOne({customerId: customerId}).populate({
                    path : 'createBy',
                    model : primary.model(Constants.MODELS.admin, adminModel),
                    select : "Name Email PhoneNo Role"
                }).select("customerId email phone country websiteName websiteStatus appStatus").lean();
                if(customerDetails && customerDetails != null){
                    return responseManager.onSuccess('customer detais....', customerDetails, res);
                }else{
                    return responseManager.badrequest({message:'Invalid Id to get customer, please try again'}, res);
                }
            }else{
                return responseManager.badrequest({message:'Invalid token to get customer, please try again'}, res);
            }
        }else{
            return responseManager.badrequest({message:'Invalid Id to get customer, please try again'}, res);
        }
    }else{
        return responseManager.badrequest({message:'Invalid token to get customer, please try again'}, res);
    }
});


module.exports = router;