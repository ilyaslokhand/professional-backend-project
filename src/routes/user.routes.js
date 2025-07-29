import { Router } from "express";
import  {registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatarLocalPath, updatecoverImageLocalPath, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router();

router.route("/register").post( upload.fields([
   {
    name: "avatar",
    maxCount: 1,
   },
   {
    name: "coverImage",
    maxCount: 1,
   }
]),registerUser);

router.route("/login").post(loginUser)

// secured routes

router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/Change-Password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"), updateAvatarLocalPath)
router.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"), updatecoverImageLocalPath);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile); // because here we are taking username from the url params thats why we write /c/username
router.route("/watch-history").get(verifyJWT,getWatchHistory)



export default router;