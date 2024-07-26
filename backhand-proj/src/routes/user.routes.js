import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";

import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/like.controller.js";

import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscriptionController.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);
router
  .route("/videos/:videoId/comments")
  .get(getVideoComments)
  .post(verifyJWT, addComment);

router.route("/comments/:id").put(verifyJWT, updateComment);

router.route("/comments/:commentId").delete(verifyJWT, deleteComment);

router.get("/", getAllVideos); // Get all videos with pagination, filtering, and sorting

router.post("/publish", verifyJWT, upload.single("videoFile"), publishAVideo); // Publish a new video

router.get("/:videoId", getVideoById); // Get a video by ID

router.put("/:videoId", verifyJWT, updateVideo); // Update a video by ID

router.delete("/:videoId", verifyJWT, deleteVideo); // Delete a video by ID

router.patch("/:videoId/toggle-publish", verifyJWT, togglePublishStatus); // Toggle publish status of a video by ID

router.route("/videos/:videoId/like").post(protect, toggleVideoLike);
router.route("/comments/:commentId/like").post(protect, toggleCommentLike);
router.route("/tweets/:tweetId/like").post(protect, toggleTweetLike);
router.route("/videos/liked").get(protect, getLikedVideos);

router.route("/tweets").post(protect, createTweet);
router.route("/tweets/:tweetId").get(protect, getUserTweets);
router.route("/tweets/:id").put(protect, updateTweet);
router.route("/tweets/:id").delete(protect, deleteTweet);

// Subscription routes
router.route("/subscribe/:channelId").post(verifyJWT, toggleSubscription);
router.route("/subscribers/:channelId").get(verifyJWT, getUserChannelSubscribers);
router.route("/subscriptions/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router;
