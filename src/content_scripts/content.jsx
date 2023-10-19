import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./content.css";

const contentUIRoot = document.createElement("div");
contentUIRoot.className = "content-ui";
contentUIRoot.style.display = "none";

const ContentUI = () => {
  const [displayResultArr, setDisplayResultArr] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    document.addEventListener("click", () => {
      if (contentUIRoot.style.display !== "none") {
        contentUIRoot.style.display = "none";
        setDisplayResultArr([]);
      }
    });

    chrome.runtime.onConnect.addListener((port) => {
      console.log("connection established!");
      console.assert(port.name === "meaning_ai_conn_req");
      

      if (port.name === "meaning_ai_conn_req") {
        console.log("connection port established!");

        // making alive the contentUIRoot(root DOM of ContentUI)
        contentUIRoot.style.display = "flex";
        setLoadingStatus(true)
        
        port.onMessage.addListener((msg) => {
          console.log("message arrived!");
          setLoadingStatus(false)
          setDisplayResultArr(msg.result);
        });
      }
    });
  }, []);

  return (
    <div>
      {loadingStatus ? (
        <div className="loading-btn">Loading...</div>
      ) : displayResultArr.length > 1 ? (
        <ul className="contentUI">
          {" "}
          {displayResultArr.map((textLine) => (
            <li className="contentUI">{textLine}</li>
          ))}{" "}
        </ul>
      ) : (
        <p className="para">{displayResultArr[0]}</p>
      )}
    </div>
  );
};

document.body.insertBefore(contentUIRoot, document.body.firstChild);
console.log(ReactDOM.createRoot(contentUIRoot).render(<ContentUI />));
