"use strict";
// 1行目に記載している 'use strict' は削除しないでください

let apiKey = ""; //chatgpt api 用のキーを格納する。
const characterList = ["bird", "gollira", "girlfriend", "shiritori"];
//キャラクターに対応して名前を持たせる。
const characterName = {
  bird: "焼き鳥",
  gollira: "シャバーニ",
  girlfriend: "めるる",
  shiritori: "尻鳥",
};
let character = "bird"; //現在のキャラクター
let responseMode = "parrot"; //現在の応答モード"parrot"または"AI"

let numYourMessage = 0; //現在の相手からのメッセージの数。クロージャで関数の中に入れたい

/**
 * @param {string} message - トーク画面に表示するメッセージ
 * @param {string} who - 自分(me)または相手(you)どちらからのメッセージか
 * @returns {}
 *
 */

function displayMessage(message, who) {
  const talkContent = document.getElementById("line__contents scroll");
  let messageHtml;
  let now = new Date(); //送信時刻を入れるために現在時刻を取得する
  if (who === "me") {
    //自分のメッセージの場合
    messageHtml = `<div class="line__right">
    <div class="text">${message}</div>
    <span class="date">既読<br />${now.getHours()}:${now.getMinutes()}</span>
  </div>`;
  } else if (who === "you") {
    //相手のメッセージの場合
    messageHtml = `<div class="line__left">
          <figure  id = "fig${numYourMessage}">
            <img src="${character}.png" class = "yourFigure"/>
            <ul class = "figSelectNone" id = "message${numYourMessage}">
              <img src = "bird.png" class = "birdSwitch"/>
              <img src = "gollira.png" class = "golliraSwitch"/>
              <img src = "girlfriend.png" class = "girlfriendSwitch"/>
              <img src = "shiritori.png" class = "shiritoriSwitch"/>
              <input type = "submit" id = "toggle${numYourMessage}" value = "${responseMode}">
            </ul>
          </figure>
          <div class="line__left-text">
            <div class="name">${characterName[character]}</div>
            <div class="text">${message}</div>
          </div>
        </div>`;
  }
  talkContent.insertAdjacentHTML("beforeend", messageHtml); //生成したhtmlをトーク画面に挿入する。
}

/**
 * @param {string} message - chatgpt api に投げる文章
 * @returns {string} chatgptが生成した文章
 *
 */

async function generateAiMessage(message) {
  if (apiKey == "") {
    //apiが復号化されているかどうかの確認
    return "APIキーが暗号化されております。PASS=XXXの形でパスワードを入れてね。";
  }
  //chatgpt の性格をキャラクターごとに設定する
  const characterOrder = {
    bird: "あなたは鳥です。語尾にクエをつけて話します。100字以内で回答してください。",
    gollira:
      "あなたはゴリラです。語尾にゴリをつけて話します。筋肉に関係する話を多くします。100字以内で回答してください。",
    girlfriend:
      "あたたは私の彼女です。私のことをさとしと呼び、愛しているかのような回答をしてください。たまに毒を吐きます。絵文字を多用します。100字以内で回答してください。",
    shiritori:
      "あなたはしりとりのプロです。与えられた単語の最後の文字から始まる単語を返してください。たまに語尾が「ん」となる単語を返します。100字以内で回答してください。",
  };

  const chatgptResponse = await fetch(
    //chtgpt にメッセージを生成させる。
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
        max_tokens: 100,
        temperature: 1,
        n: 1,
      }),
    }
  );
  const responseJson = await chatgptResponse.json();

  return await responseJson;
}

/**
 * @param {string} message - 読み上げさせたい文章
 *
 */
function speakStart(message) {
  const uttr = new SpeechSynthesisUtterance(message);
  speechSynthesis.speak(uttr);
}

/**
 * @param {object} element - イベントリスナーが発火した時の情報
 *
 */

function showBalloon(element) {
  let objBalloon = document.getElementById(
    element.srcElement.nextElementSibling.id //押されたアイコンのidを特定する
  );
  if (objBalloon.className == "figSelectNone") {
    //吹き出しの表示、非表示を切り替える
    objBalloon.className = "figSelect";
  } else {
    objBalloon.className = "figSelectNone";
  }
}

/**
 * @param {string} givenMessage - 応答処理をさせたい文章
 * @param {boolean} fromMe - 自分からのメッセージかどうかを表す
 */

