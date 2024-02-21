import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as cc from "./cart.controller.js";
import { systemRoles } from "../../utils/system-roles.js";
import { auth } from "../../middlewares/auth.middleware.js"






const router = Router()

router.post('/',auth([systemRoles.USER]), expressAsyncHandler(cc.addToCart))







export default router