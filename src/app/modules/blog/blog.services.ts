import { TBlog } from "./blog.interface";
import Blog from "./blog.model";

const createBlogIntoDB = async (blogData: TBlog) => {
  return (await Blog.create(blogData)).populate({
    path: "createdBy",
    select: "_id name email role",
  });
};

const highestBlogs = async () => {
  const blogs = await Blog.aggregate([
    {
      $group: {
        _id: "$courseId",
        blogCount: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
    { $sort: { averageRating: -1 } },
  ]);
  const highestAverageRating = blogs[0];
  return highestAverageRating;
};

const getBlogByCourseID = async (courseId: string) => {
  return await Blog.find({ courseId }).populate({
    path: "createdBy",
    select: "_id name email role",
  });
};
export const blogService = {
  createBlogIntoDB,
  getBlogByCourseID,
  highestBlogs,
};
