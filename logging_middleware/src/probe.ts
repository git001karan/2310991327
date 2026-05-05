import axios from "axios";

const BASE = "http://20.207.122.201/evaluation-service";

async function probe(): Promise<void> {
  console.log("--- Trying auth with ALL fields ---");
  try {
    const { data } = await axios.post(`${BASE}/auth`, {
      clientID: "69688fa4-ab64-4776-9dd8-13e9375856e4",
      clientSecret: "SFxfgxCEEANYNYqu",
      email: "karan1327.be23@chitkara.edu.in",
      name: "Karan",
      rollNo: "2310991327",
      accessCode: "EXfvDp",
    });
    console.log("AUTH SUCCESS:", JSON.stringify(data));

    const token = data.token || data.access_token || data.accessToken;
    if (token) {
      console.log("\n--- Testing /notifications with token ---");
      try {
        const { data: nd } = await axios.get(`${BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 5, page: 1 },
        });
        console.log("NOTIFICATIONS:", JSON.stringify(nd).slice(0, 300));
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) console.log("notifications failed:", e.response?.status, JSON.stringify(e.response?.data));
      }
    }
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) console.log("auth failed:", e.response?.status, JSON.stringify(e.response?.data));
  }
}

probe();
