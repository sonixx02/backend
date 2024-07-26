import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid Channel ID"));
  }

  const existingSubscriber = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (existingSubscriber) {
    await existingSubscriber.remove();
    return res.status(200).json(new ApiResponse(200, null, "Subscriber removed"));
  } else {
    const newSubscriber = new Subscription({
      channel: channelId,
      subscriber: req.user._id,
    });
    await newSubscriber.save();
    return res.status(200).json(new ApiResponse(200, null, "Subscribed"));
  }
});

// Get channel subscribers
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid Channel ID"));
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate('subscriber', 'username email');
  return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// Get user's subscribed channels
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    return res.status(400).json(new ApiResponse(400, null, "Invalid Subscriber ID"));
  }

  const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate('channel', 'username email');
  return res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
