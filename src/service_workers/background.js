
const refreshTabs = () => {
  chrome.tabs.query({}, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      chrome.tabs.reload(tabs[i].id);
    }
  });
};

chrome.runtime.onInstalled.addListener(() => refreshTabs());
chrome.runtime.onStartup.addListener(() => refreshTabs())

// to create new context menu, removing all existing context menu to avoid 'duplicate id not allowed' error
// because there is no way to get existing menu or menuid
chrome.contextMenus.removeAll();


chrome.contextMenus.create(
  {
    contexts: ["selection"],
    title: "chatGPT: word(s)",
    id: "meaning_ai_chatgpt_word",
  },
  () => {
    if (chrome.runtime.lastError) {
      console.log("an error occured: \n", chrome.runtime.lastError.message);
    }
  }
);

chrome.contextMenus.create(
  {
    contexts: ["selection"],
    title: "ChatGPT: sentence(limit 50 words)",
    id: "meaning_ai_chatgpt_sentence",
  },
  () => {
    if (chrome.runtime.lastError) {
      console.log("an error occured: \n", chrome.runtime.lastError.message);
    }
  }
);

chrome.contextMenus.create(
  {
    contexts: ["selection"],
    title: "Dict(Fast response): Word",
    id: "meaning_ai_Dict",
  },
  () => {
    if (chrome.runtime.lastError) {
      console.log("an error occured: \n", chrome.runtime.lastError.message);
    }
  }
);


// fetching ChatGPT response

const chatGptResponse = async (inputToken, api_key, word) => {
  const instruction = {
    word: "Your task is to provide simple, clear and concise meaning, pronunciation, examples(only 2) in the following form:\nword\nmeaning:\npronunciation:\nexamples:\n",
    sentence: "Translate the following sentence into simple, concise, and easy-to-understand language."
  }
  try {
    const APIbody = {
      model: "gpt-3.5-turbo-16k-0613",
      messages: [
        {
          role: "system",
          content: word ? instruction.word : instruction.sentence,
        },
        {
          role: "user",
          content: inputToken,
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
        Authorization: `Bearer ${api_key}`,
      },
      body: JSON.stringify(APIbody),
    });
    if(res.status !== 200){
      if(res.status === 503){
        return `Sorry! ChatGpt server didn't responded properly (status code: ${res.status}).\nPlease try again!`
      } else {
        return `Some Error occured (status code: ${res.status})!\nPlease try again!`
      }
    }
    const data = await res.json();
    // console.log("before reading response message");
    // console.log(data)
    const responseMessage = await data.choices[0].message.content;
    console.log(responseMessage);

    return responseMessage;

  } catch (err) {
    console.error("error catched:" + err);
  }
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const local_fetched_val = await chrome.storage.local.get([
    "MEANING_AI_SECRET_KEY",
  ]);
  const api_key = await local_fetched_val.MEANING_AI_SECRET_KEY;
  const selected_words_length = info.selectionText.split(" ").length

  if (api_key) {    
    let port = chrome.tabs.connect(tab.id, { name: "meaning_ai_conn_req" });
    // Logic of context Menus on their respective click event
    if (info.menuItemId === "meaning_ai_chatgpt_word") {
      if(selected_words_length>2){
        port.postMessage({result: ["ChatGPT: Word(s) only respond for Word.", "Try ChatGPT: Sentence"]})
        return;
      }
        // calling api
      const responseMessage = await chatGptResponse(info.selectionText, api_key, true);

      if (responseMessage) {
        port.postMessage({
          result: responseMessage.split("\n").filter((item) => !(item === "")),
        });
      }
    } else if(info.menuItemId === "meaning_ai_chatgpt_sentence"){
      if(selected_words_length>60){
        port.postMessage({result: ["ChatGPT: Sentence only respond for sentence having less than 50 words!", "Please try again!"]})
        return;
      }
      const responseMessage = await chatGptResponse(info.selectionText, api_key, false);

      if (responseMessage) {
        port.postMessage({
          result: [responseMessage],
        });
      }

    } else if (info.menuItemId === "meaning_ai_Dict") {
      const DictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${info.selectionText}`
      );

      if(DictRes.status === 200){
        const resBody = await DictRes.json();
        // console.log({ ...resBody[0] });
  
        const { word, meanings, phonetic, phonetics } = await { ...resBody[0] };
        
        const allMeanings = [];
        const allExamples = [];
  
        let count = 0;
        for(let entry of meanings){
          allMeanings.push(entry?.definitions[0]?.definition)
          allExamples.push(entry?.definitions[0]?.example)
          count++;
          if(count>1)
            break;
        }
        // handle error here -----
        port.postMessage({
          result: [
            `Word: ${word}`,
            `Pronunciation: ${phonetic || phonetics?.text}`,
            "Meanings:",
            ...allMeanings,
            "Examples:",
            ...allExamples,
          ],
        });
      } else if(DictRes.status === 404){
        port.postMessage({result: [`Sorry! No definition found for "${info.selectionText}"`]})
      }
    }
  } else {
    console.log("please enter API key first");

    await chrome.notifications.create(
      "01234",
      {
        type: "basic",
        iconUrl: chrome.runtime.getURL("meaning_ai.png"),
        title: "OpenAI API Key",
        message: "Please authenticate yourself with your api key",
      },
      (notifications_id) =>
        setTimeout(() => chrome.notifications.clear(notifications_id), 5000)
    );
  }
});
