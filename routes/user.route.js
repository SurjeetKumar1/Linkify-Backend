import express, { Router } from "express";
import { activeCheck } from "../controllers/post.controller.js";
import {register,login,uploadProfilePicture,updateUserProfile,getUserAndProfile,updateProfileData,getAllUserProfile, downloadProfile, sendConnectionRequest, getMyconnectionRequest, whatAreMyconnections, acceptConnectionRequest, getUserProfileBasedOnUserName}  from "../controllers/user.controller.js";
import multer from "multer";

const router=Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })

  const upload=multer({storage:storage});

router.route('/update_profile_picture').post(upload.single('profilePicture'),uploadProfilePicture)

router.route('/register').post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/user_get_and_profile").get(getUserAndProfile);
// router.route("/user_get_and_profile").post(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_user_profile").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadProfile)
router.route("/user/send_connection_request").post(sendConnectionRequest)
router.route("/user/getConnectionRequests").get(getMyconnectionRequest)
router.route("/user/user_connection_request").get(whatAreMyconnections)
router.route("/user/accept_connection_request").post(acceptConnectionRequest)
router.route("/user/get_user_based_on_username").get(getUserProfileBasedOnUserName);



export default router