//文章に対して、応答文の生成、表示、読み上げを行うメイン処理
async function executeResponse(givenMessage, fromMe = true) {
  let yourMessage;
  if (fromMe) {
    //自分からのメッセージの場合
    if (givenMessage.includes("PASS")) {
      //chatgpt apiキーを復号化するためのパスワードが入力された場合
      const passPhrase = givenMessage.split("=")[1]; //=よりも後ろの文字列を取得
      const encryptedTxt =
        "U2FsdGVkX1++Zm8XvxVRIRXq4j7/EsyxzYz76vdXqeip09KGJfLVmG2JCTbaCEmKXXpw3UumolC2QGUBha5Mw/Btm19R9nWbl+xrvLZlLjE="; //あらかじめパスワードを使ってapiキーを暗号化したテキスト
      apiKey = CryptoJS.AES.decrypt(encryptedTxt, passPhrase).toString(
        CryptoJS.enc.Utf8
      ); //復号化
      console.log(apiKey);
      yourMessage = "APIKEYをいただきました。";
    } else {
      displayMessage(givenMessage, "me");
      if (responseMode === "parrot") {
        //オウム返しの場合
        if (character === "girlfriend") {
          yourMessage = givenMessage + "、さとし";
        } else {
          yourMessage = givenMessage;
        }
      } else if (responseMode === "AI") {
        //AIによって応答文を生成する場合
        const response = await generateAiMessage(givenMessage);
        if (typeof response == "string") {
          //APIキーが復号化されていない場合
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
  displayMessage(yourMessage, "you"); //相手のメッセージ表示
  speakStart(yourMessage); //相手のメッセージを読み上げ
  let yourFigureElements = document.getElementsByClassName("yourFigure");
  yourFigureElements[++numYourMessage].addEventListener("click", showBalloon); //相手のアイコンにイベントリスナーを追加する。どのアイコンを押しても反応するように都度セットする。
  for (const chara of characterList) {
    //アイコンから表示された吹き出し中のアイコンにイベントリスナーを追加する(キャラクター変更用)。
    let figureElement = document.getElementsByClassName(chara + "Switch");
    console.log(figureElement);
    figureElement[figureElement.length - 1].addEventListener(
      "click",
      changeCharacter
    );
  }
  //相手のメッセージが生成されるたびにオウム返しorAIのトグルスイッチが生まれるので処理を紐づける
  const toggle = document.querySelector(`#toggle${numYourMessage - 1}`);

  toggle.addEventListener("click", function () {
    if (responseMode === "AI") {
      responseMode = "parrot";
    } else {
      responseMode = "AI";
    }
    for (let i = 0; i <= numYourMessage - 1; i++) {
      const oldToggle = document.querySelector(`#toggle${i}`); //既存のトグルスイッチの表示をすべて更新する
      oldToggle.value = responseMode;
    }
  });
}

/**
 * @param {}
 * @returns {}
 *
 */
function recordStart() {
  //音声入力用の関数
  let SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.onresult = (event) => {
    executeResponse(event.results[0][0].transcript);
  };
  recognition.start(recognition);
}

/**
 * @param {}
 * @returns {}
 *
 */

function sendMessage() {
  //メッセージを送るボタンを押された時の処理
  let inputText = document.getElementById("textMessage"); //テキストボックスの中身を取得する
  executeResponse(inputText.value);
  inputText.value = "";
}

/**
 * @param {object} element - イベントリスナーが発火した時の情報
 * @returns {}
 *
 */
function changeCharacter(element) {
  //キャラクターが変わった時の挨拶文を用意しておく。
  const greetingMessage = {
    bird: "よろしくクエ",
    gollira: "やっと出られたウホ。俺様を呼んだのはお前かウホ。",
    girlfriend: "さとし、、遅かったね。。。",
    shiritori: "しりとり勝負だ",
  };
  console.log("aa", element.srcElement.className);
  character = element.srcElement.className.slice(0, -6); //押されたキャラクターを特定する

  executeResponse(greetingMessage[character], false);

  console.log(element.srcElement.offsetParent.id);
  let objBalloon = document.getElementById(element.srcElement.offsetParent.id);
  objBalloon.className = "figSelectNone"; //キャラクターが決定されたら吹き出しも自動的に閉じるようにする。
}

//chatgpt API キーを暗号化する。(chatgptのAPI キーをgitに上げたら一瞬で無効化されたため)
//暗号化コード
//const passPhrase = "秘密"; //秘密
//const targetTxt = "chatgpt APIキー";
//const encryptedTxt = CryptoJS.AES.encrypt(targetTxt, passPhrase);
//console.log(encryptedTxt.toString());
