import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as oc from "./order.controller.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { systemRoles } from "../../utils/system-roles.js"

const router = Router()



router.post('/deliever/:orderId',auth([systemRoles.DELIEVER]),expressAsyncHandler(oc.delieverOrder))
router.post('/:productId/:quantity',auth([systemRoles.USER]),expressAsyncHandler(oc.creatOrder))
router.put('/',auth([systemRoles.USER]),expressAsyncHandler(oc.convertCartToOrder))















export default router