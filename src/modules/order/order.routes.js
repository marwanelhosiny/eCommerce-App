import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as oc from "./order.controller.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { systemRoles } from "../../utils/system-roles.js"

const router = Router()



router.post('/deliever/:orderId',auth([systemRoles.DELIEVER]),expressAsyncHandler(oc.delieverOrder))
router.post('/',auth([systemRoles.USER]),expressAsyncHandler(oc.creatOrder))
router.put('/',auth([systemRoles.USER]),expressAsyncHandler(oc.convertCartToOrder))
router.post('/payment',auth(),expressAsyncHandler(oc.payWithStripe))
router.post('/webhook',expressAsyncHandler(oc.stripeWebHookLocal))
router.post('/refund',auth([systemRoles.SUPERADMIN]),expressAsyncHandler(oc.paymentRefund))














export default router