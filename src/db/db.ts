import mongoose, { ConnectOptions } from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://anshmmp1999:hMCWDbMewwsCMQ2T@cluster0.0elm7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
};

// mongodb+srv://anshmmp1999:<db_password>@cluster0.0elm7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0