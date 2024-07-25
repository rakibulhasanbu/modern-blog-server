import mongoose, { QueryOptions } from "mongoose";
import { TBlog } from "./blog.interface";
import Blog from "./blog.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { TTokenUser } from "../user/user.interface";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../error/AppError";
import Notification from "../notification/notification.model";
import Comment from "../comment/comment.model";
import User from "../user/user.model";

const createBlogIntoDB = async (
  user: TTokenUser | JwtPayload,
  blogData: TBlog,
) => {
  const { tags, title, description, banner, content, draft } = blogData;
  const newTags = tags?.map((tag) => tag.toLowerCase());

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

const getLatestBlogFromDB = async (query: QueryOptions) => {
  const { category, id } = query;
  const blogQuery = new QueryBuilder(
    Blog.find({ draft: false, tags: category, author: id })
      .populate({
        path: "author",
        select:
          "personalInfo.profileImg personalInfo.fullName personalInfo.username -_id",
      })
      .select("blogId slug title banner des activity tags createdAt -_id"),
    query,
  )
    .search(["title", "des"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();

  return {
    meta,
    result,
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
  const { draft, deletedDocCount, page } = query;
  const maxLimit = 5;
  query.limit = maxLimit;
  let skipDocs = (page - 1) * maxLimit;
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  const blogQuery = new QueryBuilder(
    Blog.find({ draft, author: user?.id })
      .skip(skipDocs)
      .populate({
        path: "author",
        select:
          "personalInfo.profileImg personalInfo.fullName personalInfo.username -_id",
      })
      .select("blogId slug title banner des activity draft createdAt -_id"),
    query,
  )
    .search(["title"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await blogQuery.modelQuery;
  const meta = await blogQuery.countTotal();

  return {
    meta,
    result,
  };
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
  console.log(deleteBlog);
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
  getLatestBlogFromDB,
  getMyBlogsFromDB,
  getTrendingBlogFromDB,
  getBlogsByUserID,
  deleteBlogBySlugIntoDB,
};
