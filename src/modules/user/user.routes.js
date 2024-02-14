import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as uc from "./user.controller.js"

import { auth } from "../../middlewares/auth.middleware.js";
import { validationFunction } from "../../middlewares/validation.middleware.js";
import { multermiddleware } from "../../middlewares/multerMiddleware.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { systemRoles } from "../../utils/system-roles.js";
import { updateuserprofileSchema } from "./user.schemas.js";



const router = Router()


router.put('/',validationFunction(updateuserprofileSchema),auth(),expressAsyncHandler(uc.updateUserProfile))
router.delete('/',auth(),expressAsyncHandler(uc.deleteUser))
















export default router