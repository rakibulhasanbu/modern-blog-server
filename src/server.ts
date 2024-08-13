import mongoose from "mongoose";
import app from "./app/app";
import { v2 as cloudinary } from "cloudinary";
import config from "./config";

//cloudinary config
cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});

async function main() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(config.database_url as string);
    console.log("Connected to MongoDB");
    app.listen(config.port, () => {
      console.log(`modern-blog-server app is listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("An unexpected error occurred:", error);
});
