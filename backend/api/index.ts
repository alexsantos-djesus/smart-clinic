import serverless from "serverless-http";
import app from "../src/app";

// Vercel usa default export
export default serverless(app);
