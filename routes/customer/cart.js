let express = require('express');
let router = express.Router();
let MongoConnection = require('../../utilities/connection');
let Constants = require('../../utilities/constants');
let helper = require('../../utilities/helper');
let responseManager = require('../../utilities/responseManager');
let customerModel = require('../../Models/customer.model');
let variantModel = require('../../Models/variant.model');
let productModel = require('../../Models/product.model');
let cartModel = require('../../Models/customer/cart.model');

let mongoose = require('mongoose');
let async = require('async');

router.post('/save', helper.authenticateToken, async (req, res) => {
        let {variantId} = req.body;
    if(req.token && mongoose.Types.ObjectId.isValid(req.token.id)){
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let customerData = await primary.model(Constants.MODELS.customer, customerModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if(customerData && customerData != null){
            if(variantId && mongoose.Types.ObjectId.isValid(variantId)){
                let variantData = await primary.model(Constants.MODELS.variant, variantModel).findById(new mongoose.Types.ObjectId(variantId)).lean();
                if(variantData && variantData != null){
                    let cartData = await primary.model(Constants.MODELS.cart, cartModel).findOne({createBy : new mongoose.Types.ObjectId(customerData._id)}).lean();
                    if(cartData && cartData != null ){
                        let exist = 0;
                        async.forEachSeries(cartData.cartItem, (item, next_item) => {
                            let stringId = item.variantId.toString();
                            if(stringId == variantId){
                                exist = 1;
                            }
                            next_item();
                        });
                        if(exist){
                            return responseManager.badrequest({message : 'this product already exist in cart'}, res);
                        }
                        let obj = {
                            variantId : new mongoose.Types.ObjectId(variantId)
                        }
                        cartData.cartItem.push(obj);
                        await primary.model(Constants.MODELS.cart, cartModel).findByIdAndUpdate(cartData._id, cartData);
                        return responseManager.onSuccess('successfully..',1,res);
                    }else{
                        let obj = {
                            cartItem : [
                                {variantId : new mongoose.Types.ObjectId(variantId)}
                            ],
                            createBy : new mongoose.Types.ObjectId(customerData._id)
                        }
                        await primary.model(Constants.MODELS.cart, cartModel).create(obj);
                        return responseManager.onSuccess('product add to cart successfully...',1,res);
                    }
                }else{
                    return responseManager.badrequest({message : 'Invalid variant to addto cart product..'}, res);
                }
            }else{
                return responseManager.badrequest({message : 'Invalid variantId to addto cart product...'}, res);
            }
        }else{
            return responseManager.unauthorisedRequest(res);
        }
    }else{
        return responseManager.unauthorisedRequest(res);
    }    
});

router.post('/getall', helper.authenticateToken, async (req, res) => {
    let {page, limit} = req.body;
    if(req.token && mongoose.Types.ObjectId.isValid(req.token.id)){
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let customerData = await primary.model(Constants.MODELS.customer, customerModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if(customerData && customerData != null){
            let cartData = await primary.model(Constants.MODELS.cart, cartModel).findOne({createBy : new mongoose.Types.ObjectId(customerData._id)}).lean();
            if(cartData && cartData != null){
                let variantIds = [];
                async.forEachSeries(cartData.cartItem, (item, next_item) => {
                    variantIds.push(item.variantId);
                    next_item();
                });
                primary.model(Constants.MODELS.variant, variantModel).paginate({
                    _id : {$in : variantIds}
                },{
                    page,
                    limit : parseInt(limit),
                    populate : {path : 'productId', model : primary.model(Constants.MODELS.product, productModel), select : "-_id -createBy -createdAtTimestamps -updateAtTimestamps -createdAt -updatedAt -__v"},
                    select : "-categoryId -stock -createBy -createdAt -updatedAt -__v",
                    lean : true
                }).then((data) => {
                    return responseManager.onSuccess('cart product list....', data, res);
                }).catch((error) => {
                    return responseManager.onError(error, res);
                })
            }else{
                return responseManager.badrequest({message : 'cart not exist'}, res);
            }
        }else{
            return responseManager.unauthorisedRequest(res);
        }
    }else{
        return responseManager.unauthorisedRequest(res);
    }
});


module.exports = router;