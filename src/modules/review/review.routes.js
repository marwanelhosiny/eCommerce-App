import { Router } from "express";
import * as rc from "./review.controller.js"
import { validationFunction } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import expressAsyncHandler from "express-async-handler";
import { addreviewSchema, deletereviewSchema, getreviewsSchema } from "./review.schemas.js";


const router = Router();


router.post('/:productId', validationFunction(addreviewSchema), auth(), expressAsyncHandler(rc.addReview))
router.delete('/:reviewId/:productId',validationFunction(deletereviewSchema) , auth(), expressAsyncHandler(rc.deleteReview))
router.get('/:productId', validationFunction(getreviewsSchema), expressAsyncHandler(rc.getReviews))





















export default router

