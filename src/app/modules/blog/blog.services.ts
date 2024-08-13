import mongoose, { QueryOptions } from "mongoose";
import { TBlog, TBlogQuery } from "./blog.interface";
import Blog from "./blog.model";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../../error/AppError";
import Notification from "../notification/notification.model";
import Comment from "../comment/comment.model";
import User from "../auth/auth.model";
import QueryBuilder from "../../../builder/QueryBuilder";
import { TTokenUser, TUser } from "../auth/auth.interface";

const createBlogIntoDB = async (
  user: TTokenUser | JwtPayload,
  blogData: TBlog,
) => {
  const { tags, title, description, banner, content, draft } = blogData;
  const newTags = tags?.map((tag) => tag.toLowerCase().trim());

  const randomString = Math.random().toString(36).substring(2, 10);

  const slug =
    title
      .replace(/[^a-zA-z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + randomString;

  const createBlogData = {
    tags: newTags,
    slug,
    title,
    banner,
    description,
    content,
    draft: Boolean(draft),
    author: user?.id,
  };

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const createBlog = await Blog.create(createBlogData);
    if (!createBlog) {
      throw new AppError(400, "Blog create unsuccessful!");
    }

    const incrementVal = draft ? 0 : 1;
    const updateUser = await User.findOneAndUpdate(
      { _id: user?.id },
      {
        $inc: { "accountInfo.totalPosts": incrementVal },
        $push: { blogs: createBlog._id },
      },
    );
    if (!updateUser) {
      throw new AppError(400, "Blog create unsuccessful");
    }

    await session.commitTransaction();
    await session.endSession();

    const result = await Blog.findById(createBlog?._id);

    return result;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();

    throw new AppError(400, "Failed to create Blog");
  }
};

const updateBlogBySlugIntoDB = async (
  user: TTokenUser | JwtPayload,
  blogData: TBlog,
  slug: string,
) => {
  const { tags, title, description, banner, content, draft } = blogData;
  const newTags = tags?.map((tag) => tag.toLowerCase().trim());

  const updateBlogData = {
    tags: newTags,
    title,
    slug,
    banner,
    description,
    content,
    draft: Boolean(draft),
    author: user?.id,
  };

  const updateBlog = await Blog.findOneAndUpdate({ slug }, updateBlogData, {
    new: true,
    runValidators: true,
  });
  if (!updateBlog) {
    throw new AppError(400, "Blog update unsuccessful!");
  }
  return updateBlog;
};

const getLatestBlogFromDB = async (query: QueryOptions) => {
  const { category, id, searchTerm, limit, eliminateBlog } = query;

  const blogQueryData: TBlogQuery = { draft: false };

  if (category) {
    blogQueryData.tags = { $regex: category, $options: "i" };
  }

  if (id) {
    blogQueryData.author = id;
  }

  if (eliminateBlog) {
    blogQueryData.slug = { $ne: eliminateBlog };
  }

  const blogQuery = new QueryBuilder(
    Blog.find(blogQueryData)
      .populate({
        path: "author",
        select:
          "personalInfo.profileImg personalInfo.fullName personalInfo.username -_id",
      })
      .select("slug title banner description activity tags createdAt -_id"),
    { searchTerm, limit },
  )
    .search(["title", "description", "tags"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();

  return {
    meta,
    data,
  };
};

const getTrendingBlogFromDB = async () => {
  const limit = 5;
  return await Blog.find({ draft: false })
    .populate({
      path: "author",
      select:
        "personalInfo.profileImg personalInfo.fullName personalInfo.username -_id",
    })
    .sort({
      "activity.totalReads": -1,
      "activity.totalLikes": -1,
      createdAt: -1,
    })
    .select("slug title createdAt -_id")
    .limit(limit);
};

const getMyBlogsFromDB = async (
  user: TTokenUser | JwtPayload,
  query: QueryOptions,
) => {
  // const { draft, deletedDocCount, page } = query;

  // const maxLimit = 5;

  // query.limit = maxLimit;

  // let skipDocs = (page - 1) * maxLimit;

  // if (deletedDocCount) {
  //   skipDocs -= deletedDocCount;
  // }

  const blogQuery = new QueryBuilder(
    Blog.find({ author: user?.id })
      // .skip(skipDocs)
      .populate({
        path: "author",
        select:
          "personalInfo.profileImg personalInfo.fullName personalInfo.username -_id",
      })
      .select("slug title banner des activity draft createdAt -_id"),
    query,
  )
    .search(["title"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();

  return {
    meta,
    data,
  };
};

const likeBlogsIntoDB = async (
  user: TTokenUser | JwtPayload,
  payload: { likedByUser: boolean; id: string },
) => {
  const { likedByUser, id } = payload;
  const incrementVal = !likedByUser ? 1 : -1;

  const likeBlog = await Blog.findByIdAndUpdate(id, {
    $inc: { "activity.total_likes": incrementVal },
    new: true,
    runValidators: true,
  });

  if (!likeBlog) {
    throw new AppError(400, "Like blog successful.");
  }

  const notificationData = {
    type: "like",
    blog: id,
    notificationFor: likeBlog?.author,
    user: user?.id,
  };
  if (!likedByUser) {
    const createNoti = await Notification.create(notificationData);

    if (!createNoti) {
      throw new AppError(400, "Notification create successful.");
    }
  } else {
    const deleteNoti = await Notification.findOneAndDelete(notificationData);

    if (!deleteNoti) {
      throw new AppError(400, "Notification delete unsuccessful.");
    }
  }

  return likeBlog;
};

const getIsLikedBlogByUserFromDB = async (
  user: TTokenUser | JwtPayload,
  query: QueryOptions,
) => {
  const { id } = query;
  const isLikedByUser = await Notification.exists({
    user: user?.id,
    type: "like",
    blog: id,
  });

  if (!isLikedByUser) {
    return { _id: null };
  }

  return isLikedByUser;
};

const getBlogsBySlugFromDB = async (
  slug: string,
  query: { mode: string } | QueryOptions,
) => {
  const { mode } = query;
  const incrementVal = mode !== "edit" ? 1 : 0;
  const findAndUpdateBlog = await Blog.findOneAndUpdate(
    { slug },
    { $inc: { "activity.total_reads": incrementVal } },
    { new: true, runValidators: true },
  ).populate({
    path: "author",
    select:
      "personalInfo.profileImg personalInfo.fullName personalInfo.username",
  });

  if (!findAndUpdateBlog) {
    throw new AppError(400, "Blog retrieved unsuccessful.");
  }

  await User.findOneAndUpdate(
    {
      "personalInfo.username": (findAndUpdateBlog?.author as unknown as TUser)
        ?.personalInfo?.username,
    },
    { $inc: { "accountInfo.totalReads": incrementVal } },
  );

  return findAndUpdateBlog;
};

const getBlogsByUserID = async (userId: string) => {
  return await Blog.find({ author: userId }).select(
    "slug title banner des activity tags createdAt -_id",
  );
};

const deleteBlogBySlugIntoDB = async (
  user: TTokenUser | JwtPayload,
  slug: string,
) => {
  const isAccessToDelete = await Blog.find({ author: user?.id, slug });
  if (!isAccessToDelete) {
    throw new AppError(403, "You have no access to delete this blog.");
  }
  const deleteBlog = await Blog.findOneAndDelete({ author: user?.id, slug });

  if (!deleteBlog) {
    throw new AppError(400, "Delete blog unsuccessful.");
  }
  const deleteNotifications = await Notification.deleteMany({
    blog: deleteBlog?._id,
  });
  const deleteComment = await Comment.deleteMany({ blogSlug: deleteBlog?._id });
  const updateUserData = await User.findOneAndUpdate(
    { _id: user?.id },
    {
      $pull: { blogs: deleteBlog?._id },
      $inc: { "accountInfo.totalPosts": -1 },
    },
  );
  if (!deleteNotifications || !deleteComment || !updateUserData) {
    throw new AppError(400, "Delete blog unsuccessful.");
  }

  return deleteBlog;
};

export const blogService = {
  createBlogIntoDB,
  updateBlogBySlugIntoDB,
  getLatestBlogFromDB,
  getMyBlogsFromDB,
  getTrendingBlogFromDB,
  getBlogsByUserID,
  deleteBlogBySlugIntoDB,
  getBlogsBySlugFromDB,
  likeBlogsIntoDB,
  getIsLikedBlogByUserFromDB,
};
