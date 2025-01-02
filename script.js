const apiKey = "8652002816c1d2886e56e108754b1815";
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");

let state = "greeting";
let journeyType = "";
let weatherPreference = "";

// Display message function
function displayMessage(text, sender) {
  const messageBubble = document.createElement("div");
  messageBubble.classList.add("chat-bubble", sender);
  messageBubble.textContent = text;
  chatMessages.appendChild(messageBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing animation
let typingBubble = null; // Ensure only one animation is shown at a time
function showTypingAnimation() {
  if (typingBubble) return; // Prevent multiple typing animations

  typingBubble = document.createElement("div");
  typingBubble.classList.add("chat-bubble", "bot", "typing-animation");
  typingBubble.innerHTML = `<span></span><span></span><span></span>`;
  chatMessages.appendChild(typingBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing animation
function hideTypingAnimation() {
  if (typingBubble) {
    typingBubble.remove();
    typingBubble = null;
  }
}

// Display bot message with animation
function showBotResponseWithDelay(text, delay = 2000) {
  showTypingAnimation();
  setTimeout(() => {
    hideTypingAnimation();
    displayMessage(text, "bot");
  }, delay);
}

// Display options as buttons
function displayOptions(options) {
  const optionsContainer = document.createElement("div");
  optionsContainer.classList.add("options-container");

  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option.label;
    button.classList.add("option-button");
    button.setAttribute("data-option", option.value);
    button.addEventListener("click", () => {
      journeyType = option.value;
      displayMessage(`${journeyType}`, "user");
      optionsContainer.remove();
      askWeatherPreference();
    });
    optionsContainer.appendChild(button);
  });

  chatMessages.appendChild(optionsContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Ask for weather preference
function askWeatherPreference() {
  showBotResponseWithDelay("What kind of weather do you prefer? Sunny, Rainy, or Cold?");
  state = "weather";
}
displayMessage("Hello! I'm your travel buddy.", "bot");
// Handle user response
function handleResponse(input) {
  input = input.toLowerCase();
  

  if (state === "greeting") {
    displayMessage("What type of journey do you prefer?", "bot"); // No animation here
    const journeyOptions = [
      { label: "Adventure", value: "adventure" },
      { label: "Beach", value: "beach" },
      { label: "Cultural", value: "cultural" },
    ];
    displayOptions(journeyOptions);
    state = "journey";
  } else if (state === "weather") {
    weatherPreference = input;
    showBotResponseWithDelay(`You prefer ${weatherPreference} weather. Let me suggest some places...`);
    suggestPlaces();
    state = "suggestion";
  } else if (state === "complete") {
    showBotResponseWithDelay("Feel free to ask about other journeys or destinations!");
    state = "journey";
  }
}

// Suggest places based on user journey type and weather preference
function suggestPlaces() {
  const placeSuggestions = {
    adventure: ["manali", "ladakh", "switzerland", "costa rica", "new zealand", "patagonia", "himalaya", "machu picchu", "queenstown"],
    beach: ["goa", "pondicherry", "maldives", "bora bora", "phuket", "maui", "bondi beach", "santorini", "barbados"],
    cultural: ["hampi", "khajuraho", "rajasthan", "tamilnadu", "rome", "cairo", "istanbul", "athens", "varanasi"],
  };

  // Randomly select 2 places
  const places = placeSuggestions[journeyType];
  const randomPlaces = places.sort(() => 0.5 - Math.random()).slice(0, 2);

  // Add typing animation before showing suggestions
  showTypingAnimation();
  setTimeout(() => {
    hideTypingAnimation();
    randomPlaces.forEach((place) => {
      const placeContainer = document.createElement("div");
      placeContainer.classList.add("place-container");

      // Create image element with a fixed size and blue background mask
      const image = document.createElement("img");
      image.src = `images/${place}.jpg`;
      image.alt = place;
      placeContainer.appendChild(image);

      const placeName = document.createElement("p");
      placeName.textContent = `How about ${place.charAt(0).toUpperCase() + place.slice(1)}?`;
      placeName.classList.add("place-name");
      placeContainer.appendChild(placeName);

      // Add click event to fetch weather
      placeContainer.addEventListener("click", () => {
        getWeatherDetails(place);
      });

      chatMessages.appendChild(placeContainer);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }, 2000); // Simulate 2 seconds typing time
}

// Fetch weather details for selected place
// Update weather details styling
async function getWeatherDetails(place) {
  showBotResponseWithDelay("Let me check the weather details for you...");
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${apiKey}&units=metric`);
    const data = await response.json();

    setTimeout(() => {
      // Construct the weather details with newlines
      const weatherDetails = 
        `🌍 ${place.charAt(0).toUpperCase() + place.slice(1)} Weather Details:\n` +
        `🌡️ Temperature: ${data.main.temp}°C\n` +
        `💧 Humidity: ${data.main.humidity}%\n` +
        `🌤️ Weather: ${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}`;

      // Display the formatted weather details
      displayMessage(weatherDetails, "bot");

      // Ask if the user wants to continue
      askIfContinue();
    }, 2000); // Simulate 2 seconds delay
  } catch (error) {
    console.error(`Error fetching weather for ${place}:`, error);
    displayMessage("Sorry, I couldn't fetch the weather details right now.", "bot");
    askIfContinue();
  }
}



// Add "Enter" key functionality
userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendButton.click(); // Trigger the click event of the send button
  }
});


// Ask if the user wants to continue
function askIfContinue() {
  showBotResponseWithDelay("Would you like to continue? (yes or no)");
  state = "continue";
}

// Handle "yes" or "no" responses to continue or end
function handleContinueResponse(input) {
  input = input.toLowerCase();
  if (input === "yes") {
    askWeatherPreference();
  } else {
    showBotResponseWithDelay("Goodbye! Have a great day!");
    state = "greeting"; // Reset to greeting state
  }
}

// Handle button click and responses
sendButton.addEventListener("click", () => {
  const message = userInput.value.trim();
  if (message) {
    displayMessage(message, "user");
    userInput.value = "";
    setTimeout(() => {
      if (state === "continue") {
        handleContinueResponse(message);
      } else {
        handleResponse(message);
      }
    }, 1000);
  }
});

// Initialize chatbot
handleResponse("");
