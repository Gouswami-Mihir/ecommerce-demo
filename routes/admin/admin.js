var express = require('express');
var router = express.Router();
var responseManager = require('../../utilities/responseManager');
var helper = require('../../utilities/helper');
var MongoConnection = require('../../utilities/connection');
var Constants = require('../../utilities/constants');
var adminModel = require('../../Models/admin.model');
let mongoose = require('mongoose');


router.post('/', helper.authenticateToken, async (req, res) => {
    const { page, limit, search } = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(req.token.id).lean();
        if (adminData != null) {
            let adminList = await primary.model(Constants.MODELS.admin, adminModel).paginate({
                $or: [
                    { Name: { '$regex': new RegExp(search, "i") } },
                    { Email: { '$regex': new RegExp(search, "i") } }
                ],
                createBy: new mongoose.Types.ObjectId(adminData._id)
            }, {
                page,
                limit: parseInt(limit),
                select: "-Password -createdAt -updatedAt -__v",
                lean: true
            });
            return responseManager.onSuccess('admin list....', adminList, res);
        } else {
            responseManager.badrequest({ message: "invalid token to get all admin, please try again" }, res);
        }
    } else {
        responseManager.badrequest({ message: "invalid token to get all admin, please try again" }, res);
    }
});

router.post('/save', helper.authenticateToken, async (req, res) => {
    let { adminId, name, email, phone, role, password, cpassword } = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        if (name && name.trim() != '') {
            if (email && email.trim() != '' && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                if (phone && phone.trim() != '' && phone.length <= 13) {
                    if (role && role.trim() != '') {
                        if (password.trim() != '') {
                            if (cpassword.trim() != '') {
                                if (password === cpassword) {
                                    let primary = MongoConnection.useDb(Constants.DEFAULTDB);
                                    let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(req.token.id).lean();
                                    if (adminData && adminData != null && adminData.Role == 'Admin') {
                                        if (adminId == '') {
                                            let checkExisting = await primary.model(Constants.MODELS.admin, adminModel).findOne({
                                                $or: [
                                                    { Email: email },
                                                    { PhoneNo: phone }
                                                ]
                                            }).lean();
                                            if (checkExisting == null) {
                                                password = await helper.PasswordEncryptor(password);
                                                let obj = {
                                                    Name: name,
                                                    Email: email,
                                                    PhoneNo: phone,
                                                    Role: role,
                                                    Password: password,
                                                    createBy: new mongoose.Types.ObjectId(adminData._id)
                                                }
                                                let newAdmin = await primary.model(Constants.MODELS.admin, adminModel).create(obj);
                                                return responseManager.onSuccess('admin create successfully', 1, res);
                                            } else {
                                                return responseManager.badrequest({ message: 'admin already exist, please try again' }, res);
                                            }
                                        } else {
                                            if (adminId != '' && mongoose.Types.ObjectId.isValid(adminId)) {
                                                let admindata = await primary.model(Constants.MODELS.admin, adminModel).findById(new mongoose.Types.ObjectId(adminId)).lean();
                                                password = await helper.PasswordEncryptor(password);
                                                if (adminData.Email == email && adminData.PhoneNo == phone) {
                                                    let updateObj = {
                                                        Name: name,
                                                        Email: email,
                                                        PhoneNo: phone,
                                                        Role: role,
                                                        Password: password
                                                    }
                                                    let updateAdminData = await primary.model(Constants.MODELS.admin, adminModel).findByIdAndUpdate(admindata._id, updateObj, { returnOriginal: false }).lean();
                                                    return responseManager.onSuccess('adminData update successfully', updateAdminData, res);

                                                } else if (adminData.Email != email && adminData.PhoneNo != phone) {
                                                    let checkExisting = await primary.model(Constants.MODELS.admin, adminModel).find({
                                                        $or: [
                                                            { Email: email },
                                                            { PhoneNo: phone }
                                                        ]
                                                    }).lean();
                                                    if (checkExisting == null) {
                                                        let updateObj = {
                                                            Name: name,
                                                            Email: email,
                                                            PhoneNo: phone,
                                                            Role: role,
                                                            Password: password
                                                        }
                                                        let updateAdminData = await primary.model(Constants.MODELS.admin, adminModel).findByIdAndUpdate(admindata._id, updateObj, { returnOriginal: false }).lean();
                                                        return responseManager.onSuccess('adminData update successfully', updateAdminData, res);
                                                    } else {
                                                        return responseManager.badrequest({ message: 'admin already exist , please try again' }, res);
                                                    }
                                                }

                                            } else {
                                                return responseManager.badrequest({ message: 'Invalid adminId to update admindata, please try again' }, res);
                                            }
                                        }
                                    } else {
                                        return responseManager.badrequest({ message: 'Invalid admin to create admin, please try again' }, res);
                                    }
                                } else {
                                    return responseManager.badrequest({ message: 'Invalid password to create admin, please try again' }, res);
                                }
                            } else {
                                return responseManager.badrequest({ message: 'Invalid password to create admin, please try again' }, res);
                            }
                        } else {
                            return responseManager.badrequest({ message: 'Invalid password to create admin, please try again' }, res);
                        }
                    } else {
                        return responseManager.badrequest({ message: 'Invalid role to create admin, please try again' }, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid phone number to create admin, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid email to create admin, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid name to create admin, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to create admin, please try again' }, res);
    }
});

router.post('/getone', helper.authenticateToken, async (req, res) => {
    const { adminId } = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(req.token.id).lean();
        if (adminData && adminData != null) {
            if (adminId && adminId.trim() != '') {
                if (mongoose.Types.ObjectId.isValid(adminId)) {
                    let adminDetails = await primary.model(Constants.MODELS.admin, adminModel).findById(new mongoose.Types.ObjectId(adminId)).select("-Password -createBy -createdAt -updatedAt -__v -_id").lean();
                    if (adminDetails && adminDetails != null) {
                        return responseManager.onSuccess('admin details...', adminDetails, res);
                    } else {
                        return responseManager.badrequest({ message: 'Invalid Id to get admin, please try again' }, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid Id to get admin, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid Id to get admin, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to get admin, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get admin, please try again' }, res);
    }
});
module.exports = router;