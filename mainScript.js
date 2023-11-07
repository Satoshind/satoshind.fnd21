"use strict";
// 1行目に記載している 'use strict' は削除しないでください

$(document).ready(function () {
  $(window).on("scroll", function () {
    $(".fadeInBefore").each(function () {
      let itemHeight = $(this).offset().top;
      let scrollFromTop = $(window).scrollTop();
      let windowHeight = $(window).height();
      if (itemHeight < scrollFromTop + windowHeight * 0.6) {
        $(this).addClass("fadeInAfter");
      } else {
        $(this).removeClass("fadeInAfter");
      }
    });
  });
});

const image = document.getElementById("anim_img");
const SIZE = 10; // 枚数
var tmp = {};
loadImageToTmp();
function loadImageToTmp() {
  for (var i = 1; i <= SIZE; i++) {
    const _i = i;
    const img = new Image();
    tmp[_i] = null;
    img.src = "anim/img" + _i + ".png"; // 連続するファイル名
    img.addEventListener("load", () => {
      tmp[_i] = img;
    });
  }
}

const PX = 20; // 5px分の移動ごと画像を1枚進める
const offset = $(document.getElementById("anim_img_box")).offset(); // 画像を入れるdiv要素(position:stickyでトップに来たら固定される)
console.log(offset);
$(window).scroll(function () {
  const y = $(window).scrollTop();
  const dy = y - offset.top;
  if (offset.top < y && y < offset.top + SIZE * PX) {
    $("anim_img_box").css("top", 0);
    const i = Math.floor(dy / PX);
    if (i > 0 || i < SIZE) {
      if (tmp[i].src) {
        image.src = tmp[i].src;
      }
    }
  } else if (y >= offset.top + SIZE * PX) {
    $("anim_img_box").css("top", "-" + (dy - SIZE * PX)); // スクロール分が終了したときに移動を始める
  }
});
