/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// System prompt: The chatbot only answers questions about L’Oréal products, routines, and recommendations.
const systemPrompt = `You are a helpful assistant for L’Oréal. Only answer questions related to L’Oréal products, beauty routines, and recommendations. If asked about anything else, politely explain that you can only help with L’Oréal topics.`;

// This function adds a message to the chat window.
// 'sender' can be 'user' or 'bot' to style the message differently.
function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.textContent = text;
  if (sender === "user") {
    messageDiv.style.borderLeftColor = "#c6a76d";
  } else {
    messageDiv.style.background = "#f5f5f5";
    messageDiv.style.borderLeftColor = "#000";
  }
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent the page from reloading
  const question = userInput.value.trim();
  if (!question) return;

  // Show the user's message in the chat window
  addMessage(question, "user");
  userInput.value = "";

  // Show a loading message while waiting for the bot's response
  addMessage("Thinking…", "bot");

  // Prepare the messages for the OpenAI API
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ];

  try {
    // Send a POST request to your Cloudflare Worker endpoint
    const response = await fetch("https://chatbot.seanheller.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: messages }),
    });

    const data = await response.json();

    // Remove the loading message
    chatWindow.removeChild(chatWindow.lastChild);

    // Show the bot's response, or an error if something went wrong
    if (data.choices && data.choices[0] && data.choices[0].message) {
      // Show the bot's answer
      addMessage(data.choices[0].message.content, "bot");
      // Politely ask if the user needs more help
      addMessage("Is there anything else I can help you with?", "bot");
    } else if (data.error && data.error.message) {
      addMessage(
        `Error: ${data.error.message}. Please try again later.`,
        "bot"
      );
    } else {
      addMessage("Sorry, I could not get a response. Please try again.", "bot");
    }
  } catch (error) {
    // Remove the loading message
    chatWindow.removeChild(chatWindow.lastChild);
    // Show a clear error message for beginners
    addMessage(
      "Error connecting to the chatbot. Please try again later.",
      "bot"
    );
  }
});

// For students: You no longer need secrets.js or an API key in your browser. All requests go through your Cloudflare Worker.
