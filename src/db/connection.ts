import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Connection String Undefined");
}

export default pgPromise()(connectionString);
