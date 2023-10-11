import axios from "axios";

const apiKey = process.env.OPENAI_API;
// const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions'; // Adjust the endpoint based on your API access.

const sendChatRequest = async (message) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "gpt-3.5-turbo",
        prompt: message,
        temperature: 0.6,
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const chatResponse = response.data.choices[0].text;
    return chatResponse;
  } catch (error) {
    console.error("Error sending chat request:", error);
    return "Error occurred while processing your request.";
  }
};

export default sendChatRequest;
