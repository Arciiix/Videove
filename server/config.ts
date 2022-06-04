import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT || 8729,
};
export default config;
