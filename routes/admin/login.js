var express = require('express');
var router = express.Router();
var responseManager = require('../../utilities/responseManager');
var helper = require('../../utilities/helper');
var MongoConnection = require('../../utilities/connection');
var Constants = require('../../utilities/constants');
var adminModel = require('../../Models/admin.model');
var jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    if (email && email.trim() != '' && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        if (password && password.trim() != '') {
            let primary = MongoConnection.useDb(Constants.DEFAULTDB);
            let checkExisting = await primary.model(Constants.MODELS.admin, adminModel).findOne({ Email: email }).lean();
            if (checkExisting != null) {
                let decryptPass = await helper.PasswordDecryptor(checkExisting.Password);
                if (decryptPass == password) {
                    let Token = jwt.sign({
                        id: checkExisting._id,
                        Name: checkExisting.Name,
                        Email: checkExisting.Email
                    }, process.env.JWT_SECRET);
                    checkExisting.Token = Token;
                    return responseManager.onSuccess('admin login successfully...', checkExisting, res);
                } else {
                    responseManager.badrequest({ message: "invalid password, please try again" }, res);
                }
            } else {
                responseManager.badrequest({ message: "admin not exist, please try again" }, res);
            }
        } else {
            responseManager.badrequest({ message: "invalid password to login admin, please try again" }, res);
        }
    } else {
        responseManager.badrequest({ message: "invalid email to login admin, please try again with new email" }, res);
    }
});

module.exports = router;