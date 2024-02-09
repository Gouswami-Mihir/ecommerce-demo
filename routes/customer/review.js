var express = require('express');
var router = express.Router();
let MongoConnection = require('../../utilities/connection');
let Constants = require('../../utilities/constants');
let helper = require('../../utilities/helper');
let responseManager = require('../../utilities/responseManager');
let reviewModel = require('../../Models/customer/review.model');
let custmerModel = require('../../Models/customer.model');
let mongoose = require('mongoose');

router.post('save', helper.authenticateToken, async (req, res) => {
    let { reviewId, productId, rating, review } = req.body;
    if (req.token && mongoose.Types.ObjectId.isValid(req.token.id)) {
        let primary = MongoConnection.useDb(Constants.DEFAULTDB);
        let customerData = await primary.model(Constants.MODELS.customer, custmerModel).findById(new mongoose.Types.ObjectId(req.token.id)).lean();
        if (customerData && customerData != null) {
            if (productId && mongoose.Types.ObjectId.isValid(productId)) {
                if (rating && rating.trim() != '' && rating >= 0 && rating <= 5) {
                    if (review && review.trim() != '' && review.length <= 300) {
                        if (reviewId && mongoose.Types.ObjectId.isValid(reviewId) && reviewId.trim() != '') {
                            let reviewData = await primary.model(Constants.MODELS.review, reviewModel).findById(new mongoose.Types.ObjectId(reviewId)).lean();
                            if (reviewData && reviewData != null) {
                                let updateObj = {
                                    productId: new mongoose.Types.ObjectId(productId),
                                    rating: rating,
                                    review: review,
                                    createBy: new mongoose.Types.ObjectId(req.token.id)
                                }
                                await primary.model(Constants.MODELS.review, reviewModel).findByIdAndUpdate(reviewId, updateObj, { returnOriginal: false }).lean();
                                return responseManager.onSuccess('review update successfully..', 1, res);
                            } else {
                                return responseManager.badrequest({ message: 'Invalid review to update review, please try again' }, res);
                            }
                        } else {
                            let reviewObj = {
                                productId: new mongoose.Types.ObjectId(productId),
                                rating: rating,
                                review: review,
                                createBy: new mongoose.Types.ObjectId(req.token.id),
                                createdAtTimestamp: Date.now()
                            }
                            await primary.model(Constants.MODELS.review, reviewModel).create(reviewObj);
                            return responseManager.onSuccess('review add successfully...', 1, res);
                        }
                    } else {
                        return responseManager.badrequest({ message: 'Invalid review to save review' }, res);
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid rating to save review' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid variant for save review' }, res);
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
                return responseManager.badrequest({message : 'Invalid reviewId to delete review'})
            }
        }else{
            return responseManager.badrequest({message : 'Invalid customer to delete review'}, res);
        }
    }else{
        return responseManager.badrequest({message : 'Invalid '})
    }
});

module.exports = router;