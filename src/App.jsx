import { useState } from "react";

function App() {
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [isLogIn, setLogIn] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    setLogIn(true);
  };
  return (
    <main className="main">
      {/* <img src="/dog.png" className={styles.icon} /> */}
      {isLogIn ? (
        <p>You have login successfully!</p>
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
            <input type="submit" value="Generate names" />
          </form>
        </>
      )}
    </main>
  );
}

export default App;
