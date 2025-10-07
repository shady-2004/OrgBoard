import mongoose from "mongoose";

async function connect() {
  if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
    throw new Error("Missing DATABASE or DATABASE_PASSWORD in .env");
  }

  const uri = process.env.DATABASE.replace(
    "<password>",
    process.env.DATABASE_PASSWORD
  );

  const clientOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    serverApi: {
      version: "1" as const,
      strict: true,
      deprecationErrors: true,
    },
  };

  await mongoose.connect(uri, clientOptions);

  mongoose.connection.once("open", async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    } else {
      throw new Error("Database connection is undefined.");
    }
    console.log("Successfully connected and pinged MongoDB!");
  });
}

export default connect;
