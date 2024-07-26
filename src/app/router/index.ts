import { Router } from "express";
import userRoute from "../modules/user/user.route";
import authRoute from "../modules/auth/auth.route";
import blogRouter from "../modules/blog/blog.router";
import commentRoute from "../modules/comment/comment.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/",
    route: blogRouter,
  },
  {
    path: "/",
    route: commentRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
