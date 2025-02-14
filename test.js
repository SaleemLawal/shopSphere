// import OpenAI from "openai";

const API_KEY =
  "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";

// const deepseek_API = "sk-695e3701e5ba4e2a9167776022c70d94";

export async function main() {
  try {
    console.log("Starting request...");
    const data = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://shopsphere.com",
        "X-Title": "ShopSphere",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content:
              "Give me a list of restuarants in the DMV area for valentines",
          },
        ],
      }),
    });

    if (!data.ok) {
      const errorText = await data.text();
      throw new Error(
        `HTTP error! status: ${data.status}, message: ${errorText}`
      );
    }

    const response = await data.json();
    console.log("Response received:", response);

    if (response.choices && response.choices[0]) {
      console.log("AI Response:", response.choices[0].message.content);
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

// main();
