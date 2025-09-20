const axios = require("axios");

async function testUrlSummary() {
  try {
    console.log("Testing URL Summary endpoint...");

    const response = await axios.post(
      "http://localhost:3001/api/v1/summary/url",
      {
        url: "https://en.wikipedia.org/wiki/Machine_learning",
        format: "bullets",
        length: "short",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log("✅ SUCCESS!");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    }
  }
}

// Test the endpoint
testUrlSummary();
