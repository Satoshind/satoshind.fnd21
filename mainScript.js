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
const numPict = 10; // 写真の枚数
var tmp = {};
loadImageToTmp();
function loadImageToTmp() {
  for (let i = 1; i <= numPict; i++) {
    const img = new Image();
    tmp[i] = null;
    img.src = "anim/img" + i + ".png"; 
    img.addEventListener("load", () => {
      tmp[i] = img;
    });
  }
}

const pix = 20; 
const offset = $(document.getElementById("anim_img_box")).offset();
console.log(offset);
$(window).scroll(function () {
  const y = $(window).scrollTop();
  const dy = y - offset.top;
  if (offset.top < y && y < offset.top + numPict * pix) {
    $("anim_img_box").css("top", 0);
    const i = Math.floor(dy / pix);
    if (i > 0 || i < numPict) {
      if (tmp[i].src) {
        image.src = tmp[i].src;
      }
    }
  } else if (y >= offset.top + numPict * pix) {
    $("anim_img_box").css("top", "-" + (dy - numPict * pix)); 
  }
});
