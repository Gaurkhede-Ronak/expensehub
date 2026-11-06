import { Router } from "express";

import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
} from "../controllers/categories.controllers.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/getallcategories").get(getAllCategories);
router.route("/getallcategory").get(getAllCategories);

router.route("/createcategory").post(createCategory);

router.route("/updatecategory/:id").patch(updateCategory);

router.route("/deletecategory/:id").delete(deleteCategory);

export default router;