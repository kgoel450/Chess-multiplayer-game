//ENUMS
const ID = Object.freeze({
  PLAYER1: "pl1",
  PLAYER2: "pl2"
});

const SERVER_IP = "localhost"
const N_PORT = "3000"

//convert position in objectform(server) into stringform(client)
function strPosition(positionObj) {
  return "" + positionObj.x + positionObj.y;
}

//convert position in objectform(server) into stringform(client)
function objPosition(positionStr) {
  return { x: eval(positionStr[0]), y: eval(positionStr[1]) };
}


function copyRoomCode() {
  
  //this command was deprecated,
  //TODO : find another command
  // navigator.clipboard.copy does not work on http, but only on https
  var roomCodeText = document.getElementById("roomCode").innerText;
  var input = document.createElement("input");
  input.value = roomCodeText;
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);

  new Notify({
    status: "success",
    title: "Copied",
    text: "room code : " + roomCodeText.toString(),
    effect: 'fade',
    speed: 400,
    customClass: '',
    customIcon: '',
    showIcon: true,
    showCloseButton: true,
    autoclose: true,
    autotimeout: 1000,
    notificationsGap: 1000,
    notificationsPadding: null,
    type: 'outline',
    position: 'right top',
    customWrapper: '',
  })
};

