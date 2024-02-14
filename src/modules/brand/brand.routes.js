import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as bc from "./brand.controller.js"
import { auth } from "../../middlewares/auth.middleware.js";
import { multermiddleware } from "../../middlewares/multerMiddleware.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { systemRoles } from "../../utils/system-roles.js";  
import { validationFunction } from "../../middlewares/validation.middleware.js";
import { addbrandSchema, deletebrandSchema, updatebrandSchema } from "./brand.schemas.js";

const router = Router()





router.post('/',multermiddleware().single('image'),validationFunction(addbrandSchema),auth(systemRoles.ADMIN),expressAsyncHandler(bc.addBrand));
router.put('/:brandId',multermiddleware(allowedExtensions.Image).single('image'),validationFunction(updatebrandSchema),auth(systemRoles.SUPERADMIN),expressAsyncHandler(bc.updateBrand))
router.delete('/:brandId',validationFunction(deletebrandSchema),auth(systemRoles.SUPERADMIN,systemRoles.ADMIN),expressAsyncHandler(bc.deleteBrand))








export default router


