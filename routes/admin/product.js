var express = require('express');
var router = express.Router();
var responseManager = require('../../utilities/responseManager');
var helper = require('../../utilities/helper');
var MongoConnection = require('../../utilities/connection');
var Constants = require('../../utilities/constants');
var adminModel = require('../../Models/admin.model');
let categoryModel = require('../../Models/category.model');
let productModel = require('../../Models/product.model');
let variantModel = require('../../Models/variant.model');
let mongoose = require('mongoose');


router.post('/delete', helper.authenticateToken, async (req, res) => {
    let {productId} = req.body;
    if(req.token && mongoose.Types.ObjectId.isValid(req.token.id)){
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if(adminData && adminData != null){
            if(productId && productId.trim() != '' && mongoose.Types.ObjectId.isValid(productId)){
                let productData = await primary.model(Constants.MODELS.product, productModel).findById(productId).lean();
                if(productData && productData != null){
                    primary.model(Constants.MODELS.product, productModel).findByIdAndDelete(new mongoose.Types.ObjectId(productId)).then((data) => {
                        return responseManager.onSuccess('product delete successfully..',1,res);
                    }).catch((error) => {
                        return responseManager.onError(error,res);
                    });
                }else{
                    return responseManager.badrequest({message : 'Invalid productId to delete product, please try again'}, res);
                }
            }else{
                return responseManager.badrequest({message : 'Invalid productId to delete product, please try again'}, res);
            }
        }else{
            return responseManager.badrequest({message : 'Invalid token to delete product..'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid token to delete product..'}, res);
    }
});

router.post('/save', helper.authenticateToken, async (req, res) => {
    let {productId, productname, description} = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if (adminData && adminData != null) {
            if (productname && productname.trim() != '') {
                if (description && description.trim() != '') {
                    let checkProductExisting = await primary.model(Constants.MODELS.product, productModel).findOne({productName :productname}).lean();
                    if(productId == ''){
                        if(checkProductExisting == null){
                            let obj = {
                                productName : productname,
                                description : description,
                                createBy : new mongoose.Types.ObjectId(req.token.id),
                                createdAtTimestamps : Date.now(),
                                updateAtTimestamps : Date.now()
                            }
                            let createProduct = await primary.model(Constants.MODELS.product, productModel).create(obj);
                            return responseManager.onSuccess('product add successfully...',1,res);
                        }else{
                            return responseManager.badrequest({message : 'product already exist, please try again..'}, res);
                        }
                    }else{
                        if(productId && mongoose.Types.ObjectId.isValid(productId)){
                            let productData = await primary.model(Constants.MODELS.product, productModel).findById(new mongoose.Types.ObjectId(productId)).lean();
                            if(productData && productData != null){
                                if(productData.productName != productname){
                                    if(checkProductExisting == null){
                                        let updateData = {
                                            productName : productname,
                                            description : description,
                                            createBy : new mongoose.Types.ObjectId(req.token.id),
                                            updateAtTimestamps : Date.now()
                                        }
                                        let updateProduct = await primary.model(Constants.MODELS.product, productModel).findByIdAndUpdate(productData._id,updateData,{returnOriginal : false}).lean();
                                        return responseManager.onSuccess('product update successfully...',1,res);
                                    }else{
                                        return responseManager.badrequest({message : 'product already exist, please try again..'}, res);
                                    }
                                }else{
                                    let updateData = {
                                        productName : productname,
                                        description : description,
                                        createBy : new mongoose.Types.ObjectId(req.token.id),
                                        updateAtTimestamps : Date.now()
                                    }
                                    let updateProduct = await primary.model(Constants.MODELS.product, productModel).findByIdAndUpdate(productData._id,updateData,{returnOriginal : false}).lean();
                                    return responseManager.onSuccess('product update successfully...',1,res);
                                }
                            }else{
                                return responseManager.badrequest({message : 'Invalid productId to update product, plase try again'}, res);
                            }
                        }else{
                            return responseManager.badrequest({message : 'Invalid productId to update product, please try again'}, res);
                        }
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid description to add product, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid productname to add product, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid admin to add product, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to add product, please try again' }, res);
    }

});

module.exports = router;
