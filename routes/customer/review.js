var express = require('express');
var router = express.Router();
let MongoConnection = require('../../utilities/connection');
let Constants = require('../../utilities/constants');
let helper = require('../../utilities/helper');
let responseManager = require('../../utilities/responseManager');
let reviewModel = require('../../Models/customer/review.model');
let custmerModel = require('../../Models/customer.model');
let productModel = require('../../Models/product.model');
let mongoose = require('mongoose');
let async = require('async');

router.post('/save', helper.authenticateToken, async (req, res) => {
    let {reviewId, productId, rating, review} = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let customerData = await primary.model(Constants.MODELS.customer, custmerModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if (customerData && customerData != null) {
            if (productId && mongoose.Types.ObjectId.isValid(productId)) {
                if (rating && rating.trim() != '' && rating >= 0 && rating <= 5) {
                    if (review && review.trim() != '' && review.length <= 300) {
                        if(reviewId == ''){
                            let reviewObj = {
                                productId: new mongoose.Types.ObjectId(productId),
                                rating: rating,
                                review: review,
                                createBy: new mongoose.Types.ObjectId(req.token.id),
                                createdAtTimestamp: Date.now()
                            }
                            await primary.model(Constants.MODELS.review, reviewModel).create(reviewObj);
                            return responseManager.onSuccess('review add successfully...', 1, res);
                        }else{
                            if(reviewId && mongoose.Types.ObjectId.isValid(reviewId)){
                                let reviewData = await primary.model(Constants.MODELS.review, reviewModel).findById(new mongoose.Types.ObjectId(reviewId)).lean();
                                if(reviewData && reviewData != null){
                                    let updateObj = {
                                             productId: new mongoose.Types.ObjectId(productId),
                                             rating: rating,
                                             review: review,
                                             createBy: new mongoose.Types.ObjectId(req.token.id)
                                         }
                                         await primary.model(Constants.MODELS.review, reviewModel).findByIdAndUpdate(reviewId, updateObj, { returnOriginal: false }).lean();
                                         return responseManager.onSuccess('review update successfully..', 1, res);
                                }else{
                                    return responseManager.badrequest({message : 'Invalid review id to update review'}, res);
                                }
                            }else{
                                return responseManager.badrequest({message : 'Invalid review id to update review'}, res);
                            }
                        }
                    } else {
                        return responseManager.badrequest({ message: 'Invalid review to save review' }, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid rating to save review' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid product for save review' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid customer to save review' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid custome to save review' }, res);
    }
});

router.post('/delete', helper.authenticateToken, async (req, res) => {
    let {reviewId} = req.body;
    if(req.token && mongoose.Types.ObjectId.isValid(req.token.id)){
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let customerData = await primary.model(Constants.MODELS.customer, custmerModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if(customerData && customerData != null){
            if(reviewId && mongoose.Types.ObjectId.isValid(reviewId)){
                let reviewData = await primary.model(Constants.MODELS.review, reviewModel).findById(new mongoose.Types.ObjectId(reviewId)).lean();
                if(reviewData && reviewData != null){
                    await primary.model(Constants.MODELS.review, reviewModel).findByIdAndDelete(new mongoose.Types.ObjectId(reviewId));
                    return responseManager.onSuccess('review delete successfully..',1,res);
                }else{
                    return responseManager.badrequest({message : 'Invalid review to delete'}, res);
                }
            }else{
                return responseManager.badrequest({message : 'Invalid reviewId to delete review'}, res);
            }
        }else{
            return responseManager.badrequest({message : 'Invalid customer to delete review'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid customer to delete review'},res);
    }
});

router.post('/getall', helper.authenticateToken, async (req, res) => {
   let {productId} = req.body;
   if(req.token && mongoose.Types.ObjectId.isValid(req.token.id)){
    let primary = MongoConnection.useDb(Constants.DEFAULTDB);
    let customerData = await primary.model(Constants.MODELS.customer, custmerModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
    if(customerData && customerData != null){
        if(productId && mongoose.Types.ObjectId.isValid(productId)){
            let productData = await primary.model(Constants.MODELS.product, productModel).findById(new mongoose.Types.ObjectId(productId)).lean();
            if(productData && productData != null){
                let allReview = await primary.model(Constants.MODELS.review, reviewModel).find({productId : new mongoose.Types.ObjectId(productId)}).populate({
                    path : 'createBy' , model : primary.model(Constants.MODELS.customer, custmerModel), select : "fullname"
                }).select("rating review createdAtTimestamp").lean();
                async.forEachSeries(allReview, (review, next_review) => {
                    let date = new Date(review.createdAtTimestamp);
                    let day = date.getDate();
                    let month = parseInt(date.getMonth() + 1);
                    let year = date.getFullYear();
                    let formate = day + '/' + month + '/' +year;
                    review.date = formate;
                    next_review();
                },() => {
                    return responseManager.onSuccess('review details..',allReview, res);
                });
            }else{
                return responseManager.badrequest({message : 'Invalid productId to get review..'}, res);
            }
        }else{
            return responseManager.badrequest({message : 'Invalid productId to get review...!'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'invalid token to get review...!'}, res);
    }
   }else{
    return responseManager.badrequest({message : 'Invalid token to get review...!'}, res);
   }
});


module.exports = router;