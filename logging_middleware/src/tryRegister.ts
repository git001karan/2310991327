import axios from "axios";

const BASE_URL = "http://20.207.122.201/evaluation-service";

async function run(): Promise<void> {
  // Try different mobile numbers since "mobile already exists"
  const attempts = [
    { mobileNo: "2310991327", githubUsername: "karan1327" },
    { mobileNo: "2310991327", githubUsername: "karan-1327" },
    { mobileNo: "2310991327", githubUsername: "karan" },
  ];

  for (const attempt of attempts) {
    try {
      const { data } = await axios.post(`${BASE_URL}/register`, {
        name: "Karan",
        email: "karan1327.be23@chitkara.edu.in",
        rollNo: "2310991327",
        mobileNo: attempt.mobileNo,
        githubUsername: attempt.githubUsername,
        accessCode: "EXfvDp",
      });
      console.log("SUCCESS:", JSON.stringify(data));
      return;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.log(`Failed (${attempt.githubUsername}):`, err.response?.status, JSON.stringify(err.response?.data));
      }
    }
  }
}

run();
