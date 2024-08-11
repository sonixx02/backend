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
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";

import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

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

  router.route('/comments/:commentId')
  .delete(verifyJWT, deleteComment); 

  router.route('/getVideos').get(getAllVideos)

  router.route("/publish")
  .post(verifyJWT, upload.fields([{ name: 'videoFile' }, { name: 'thumbnailFile' }]), publishAVideo);

  router.route('/:videoId')
  .get(verifyJWT,getVideoById)  // GET request to fetch a video by ID
  .put(verifyJWT, updateVideo)  // PUT request to update a video by ID
  .delete(verifyJWT, deleteVideo);  // DELETE request to delete a video by ID

// Route for toggling the publish status of a video by ID
router.route('/:videoId/toggle-publish')
  .patch(verifyJWT, togglePublishStatus);  // PATCH request to toggle publish status

router.route("/videos/:videoId/like").post(verifyJWT, toggleVideoLike);
router.route("/comments/:commentId/like").post(verifyJWT, toggleCommentLike);
router.route("/tweets/:tweetId/like").post(verifyJWT, toggleTweetLike);
router.route("/videos/liked").get(verifyJWT, getLikedVideos);

router.route("/tweets").post(verifyJWT, createTweet);
router.route("/tweets/:userId").get(verifyJWT, getUserTweets);
router.route("/tweets/:tweetId").put(verifyJWT, updateTweet);
router.route("/tweets/:tweetId").delete(verifyJWT, deleteTweet);

// Playlist routes
router
  .route("/playlists")
  .post(verifyJWT, createPlaylist)

router.route('/user/:userId').get(getUserPlaylists);

router
  .route("/playlists/:playlistId")
  .get(verifyJWT, getPlaylistById)
  .delete(verifyJWT, deletePlaylist)
  .patch(verifyJWT, updatePlaylist);

router
  .route("/playlists/:playlistId/videos/:videoId")
  .post(verifyJWT, addVideoToPlaylist)
  .delete(verifyJWT, removeVideoFromPlaylist);

// Subscription routes
router.route("/subscribe/:channelId").post(verifyJWT, toggleSubscription);
router
  .route("/subscribers/:channelId")
  .get(verifyJWT, getUserChannelSubscribers);
router
  .route("/subscriptions/:subscriberId")
  .get(verifyJWT, getSubscribedChannels);

// Dashboard routes
router.route("/dashboard/channel-stats/:username").get(verifyJWT, getChannelStats);
router.route("/dashboard/channel-videos/:username").get(verifyJWT, getChannelVideos);

export default router;
