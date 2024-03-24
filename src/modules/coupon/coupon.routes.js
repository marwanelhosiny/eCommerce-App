import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { auth } from "../../middlewares/auth.middleware.js"
import { validationFunction } from "../../middlewares/validation.middleware.js"
import * as cc from "./coupon.controller.js"
import { systemRoles } from "../../utils/system-roles.js"
import { addcoupnSchema, disablecoupnSchema, enablecoupnSchema, getCouponByIdSchema, updatecouponSchema } from "./coupon.schemas.js";

const router = Router();



router.post('/', validationFunction(addcoupnSchema), auth([systemRoles.SUPERADMIN]), expressAsyncHandler(cc.addCoupon))
router.patch('/disable/:couponId', validationFunction(disablecoupnSchema), auth([systemRoles.SUPERADMIN]), expressAsyncHandler(cc.disableCoupon))
router.patch('/enable/:couponId', validationFunction(enablecoupnSchema), auth([systemRoles.SUPERADMIN]), expressAsyncHandler(cc.enableCoupon))
router.get('/disabled', expressAsyncHandler(cc.getAllDisabledCoupons))
router.get('/valid', expressAsyncHandler(cc.getAllValidCoupons))
router.get('/:couponId', validationFunction(getCouponByIdSchema) ,expressAsyncHandler(cc.getCouponById))
router.put('/:couponId', validationFunction(updatecouponSchema), auth([systemRoles.SUPERADMIN]), expressAsyncHandler(cc.updateCoupon))















export default router