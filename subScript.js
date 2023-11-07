"use strict";
// 1行目に記載している 'use strict' は削除しないでください
let apiKey = "";
const characterList = ["bird", "gollira", "girlfriend", "shiritori"];
const characterName = {
  bird: "焼き鳥",
  gollira: "シャバーニ",
  girlfriend: "めるる",
  shiritori: "尻鳥",
};
let character = "bird"; //bird,gollira,girlfriend,shiritori
let responseMode = "parrot"; //"parrot","AI"
let yourFigureElements = document.getElementsByClassName("yourFigure");
yourFigureElements[0].addEventListener("click", console.log);
let numYourMessage = 0; //いつか直す

function displayMessage(message, who) {
  const talkContent = document.getElementById("line__contents scroll");
  let messageHtml;
  let now = new Date();
  if (who === "me") {
    messageHtml = `<div class="line__right">
    <div class="text">${message}</div>
    <span class="date">既読<br />${now.getHours()}:${now.getMinutes()}</span>
  </div>`;
  } else if (who === "you") {
    messageHtml = `<div class="line__left">
          <figure  id = "fig${numYourMessage}">
            <img src="${character}.png" class = "yourFigure"/>
            <ul class = "figSelectNone" id = "message${numYourMessage}">
            <img src = "bird.png" class = "birdSwitch"/>
            <img src = "gollira.png" class = "golliraSwitch"/>
            <img src = "girlfriend.png" class = "girlfriendSwitch"/>
            <img src = "shiritori.png" class = "shiritoriSwitch"/>
            <div class="toggle">
            <input type="checkbox" name="check"/>
            <span>無能</span>
            <span>知能</span>
            </div>
            </ul>
          </figure>
          <div class="line__left-text">
            <div class="name">${characterName[character]}</div>
            <div class="text">${message}</div>
          </div>
        </div>`;
  }
  talkContent.insertAdjacentHTML("beforeend", messageHtml);

  $(".toggle").on("click", function () {
    $(".toggle").toggleClass("checked");
    if (!$('input[name="check"]').prop("checked")) {
      $(".toggle input").prop("checked", true);
      responseMode = "AI";
    } else {
      $(".toggle input").prop("checked", false);
      responseMode = "parrot";
    }
  });
}

async function generateAiMessage(message) {
  if (apiKey == "") {
    return "APIキーが入力されていません。";
  }
  const characterOrder = {
    bird: "あなたは鳥です。語尾にクエをつけて話します。",
    gollira:
      "あなたはゴリラです。語尾にゴリをつけて話します。筋肉に関係する話を多くします。",
    girlfriend:
      "あたたは私の彼女です。私のことをさとしと呼び、愛しているかのような回答をしてください。たまに毒を吐きます。絵文字を多用します。",
    shiritori:
      "あなたはしりとりのプロです。与えられた単語の最後の文字から始まる単語を返してください。たまに語尾が「ん」となる単語を返します。",
  };

  const chatgptResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: characterOrder[character],
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 200,
        temperature: 1,
        n: 1,
      }),
    }
  );
  const responseJson = await chatgptResponse.json();

  return await responseJson;
}

function speakStart(message) {
  const uttr = new SpeechSynthesisUtterance(message);
  speechSynthesis.speak(uttr);
}

function showBalloon(element) {
  let objBalloon = document.getElementById(
    element.srcElement.nextElementSibling.id
  );
  if (objBalloon.className == "figSelectNone") {
    objBalloon.className = "figSelect";
  } else {
    objBalloon.className = "figSelectNone";
  }
}

async function executeResponse(givenMessage, fromMe = true) {
  let yourMessage;
  if (fromMe) {
    if (givenMessage.includes("APIKEY")) {
      apiKey = givenMessage.split("=")[1];
      console.log(apiKey);
      yourMessage = "APIKEYをいただきました。";
    } else {
      displayMessage(givenMessage, "me");
      if (responseMode === "parrot") {
        if (character === "girlfriend") {
          yourMessage = givenMessage + "、さとし";
        } else {
          yourMessage = givenMessage;
        }
      } else if (responseMode === "AI") {
        const response = await generateAiMessage(givenMessage);
        if (typeof response == "string") {
          yourMessage = response;
        } else {
          yourMessage = await response.choices[0].message.content;
        }
        console.log(yourMessage);
      }
    }
  } else {
    yourMessage = givenMessage;
  }
  displayMessage(yourMessage, "you");
  speakStart(yourMessage);
  yourFigureElements = document.getElementsByClassName("yourFigure");
  yourFigureElements[++numYourMessage].addEventListener("click", showBalloon);
  for (const chara of characterList) {
    let figureElement = document.getElementsByClassName(chara + "Switch");
    console.log(figureElement);
    figureElement[figureElement.length - 1].addEventListener(
      "click",
      changeCharacter
    );
  }
}

function recordStart() {
  let SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.onresult = (event) => {
    executeResponse(event.results[0][0].transcript);
  };
  recognition.start(recognition);
}

function sendMessage() {
  let inputText = document.getElementById("textMessage");
  executeResponse(inputText.value);
  inputText.value = "";
}

function changeCharacter(element) {
  const greetingMessage = {
    bird: "よろしくクエ",
    gollira: "やっと出られたウホ。俺様を呼んだのはお前かウホ。",
    girlfriend: "さとし、、遅かったね。。。",
    shiritori: "しりとり勝負だ",
  };
  console.log("aa", element.srcElement.className);
  character = element.srcElement.className.slice(0, -6);

  executeResponse(greetingMessage[character], false);

  console.log(element.srcElement.offsetParent.id);
  let objBalloon = document.getElementById(element.srcElement.offsetParent.id);
  objBalloon.className = "figSelectNone";
}
