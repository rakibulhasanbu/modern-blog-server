import mongoose from "mongoose";
import config from "./app/config";
import app from "./app/app";

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
