import { JwtPayload } from "jsonwebtoken";
import { TComment, TCommentObj } from "./comment.interface";
import Comment from "./comment.model";
import Blog from "../blog/blog.model";
import Notification from "../notification/notification.model";
import QueryBuilder from "../../../builder/QueryBuilder";
import AppError from "../../../error/AppError";
import { QueryOptions } from "mongoose";
import { TNotification } from "../notification/notification.interface";
import { TTokenUser } from "../auth/auth.interface";

const createCommentIntoDB = async (
  user: TTokenUser | JwtPayload,
  payload: TComment,
) => {
  const { blogId, blogAuthor, comment, replyingTo } = payload;

  const commentObj: TCommentObj = {
    blogId,
    blogAuthor,
    comment,
    commentedBy: user?.id,
  };
  if (replyingTo) {
    commentObj.parent = replyingTo;
    commentObj.isReply = true;
  }

  const createComm = await Comment.create(commentObj);

  if (!createComm) {
    throw new AppError(400, "Comment create Failed");
  }
  const updateBlog = await Blog.findOneAndUpdate(
    { _id: blogId },
    {
      $push: { comments: createComm?._id },
      $inc: {
        "activity.total_comments": 1,
        "activity.total_parent_comments": replyingTo ? 0 : 1,
      },
    },
    { new: true, runValidators: true },
  );

  if (!updateBlog) {
    throw new AppError(400, "Comment create Failed");
  }
  const notificationObj: TNotification = {
    type: replyingTo ? "reply" : "comment",
    blog: blogId,
    notificationFor: blogAuthor,
    user: user?.id,
    comment: createComm?._id,
  };

  if (replyingTo) {
    notificationObj.repliedOnComment = replyingTo;
    const replyToComment = await Comment.findOneAndUpdate(
      { _id: replyingTo },
      { $push: { children: createComm?._id } },
      { new: true, runValidators: true },
    );

    if (replyToComment) {
      notificationObj.notificationFor = replyToComment.commentedBy;
    }
  }

  const createNoti = await Notification.create(notificationObj);

  if (!createNoti) {
    throw new AppError(400, "Notification and Comment create Failed");
  }

  return createComm;
};

const getAllCommentByBlogIdFromDB = async (
  blogId: string,
  query: QueryOptions,
) => {
  const { page } = query;
  const commentQuery = new QueryBuilder(
    Comment.find({ blogId, isReply: false })
      .populate({
        path: "commentedBy",
        select:
          "personalInfo.profileImg personalInfo.fullName personalInfo.username",
      })
      .populate("children"),
    { limit: 5, page },
  )
    .search(["title"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await commentQuery.modelQuery;
  const meta = await commentQuery.countTotal();

  return {
    meta,
    data,
  };
};

export const commentServices = {
  createCommentIntoDB,
  getAllCommentByBlogIdFromDB,
};
