import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as sc from "./sub-category.controller.js"
import { auth } from "../../middlewares/auth.middleware.js";
import { multermiddleware } from "../../middlewares/multerMiddleware.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { systemRoles } from "../../utils/system-roles.js";
import { validationFunction } from "../../middlewares/validation.middleware.js";
import { addsubcategorySchema, deletesubcategorySchema, updatesubcategorySchema } from "./sub-category.schemas.js";

const router = Router()

router.post('/:categoryId',multermiddleware(allowedExtensions.Image).single('image'),validationFunction(addsubcategorySchema),auth(systemRoles.SUPERADMIN),expressAsyncHandler(sc.addSubCategory))
router.put('/:subCategoryId',multermiddleware(allowedExtensions.Image).single('image'),validationFunction(updatesubcategorySchema),auth(systemRoles.SUPERADMIN),expressAsyncHandler(sc.updateSubCategory))
router.delete('/:subCategoryId',validationFunction(deletesubcategorySchema),auth(systemRoles.SUPERADMIN),expressAsyncHandler(sc.deleteSubCategory))
router.get('/',expressAsyncHandler(sc.getAllsubCategories))












export default router