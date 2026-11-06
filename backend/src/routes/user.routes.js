import { Router } from "express";
 
import {
    register,
    login,
    logout,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
} from "../controllers/user.controllers.js";
 
import { verifyJWT, optionalVerifyJWT } from "../middleware/auth.middleware.js";
 
const router = Router();
 
router.route("/register").post(register);
router.route("/login").post(login);

router.route("/logout").get(verifyJWT, logout);
 
router.route("/reset-token").patch(
    refreshAccessToken
);
 
router.route("/get-me").get(
    optionalVerifyJWT,
    getCurrentUser
);
 
router.route("/reset-password").patch(
    verifyJWT,
    changeCurrentPassword
);
 
export default router;