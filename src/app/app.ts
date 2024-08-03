import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./router";
import notFoundRoute from "./middleware/notFoundRoute";
import globalErrorHandler from "./middleware/globalErrorHandler";
import admin from "firebase-admin";
import config from "./config";

const app: Application = express();

// Adjust the payload size limit here
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ limit: "4mb", extended: true }));

//using middleware
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

//google config
admin.initializeApp({
  credential: admin.credential.cert(config.firebase as admin.ServiceAccount),
});

//application routes
app.use("/api", router);

// landing or testing route
app.get("/", (_req: Request, res: Response) => {
  res.send(`modern-blog-server Auth server is working perfectly`);
});

// unknown route handling
app.all("*", notFoundRoute);

//global error handling
app.use(globalErrorHandler);

export default app;
