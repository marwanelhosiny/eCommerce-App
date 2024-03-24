import Order from "../../../DB/models/order.model.js";
import Product from "../../../DB/models/product.model.js";
import Review from "../../../DB/models/review.model.js";


//======================================= add review ===================//
export const addReview = async (req, res, next) => {
    //1- destructing the required data from request
    const { _id } = req.authUser
    const { productId } = req.params
    const { rate, comment } = req.body

    //2- checking if user ordered the product
    const productAvailbiltyForReview = await Order.findOne({ user: _id, "orderItems.product": productId, isDelivered: true })
    if (!productAvailbiltyForReview) { return next(new Error('you have to order the product first')); }

    //3- creating review object
    const reviewObject = {
        userId: _id,
        productId: productId,
        rate: rate,
        comment: comment
    }

    const review = await Review.create(reviewObject)
    if (!review) { return next(new Error('something went wrong', { cause: 400 })) }

    //4- update product rate
    const product = await Product.findById(productId)
    const reviews = await Review.find({ productId })

    let totalRate = 0
    for (const review of reviews) {
        totalRate += review.rate
    }

    product.rate = totalRate / reviews.length

    await product.save()

    return res.status(200).json({ message: "your review added successfully", review, product })
}

//================================== delete review ===================//
export const deleteReview = async (req, res, next) => {
    //1- destructing the required data from request
    const { _id } = req.authUser
    const { reviewId , productId } = req.params

    //2- checking if review exists
    const review = await Review.findOneAndDelete({ _id: reviewId  , productId , userId: _id })
    if (!review) { return next(new Error('review not found', { cause: 400 })) }

    //3- update product rate
    const product = await Product.findById(productId)
    const reviews = await Review.find({ productId })

    let totalRate = 0
    for (const review of reviews) {
        totalRate += review.rate
    }

    product.rate = totalRate / reviews.length

    await product.save()

    return res.status(200).json({ message: "review deleted successfully" })

}

//================================== get reviews ===================//
export const getReviews = async (req, res, next) => {
    //1- destructing the required data from request
    const { productId } = req.params

    //2- getting reviews
    const reviews = await Review.find({ productId })
    return res.status(200).json({ message: "reviews fetched successfully", reviews })
}