// to create new context menu, removing all existing context menu to avoid 'duplicate id not allowed' error
// because there is no way to get existing menu or menuid
chrome.contextMenus.removeAll();

const api_key = import.meta.env.VITE_OPENAI_API_KEY;

chrome.contextMenus.create(
  {
    contexts: ["selection"],
    title: "Explain about %s",
    id: "meaning_ai_42",
  },
  () => {
    if (chrome.runtime.lastError) {
      console.log("an error occured: \n", chrome.runtime.lastError.message);
    }
  }
);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log(info.selectionText);
  let port = null
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const [tab] = tabs
    port = chrome.tabs.connect(tab.id, {name: "meaning_ai_42"});
    
  });  

  (async () => {
    try {
      const APIbody = {
        model: "gpt-3.5-turbo-16k-0613",
        messages: [
          {
            role: "system",
            content:
              "Your task is to provide simple, clear and concise meaning, pronunciation, examples(only 2) in the following form:\nword\nmeaning:\npronunciation:\nexamples:\n",
          },
          {
            role: "user",
            content: info.selectionText,
          },
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${api_key}`,
        },
        body: JSON.stringify(APIbody),
      });

      const data = await res.json();
      console.log('before reading response message')
      const responseMessage = data.choices[0].message.content
      console.log(responseMessage)

      if(responseMessage){
        port.postMessage({result: responseMessage})    
      }

    } catch (err) {
      console.error("error catched:" + err);
    }
  })();
});

// support code
// put it inside onInstalled or onStart
// chrome.tabs.query({}, (tabs) => {
//   for(let i=0; i<tabs.length; i++){
//     chrome.tabs.reload(tabs[i].id)
//   }
// })
