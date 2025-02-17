import mongoose from "mongoose";

export default async function connectToDB() {
  try {
    await mongoose.connect(`${process.env.DATABASE_CONNECTION_STRING}`);
    console.log(
      `Connected to database (${process.env.DATABASE_CONNECTION_STRING}).`
    );
  } catch (error) {
    console.error({ message: error.message, stack: error.stack });
    process.exit(1);
  }
}
