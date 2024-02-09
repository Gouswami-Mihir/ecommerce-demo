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
let async = require('async');


router.post('/', helper.authenticateToken, async (req, res) => {
    var {page, limit, search, categoryId} = req.body;
    let query = {};
    let lowercaseSearch = search.toLowerCase();
    if(req.token && mongoose.Types.ObjectId.isValid(req.token.id)){
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if(adminData && adminData != null){
            if(categoryId && categoryId.trim() != '' && mongoose.Types.ObjectId.isValid(categoryId)){
                query.categoryId = new mongoose.Types.ObjectId(categoryId);
            }
            let productData = await primary.model(Constants.MODELS.variant, variantModel).find({...query}).populate(
                {path : 'productId', model : primary.model(Constants.MODELS.product, productModel), select : "productName"}
            ).select("-_id -categoryId -productId -createBy -createdAt -updatedAt -__v").lean();
                let searchProduct = [];
                if(search && search.trim() != ''){  
                    async.forEachSeries(productData, (first, next) => {
                        if((first.variantname != null && first.variantname.trim() != '' && first.variantname.toLowerCase().includes(lowercaseSearch) )|| (first.productId.productName && first.productId.productName.trim() != '' && first.productId.productName.toLowerCase().includes(lowercaseSearch))){
                            searchProduct.push(first);
                        }
                        next();
                    },() => {
                        let obj = {
                            searchProduct: searchProduct.slice((page - 1) * limit,page * limit),
                            totalDocs: parseInt(searchProduct.length),  
                            limit: parseInt(limit),
                            totalPages: parseInt(parseInt(searchProduct.length) / limit),
                            page: parseInt(page),
                            pagingCounter: parseInt(page),
                            hasPrevPage: (page > 1) ? true : false,
                            hasNextPage: (page < parseInt(parseInt(searchProduct.length) / limit)) ? true : false,
                            prevPage: (page > 1) ? (page - 1) : null,
                            nextPage: (page < parseInt(parseInt(searchProduct.length) / limit)) ? (page + 1) : null
                        };
                        return responseManager.onSuccess('All items...!', obj, res);
                    });
                }else{
                    let obj = {
                        docs: productData.slice((page - 1)  * limit,page * limit),
                        totalDocs: parseInt(productData.length),
                        limit: parseInt(limit),
                        totalPages: parseInt(parseInt(productData.length) / limit),
                        page: parseInt(page),
                        pagingCounter: parseInt(page),
                        hasPrevPage: (page > 1) ? true : false,
                        hasNextPage: (page < parseInt(parseInt(productData.length) / limit)) ? true : false,
                        prevPage: (page > 1) ? (page - 1) : null,
                        nextPage: (page < parseInt(parseInt(productData.length) / limit)) ? (page + 1) : null
                    };
                    return responseManager.onSuccess('All items...!', obj, res);
                }
        }else{
            return responseManager.badrequest({message : 'Invalid token to get product..'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid token to get product..'}, res);
    }
});

router.post('/save', helper.authenticateToken, async (req, res) => {
    let { variantId, categoryId, productId, variantname, specification, price, discountper, stock } = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if (adminData && adminData != null) {
            if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
                let categoryData = await primary.model(Constants.MODELS.category, categoryModel).findById(new mongoose.Types.ObjectId(categoryId)).lean();
                if (categoryData && categoryData != null) {
                    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
                        let productData = await primary.model(Constants.MODELS.product, productModel).findById(new mongoose.Types.ObjectId(productId)).lean();
                        if (productData && productData != null) {
                            if (variantname && variantname.trim() != '') {
                                if (specification && specification.trim() != '') {
                                    if (price && price.trim() != '') {
                                        if (discountper && discountper.trim() != '') {
                                            if (stock && stock.trim() != '') {
                                                if (variantId == '') {
                                                    let discountedPrice = parseFloat(parseFloat(parseFloat(price) * parseFloat(discountper)) / parseFloat(100));
                                                    let totalPrice = parseFloat(parseFloat(price) - parseFloat(discountedPrice));
                                                    let variantObj = {
                                                        variantname: variantname,
                                                        categoryId: new mongoose.Types.ObjectId(categoryId),
                                                        productId: new mongoose.Types.ObjectId(productId),
                                                        specification: specification,
                                                        price: price,
                                                        discountper: discountper,
                                                        totalDiscount: discountedPrice,
                                                        grossAmount: totalPrice,
                                                        stock: stock,
                                                        createBy: new mongoose.Types.ObjectId(req.token.id)
                                                    }
                                                    let addVariant = await primary.model(Constants.MODELS.variant, variantModel).create(variantObj);
                                                    return responseManager.onSuccess('variant add successfully..', 1, res);
                                                } else {
                                                    if (variantId && mongoose.Types.ObjectId.isValid(variantId)) {
                                                        let variantData = await primary.model(Constants.MODELS.variant, variantModel).findById(new mongoose.Types.ObjectId(variantId)).lean();
                                                        if (variantData && variantData != null) {
                                                            let updatediscountedPrice = parseFloat(parseFloat(parseFloat(price) * parseFloat(discountper)) / parseFloat(100));
                                                            let updatetotalPrice = parseFloat(parseFloat(price) - parseFloat(updatediscountedPrice));
                                                            let updatevariantObj = {
                                                                variantname: variantname,
                                                                categoryId: new mongoose.Types.ObjectId(categoryId),
                                                                productId: new mongoose.Types.ObjectId(productId),
                                                                specification: specification,
                                                                price: price,
                                                                discountper: discountper,
                                                                totalDiscount: updatediscountedPrice,
                                                                grossAmount: updatetotalPrice,
                                                                stock: stock,
                                                                createBy: new mongoose.Types.ObjectId(req.token.id)
                                                            }
                                                            let updateVariant = await primary.model(Constants.MODELS.variant, variantModel).findByIdAndUpdate(variantId, updatevariantObj, { returnOriginal: false }).lean();
                                                            return responseManager.onSuccess('variant update successfully...', updateVariant, res);
                                                        } else {
                                                            return responseManager.badrequest({ message: 'Invalid variantId to update variant, please try again..' }, res);
                                                        }
                                                    } else {
                                                        return responseManager.badrequest({ message: 'Invalid variantId to update variant, please try again..' }, res);
                                                    }
                                                }
                                            } else {
                                                return responseManager.badrequest({ messaeg: 'Invalid stock to add variant, please try again' }, res);
                                            }
                                        } else {
                                            return responseManager.badrequest({ messaeg: 'Invalid discountper to add variant, please try again' }, res);
                                        }
                                    } else {
                                        return responseManager.badrequest({ messaeg: 'Invalid price to add variant, please try again' }, res);
                                    }
                                } else {
                                    return responseManager.badrequest({ messaeg: 'Invalid specification to add variant, please try again' }, res);
                                }
                            } else {
                                return responseManager.badrequest({ messaeg: 'Invalid variantname to add variant, please try again' }, res);
                            }
                        } else {
                            return responseManager.badrequest({ message: 'Invalid productId to add variant, please try again' }, res);
                        }
                    } else {
                        return responseManager.badrequest({ message: 'Invalid productId to add variant, please try again' }, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invaild  categoryId to add variant, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invaild  categoryId to add variant, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to add variant..!' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to add variant..!' }, res);
    }
});

router.post('/delete', helper.authenticateToken, async (req, res) => {
    let { variantId } = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if (adminData && adminData != null) {
            if (variantId && variantId.trim() != '' && mongoose.Types.ObjectId.isValid(variantId)) {
                let variantData = await primary.model(Constants.MODELS.variant, variantModel).findById(new mongoose.Types.ObjectId(variantId)).lean();
                if (variantData && variantData != null) {
                    primary.model(Constants.MODELS.variant, variantModel).findByIdAndDelete(new mongoose.Types.ObjectId(variantId)).then(() => {
                        return responseManager.onSuccess('variant delete successfully...', 1, res);
                    }).catch((error) => {
                        return responseManager.onError(error, res);
                    });
                } else {
                    return responseManager.badrequest({ message: 'Invalid variantId to delete variant...' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid variantId to delete variant...' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to delete variant, please try again..' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to delete variant, please try again' }, res);
    }
});

router.post('/getone', helper.authenticateToken, async (req, res) => {
    let { variantId } = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let adminData = await primary.model(Constants.MODELS.admin, adminModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if (adminData && adminData != null) {
            if (variantId && mongoose.Types.ObjectId.isValid(variantId)) {
                let variantData = await primary.model(Constants.MODELS.variant, variantModel).findById(new mongoose.Types.ObjectId(variantId)).populate([
                    { path: 'categoryId', model: primary.model(Constants.MODELS.category, categoryModel), select: "-_id -createBy -createdAt -updatedAt -__v" },
                    { path: 'productId', model: primary.model(Constants.MODELS.product, productModel), select: "-_id -createBy -createdAtTimestamps -updateAtTimestamps -createdAt -updatedAt -__v" }
                ]).select("-_id -createBy -createdAt -updatedAt -__v").lean();
                if (variantData && variantData != null) {
                    return responseManager.onSuccess('variant data...', variantData, res);
                } else {
                    return responseManager.badrequest({ message: 'Invalid variantId to get variant, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid variantId to get variant, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid token to get variant, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get variant,please try again' }, res);
    }
});

module.exports = router;