import Router from "express"
import { registerUser , loginUser, logoutUser, updateAccountDetails,updateUserAvatar,updateUserCoverImage,changePassword, getCurrentUser, refreshAccessToken, getChannelUserProfile} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

const registerUploader = upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
]);

router.route("/register").post(registerUploader,registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(logoutUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/change-password").patch(verifyJWT,changePassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/refresh-token").post(verifyJWT,refreshAccessToken);
router.route("/c/:username").get(getChannelUserProfile);
export default router;