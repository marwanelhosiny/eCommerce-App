import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as pc from "./product.controller.js";
import { validationFunction } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { multermiddleware } from "../../middlewares/multerMiddleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import { addproductSchema, deleteproductSchema, getproductbyidSchema, getproductsfor2brandSchema, updateproductSchema } from "./product.schemas.js";


const router = Router()

router.post('/',multermiddleware().array('image'),validationFunction(addproductSchema),auth([systemRoles.ADMIN,systemRoles.SUPERADMIN]),expressAsyncHandler(pc.addProduct))
router.put('/',multermiddleware().single('image'),validationFunction(updateproductSchema),auth([systemRoles.ADMIN,systemRoles.SUPERADMIN]),expressAsyncHandler(pc.updateProduct))
router.delete('/',validationFunction(deleteproductSchema),auth([systemRoles.ADMIN,systemRoles.SUPERADMIN]),expressAsyncHandler(pc.deleteProduct))
router.get('/singleProduct',validationFunction(getproductbyidSchema),expressAsyncHandler(pc.getProductById))
router.get('/getProductsFor2Brand',validationFunction(getproductsfor2brandSchema),expressAsyncHandler(pc.getProductsFor2Brand))
router.get('/',expressAsyncHandler(pc.getAllProducts))
router.get('/searchProduct',expressAsyncHandler(pc.searchProduct))











export default router