var express = require('express');
var router = express.Router();
var responseManager = require('../../utilities/responseManager');
var helper = require('../../utilities/helper');
var MongoConnection = require('../../utilities/connection');
var Constants = require('../../utilities/constants');
var adminModel = require('../../Models/admin.model');
let categoryModel = require('../../Models/category.model');
let mongoose = require('mongoose');

router.post('/save', helper.authenticateToken, async (req, res) => {
    let { categoryId, categoryName } = req.body;
    if (categoryName && categoryName.trim() != '') {
        if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
            let primary = MongoConnection.useDb(Constants.DEFAULTDB);
            let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
            if (adminData && adminData != null) {
                if (categoryId == '') {
                    let checkCategoryExisting = await primary.model(Constants.MODELS.category, categoryModel).findOne({ categoryName: categoryName }).lean();
                    if (checkCategoryExisting == null) {
                        let obj = {
                            categoryName: categoryName,
                            createBy: new mongoose.Types.ObjectId(req.token.id)
                        }
                        let addCategory = await primary.model(Constants.MODELS.category, categoryModel).create(obj);
                        return responseManager.onSuccess('category add successfully....', 1, res);
                    } else {
                        return responseManager.badrequest({ message: 'category already exist, please try again' }, res);
                    }
                } else {
                    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
                        let categoryData = await primary.model(Constants.MODELS.category, categoryModel).findById(new mongoose.Types.ObjectId(categoryId)).lean();
                        if (categoryData && categoryData != null) {
                            if (categoryData.categoryName == categoryName) {
                                let obj = {
                                    categoryName: categoryName,
                                    createBy: new mongoose.Types.ObjectId(req.token.id)
                                }
                                let updateCategory = await primary.model(Constants.MODELS.category, categoryModel).create(obj);
                                return responseManager.onSuccess('update category successfully...', 1, res);
                            } else {
                                let categoryExisting = await primary.model(Constants.MODELS.category, categoryModel).findOne({ categoryName: categoryName }).lean();
                                if (categoryExisting && categoryExisting != null) {
                                    return responseManager.badrequest({ message: 'category already existing, please try again...' }, res);
                                } else {
                                    let obj = {
                                        categoryName: categoryName,
                                        createBy: new mongoose.Types.ObjectId(req.token.id)
                                    }
                                    let updateCategory = await primary.model(Constants.MODELS.category, categoryModel).findByIdAndUpdate(categoryId, obj, { returnOriginal: false }).lean();
                                    return responseManager.onSuccess('category update successfully...', updateCategory, res);
                                }
                            }
                        } else {
                            return responseManager.badrequest({ message: 'Invalid categoryId to update category...!' }, res);
                        }
                    } else {
                        return responseManager.badrequest({ message: 'Invalid categoryId to update category...!' }, res);
                    }
                }
            } else {
                return responseManager.badrequest({ message: 'invalid token to add or update category, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'invalid token to add or update category, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid categoryName to add or update category, please try again..!' }, res);
    }
});

module.exports = router;