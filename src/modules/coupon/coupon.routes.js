import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { auth } from "../../middlewares/auth.middleware.js"
import { validationFunction } from "../../middlewares/validation.middleware.js"
import * as cc from "./coupon.controller.js"
import { systemRoles } from "../../utils/system-roles.js"
import { addcoupnSchema } from "./coupon.schemas.js";

const router = Router();



router.post('/',validationFunction(addcoupnSchema),auth([systemRoles.SUPERADMIN]),expressAsyncHandler(cc.addCoupon))















export default router