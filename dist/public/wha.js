"use strict";

const socket = io();
const ContenQr = document.getElementById('contenQr');
const img = document.getElementById('img');
const instancia = document.getElementById('instancia');

window.onload = function () {
  let valor = instancia.value;

  if (valor != null && valor.length != 0) {
    alert("text1");
  } else {// img.src = './img/whatsapp.png' 
  }
};

instancia.addEventListener('change', function () {
  console.log("change"); //     ContenQr.innerHTML = `<div class="spinner-border text-success" role="status">
  //     <span class="visually-hidden">Loading...</span>
  //   </div>`

  let data = instancia.value;
  socket.emit('change_intance', data);
});
socket.on('qr:', data => {
  console.log(data);
  let valor = instancia.value;

  if (valor != null && valor.length != 0) {
    // ContenQr.innerHTML = ``
    img.src = ``;
    img.src = './img/out.svg';
  } else {
    img.src = './img/whatsapp.png';
  }
});