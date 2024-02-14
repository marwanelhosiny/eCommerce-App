import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as pc from "./product.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { multermiddleware } from "../../middlewares/multerMiddleware.js";
import { systemRoles } from "../../utils/system-roles.js";


const router = Router()

router.post('/',multermiddleware().array('image'),auth(systemRoles.ADMIN,systemRoles.SUPERADMIN),expressAsyncHandler(pc.addProduct))




















export default router