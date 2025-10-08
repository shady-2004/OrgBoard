import mongoose from "mongoose";

// Disable buffering globally - critical for serverless
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 10000);

// Global cache for connection in serverless environments (Vercel)
type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function connect() {
  // If already connected, return cached connection
  if (cached.conn) {
    console.log("✅ Using cached MongoDB connection");
    return cached.conn;
  }

  // Validate environment variables
  if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
    throw new Error("Missing DATABASE or DATABASE_PASSWORD in .env");
  }

  const uri = process.env.DATABASE.replace(
    "<password>",
    process.env.DATABASE_PASSWORD
  );

  // If a connection promise is in progress, wait for it
  if (!cached.promise) {
    const clientOptions = {
      // Increased timeouts for serverless cold starts
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      // Disable buffering - fail fast if not connected
      bufferCommands: false,
      maxPoolSize: 10, // Connection pool size
      minPoolSize: 2,
      maxIdleTimeMS: 60000, // Close idle connections after 60s
      serverApi: {
        version: "1" as const,
        strict: true,
        deprecationErrors: true,
      },
    };

    console.log("🔄 Establishing new MongoDB connection...");
    
    cached.promise = mongoose.connect(uri, clientOptions).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");
      return mongoose;
    }).catch((error) => {
      console.error("❌ MongoDB connection failed:", error);
      cached.promise = null; // Reset promise on failure
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Ping to verify connection
    if (cached.conn.connection.db) {
      await cached.conn.connection.db.admin().ping();
      console.log("✅ MongoDB ping successful");
    }
  } catch (error) {
    console.error("❌ Connection verification failed:", error);
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

// Handle connection events for monitoring
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
  // Clear cache on error to force reconnection
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on("disconnected", () => {
  console.log("📴 Mongoose disconnected from MongoDB");
  // Clear cache on disconnect
  cached.conn = null;
  cached.promise = null;
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

export default connect;
