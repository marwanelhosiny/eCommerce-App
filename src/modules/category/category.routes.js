import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as cc from "./category.controller.js"
import { auth } from "../../middlewares/auth.middleware.js";
import { multermiddleware } from "../../middlewares/multerMiddleware.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { systemRoles } from "../../utils/system-roles.js";
import { validationFunction } from "../../middlewares/validation.middleware.js";
import { addcategorySchema, deletecategorySchema, getcategorySchema, updatecategorySchema } from "./category.schemas.js";

const router = Router()

router.post('/',multermiddleware(allowedExtensions.Image).single('image'),validationFunction(addcategorySchema),auth(systemRoles.SUPERADMIN),expressAsyncHandler(cc.addCategory))
router.put('/:categoryId',multermiddleware(allowedExtensions.Image).single('image'),validationFunction(updatecategorySchema),auth(systemRoles.SUPERADMIN),expressAsyncHandler(cc.updateCategory))
router.get('/',expressAsyncHandler(cc.getAllCategories))
router.delete('/:categoryId',validationFunction(deletecategorySchema),auth(systemRoles.SUPERADMIN),expressAsyncHandler(cc.deleteCategory))
router.get('/oneCategory/:categoryId', validationFunction(getcategorySchema),expressAsyncHandler(cc.getCategory))










export default router