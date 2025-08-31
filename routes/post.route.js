import express, { Router } from "express";
import { activeCheck, commentsPost, createdPost, deleletPost, deleteCommentOfUser, getAllPosts, getCommentsByPost, increment_likes } from "../controllers/post.controller.js";
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

router.route('/').get(activeCheck);
router.route('/post').post(upload.single('media'),createdPost);
router.route('/post').get(getAllPosts);
router.route('/delete_post').delete(deleletPost);
router.route('/comment').post(commentsPost);
router.route('/get_comments').get(getCommentsByPost);
router.route('/delete_comment').delete(deleteCommentOfUser);
router.route('/increment_post_like').post(increment_likes);

export default router