import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

 const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid Channel ID.");
    }

    const subscriberId = req.user?._id;

   
    const existingSubscription = await Subscription.findOne({ channel: channelId, subscriber: subscriberId });

    if (existingSubscription) {
        
        await existingSubscription.remove();
        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully."));
    } else {
        
        const newSubscription = new Subscription({ channel: channelId, subscriber: subscriberId });
        await newSubscription.save();
        return res.status(200).json(new ApiResponse(200, {}, "Subscribed successfully."));
    }
});


 const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid Channel ID.");
    }

    const subscribers = await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                pipeline: [
                    { $project: { username: 1, avatar: 1 } }
                ],
                as: "subscriberDetails"
            }
        },
        { $unwind: "$subscriberDetails" },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    ]);

    return res.status(200).json(new ApiResponse(200, { subscribers }, "Subscribers fetched successfully."));
});


 const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID.");
    }

    const channels = await Subscription.aggregate([
        { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subsList"
                        }
                    },
                    {
                        $addFields: {
                            subsCount: { $size: "$subsList" }
                        }
                    },
                    { $project: { username: 1, avatar: 1, subsCount: 1 } }
                ],
                as: "channelDetails"
            }
        },
        { $unwind: "$channelDetails" }
    ]);

    return res.status(200).json(new ApiResponse(200, { channels }, "Subscribed channels fetched successfully."));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}