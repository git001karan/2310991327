import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.LOG_API_BASE ?? "http://20.207.122.201/evaluation-service";

async function register(): Promise<void> {
  try {
    const { data } = await axios.post(`${BASE_URL}/register`, {
      name: "Karan",
      email: "karan1327.be23@chitkara.edu.in",
      rollNo: "2310991327",
      mobileNo: "8360847078",
      githubUsername: "git001karan",
      accessCode: "EXfvDp",
    });
    console.log("Registration successful. Add to .env:");
    console.log(`LOG_CLIENT_ID=${data.clientID}`);
    console.log(`LOG_CLIENT_SECRET=${data.clientSecret}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Registration failed:", err.response?.status, JSON.stringify(err.response?.data));
    } else {
      console.error("Unexpected error:", err);
    }
    process.exit(1);
  }
}

register();
