import { useEffect, useState } from "react";

function App() {
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState(false);
  const [expiredTokenMsg, setExpiredTokenMsg] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false)

  // validating API key here
  const validateOpenAiApi = async (local_fetched_api_key) => {
    return await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${local_fetched_api_key}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-16k-0613",
        messages: [
          {
            role: "user",
            content: "Hi chatGpt",
          },
        ],
      }),
    });
  };

  // form submit
  const onSubmit = async (event) => {
    event.preventDefault();
    setError(false)
    setExpiredTokenMsg(false)
    setIsSubmitted(true)

    // validating API key
    console.log(apiKeyValue);
    const response = await validateOpenAiApi(apiKeyValue);
    if (response.ok) {
      await chrome.storage.local.set({
        MEANING_AI_SECRET_KEY: apiKeyValue,
      });

      setLoggedIn(true);
      setError(false);

      chrome.runtime.reload();
    } else {
      if (response.status === 429) {
        setExpiredTokenMsg(true);
      }
      setError(true);
    }

    event.target.reset();
    setIsSubmitted(false)
  };

  // handling logout here..
  const handleLogout = async (event) => {
    setLoggedIn(false);
    await chrome.storage.local.clear();
    chrome.runtime.reload();
  };

  // use Effect hook
  useEffect(async () => {
// handle instant calling of api at frequent continuous pop up action. this leads to 
// error of status code 429(too many request).

    const local_api_key = await chrome.storage.local.get([
      "MEANING_AI_SECRET_KEY",
    ]);
    setLoggedIn(true);

    if (local_api_key) {
      const response = await validateOpenAiApi(
        local_api_key.MEANING_AI_SECRET_KEY
      );
      if (!response.ok) {
        setLoggedIn(false);
      }
    }
  }, []);

  return (
    <main className="main">
      {/* <img src="/dog.png" className={styles.icon} /> */}
      {isLoggedIn ? (
        <div className="dashboard">
          <p>You have login successfully!</p>
          <button onClick={handleLogout} className="logout">
            Logout
          </button>
        </div>
      ) : (
        <>
          <h3>Enter your chatGPT API key</h3>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="animal"
              placeholder="looks similar like: sk-**...**"
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue(e.target.value)}
            />
            <input type="submit" value={isSubmitted ? "Authenticating..." : "Submit Key"} />
          </form>
          {error && <div className="error-msg">Error: Please enter valid API key.</div>}
          {expiredTokenMsg && (
            <div className="error-msg">
              you have exceeded the rate limit for the API. <span>Check your credit remaining{" "}
              <a
                href="https://platform.openai.com/account/billing/overview"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              </span>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default App;
