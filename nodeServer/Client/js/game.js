const axiosInstance = axios.create({
  withCredentials: true
});

const socket = io();
let currentTurn = ID.PLAYER1;
let checkedPlayerId = "";//store playerid of who is in check
let recentMove = { oldPos: "", newPos: "" };//stores the recent move on board
let clickedPiece = null;
let draggedPiece = null;
//for timer
let timer = false;
let hour = 0o0; 
let minute = 0o0; 
let second = 0o0;

buildChessBoard();
showRoomCode();

//color board for current(default) theme
const themeSelect = document.getElementById('theme-select-board').value;
coloring(themeSelect, getPlayerId());

//Coloring the board on theme change
document.addEventListener('DOMContentLoaded', function () {
  const themeSelect = document.getElementById('theme-select-board');

  // Event listener for theme change
  themeSelect.addEventListener('change', function () {
    const selectedTheme = themeSelect.value;
    coloring(selectedTheme, getPlayerId());
  });


});

//Coloring the chat messages
document.addEventListener('DOMContentLoaded', function () {
  const themeSelectChat = document.getElementById('theme-select-board');

  // Event listener for theme change
  themeSelectChat.addEventListener('change', function () {
    const selectedTheme = themeSelectChat.value;
    coloringChat(selectedTheme);
  });

});

const themeSelectChat = document.getElementById('theme-select-board').value;
coloringChat(themeSelectChat);

socket.on("connect", () => {
  console.log("indexjs connected cid:", socket.id);

  if (sessionStorage.getItem("isCreator") == "true") {
    console.log("my uid is:", sessionStorage.getItem("uid"));
    socket.emit('createRoom', sessionStorage.getItem("createRoomId"),sessionStorage.getItem("playerID"));
  }
  else {
    console.log("my uid is:", sessionStorage.getItem("uid"));
    socket.emit('joinRoom', sessionStorage.getItem("joinRoomId"), sessionStorage.getItem("uid"));
  }
});

socket.on("uidPropogate", (uid_player2) => {
  console.log(uid_player2)
  if (sessionStorage.playerID == ID.PLAYER1) {
    sessionStorage.setItem("uid_opp", uid_player2);
  }
})

socket.on("startGame", () => {
  console.log("start game signal");
  //after game started apply drag and click to chess pieces
  applyDragEvent();
  applyClickEvent();

  //start timer
  timer = true; 
	stopWatch();
  setInterval(stopWatch, 1000); 

  //send undo request
  const undoBtn = document.getElementById('undoBtn');
  undoBtn.addEventListener('click', () => {
    socket.emit("undo", getPlayerId());
  });

  //send redo request
  const redoBtn = document.getElementById('redoBtn');
  redoBtn.addEventListener('click', () => {
    socket.emit("redo", getPlayerId());
  });

  //send resign request
  const resignBtn = document.getElementById('resignBtn');
  resignBtn.addEventListener('click', () => {
    socket.emit("resign", getPlayerId());
  });


  //send reset request
  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    socket.emit("reset", getPlayerId());
  });

});

const chatTextInput = document.querySelector(".text_input");
chatTextInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    socket.emit("chatText", getPlayerId(), chatTextInput.value);
    chatTextInput.value = "";//reset the text box
  }
})


socket.on("serverChatText", (playerId, msg) => {
  if (playerId == getPlayerId()) {
    console.log("Me:", msg);
    addMessage(msg, playerId);
  }
  else {
    console.log("Opponent:", msg);
    addMessage(msg, playerId);

  }
  const selectedTheme = document.getElementById('theme-select-board').value;
  coloringChat(selectedTheme);
})


socket.on("serverPieceMove", (playerId, pieceId, oldPosition, newPosition) => {

  playMoveSound();

  oldPosition = strPosition(oldPosition);
  newPosition = strPosition(newPosition);

  recentMove["oldPos"] = oldPosition;///////////
  recentMove["newPos"] = newPosition;///////////
  highlightRecentMove();

  let pieceToMove = document.getElementById(oldPosition).firstChild;
  let newSquare = document.getElementById(newPosition);

  let pieceKilled = false;
  //added to remove the piece if is killed
  if (newSquare.children.length != 0) {

    newSquare.removeChild(newSquare.firstChild);//kill(remove) piece
    pieceKilled = true;
    if (pieceKilled) {
      // Play capture sound
      playCaptureSound();
    }
  }

  newSquare.appendChild(pieceToMove);

  //print the move to the screen
  printMove(playerId, pieceId, newPosition, pieceKilled);

  //Check for pawn promotion logic
  checkPawnPromotion(pieceToMove);
})


socket.on("changeTurn", (currentTurnServer) => {
  currentTurn = currentTurnServer;
  console.log("change turn in client,currentTurn:", currentTurn);

  updateTurnIndicator();

  //reset the saved check playerId on turn
  checkedPlayerId = "";

  unHighlightCells();

  //TODO : need to handle undo and redo btn clickability

  ///code to check for checkmate status
  //if my turn then i will call check for checkmate

  ///code to check for checkmate status
  //if my turn then i will call check for checkmate
  if (currentTurn == getPlayerId()) {
    console.log("calling for checkmate req :", currentTurn);
    socket.emit("checkOrMateStatus", getPlayerId());
  }

});


socket.on("serverPieceFocus", (playerId, positionArray) => {

  if (getPlayerId() == playerId) {
    let validMovesArr = [];
    if (positionArray != null) {
      for (let pos of positionArray) {
        let strPos = strPosition(pos);
        validMovesArr.push(strPos);
      }
    }
    highlightCells(validMovesArr);
  }
})


socket.on("check", (playerId) => {
  //save checked playerId 
  checkedPlayerId = playerId;
  // Highlight the checked king square
  highlightCheck();

  //highlight in move table for check
  let moveTable = document.querySelector(".tableMoves");
  //if white player 
  if (playerId == ID.PLAYER1) { 
    if(moveTable.lastChild.lastChild.innerText.slice(-1) != "+" )
      moveTable.lastChild.lastChild.innerText += "+";
  }
  //if black player 
  else {
    if(moveTable.lastChild.children[1].innerText.slice(-1) != "+" )
      moveTable.lastChild.children[1].innerText += "+";
  }
  
})

//for closing dialogue boxes
const closeModal = document.getElementsByClassName("close");
for (let i = 0; i < closeModal.length; i++) {
  closeModal[i].onclick = function () {
    const modal = this.parentElement.parentElement; // Traverse up the DOM to modal
    modal.style.display = "none";
  };
}

//closing the AI chat modal
const closeAiModal = document.querySelector(".closeAiChat");
closeAiModal.onclick = function () {
  const modal = this.parentElement.parentElement; // Traverse up the DOM to modal
  modal.style.display = "none";
}

window.onclick = function (event) {
  const modal = document.querySelectorAll(".modal");
  for (let i = 0; i < modal.length; i++) {
    if (event.target == modal[i]) {
      modal[i].style.display = "none";
    }
  }
};


socket.on("checkMate", (playerId) => {
  let winner = playerId == ID.PLAYER1 ? "Black" : "White";
  let who = getPlayerId() == playerId ? "Opp" : "You";
  document.getElementById("modal-message").textContent = `${winner} (${who}) wins`;
  const modal = document.getElementById("myModal");
  modal.style.display = "block";
  document.querySelector('.container').style.pointerEvents = "none";
  playNotifySound();
  //make the timer stop
  timer=false;

  if (sessionStorage.playerID == ID.PLAYER1) {
    const data = {
      uid: sessionStorage.getItem("uid"),
      uid_opp: sessionStorage.getItem("uid_opp"),
      win: (who == 'You') ? 1 : 0,
    }
    console.log("data :", data);
    axiosInstance.post(`http://${SERVER_IP}:${N_PORT}/api/checkmate-update`, data)
      .then((response) => {
        if (response.status == 200) { }
      })
      .catch((error) => {
        console.log("Error:", error);
      })
  }
});

socket.on("staleMate", (playerId) => {
  document.getElementById("stale-message").textContent = `STALEMATE !!`;
  const modal = document.getElementById("modalStale");
  modal.style.display = "block";
  document.querySelector('.container').style.pointerEvents = "none";
  //make the timer stop
  timer=false;

  if (sessionStorage.playerID == ID.PLAYER1) {
    const data = {
      uid: sessionStorage.getItem("uid"),
      uid2: sessionStorage.getItem("uid_opp"),
    }

    axiosInstance.post(`http://${SERVER_IP}:${N_PORT}/api/stalemate-update`, data)
      .then((response) => {
        if (response.status == 200) { }
      })
      .catch((error) => {
        console.log("Error:", error);
      })
  }
});

socket.on('serverUndo', (playerId, pieceId, position, isDemoted, revivedPlayerId, revivedPieceId, revivedPosition) => {

  position = strPosition(position);
  //Logic to move the piece on undo
  document.querySelectorAll('.box img').forEach((piece) => {
    //logic to move back to old position by shifting old piece to new
    let color = (ID.PLAYER1 == playerId ? 'W' : 'B');
    if (piece.getAttribute('src')[7] == color && piece.getAttribute('pieceid') == pieceId) {
      let ourPiece = piece;
      piece.parentNode.removeChild(piece.parentNode.firstChild);

      let newSquare = document.getElementById(position);
      newSquare.appendChild(ourPiece);

      //if pawn promotion is undo'ed
      //need to change image back to pawn
      if (isDemoted == "yes") {
        let imageName = color + pieceId.substring(0, pieceId.length - 1);//remove pawnid end number.
        piece.setAttribute('src', `images/${imageName}.png`);
        //need to remove from alreadyPromPawn array
        socket.emit("getAlreadyPromotedPawnOf", playerId, (alreadyPromotedPawns) => {

          alreadyPromotedPawns = alreadyPromotedPawns.filter((ele) => {
            return ele != pieceId;
          })
          socket.emit("updateAlreadyPromotedPawnOf", playerId, alreadyPromotedPawns);
        })

      }

    }
  });

  //logic to revive killed piece if any
  if (revivedPieceId != 'NIL') {
    revivedPosition = strPosition(revivedPosition);
    let reviveSquare = document.getElementById(revivedPosition);
    let color = (ID.PLAYER1 == revivedPlayerId ? 'W' : 'B');
    let pieceType = revivedPieceId;

    if (revivedPieceId[revivedPieceId.length - 1] >= '1' && revivedPieceId[revivedPieceId.length - 1] <= '8') {
      pieceType = revivedPieceId.substring(0, revivedPieceId.length - 1);
    }
    //code written keeping in mind the async behaviour of nodejs
    if (pieceType == "pawn") {
      socket.emit("getAlreadyPromotedPawnOf", revivedPlayerId, (alreadyPromotedPawns) => {
        if (alreadyPromotedPawns.includes(revivedPieceId) == true) {
          pieceType = "queen";//revived player need to be given the promoted's image(currently queen)
          let imageName = color + pieceType;
          reviveSquare.innerHTML = `<img class='all-img all-pown' src='images/${imageName}.png' pieceid=${revivedPieceId} draggable='true' alt=''>`;
        }
        else {
          let imageName = color + pieceType;
          reviveSquare.innerHTML = `<img class='all-img all-pown' src='images/${imageName}.png' pieceid=${revivedPieceId} draggable='true' alt=''>`;
        }

        //if our piece only then add click event and drag event
        if (revivedPlayerId == getPlayerId()) {
          reviveSquare.firstChild.addEventListener('click', onPieceClick);

          reviveSquare.firstChild.addEventListener('dragstart', dragStart);
          reviveSquare.firstChild.addEventListener('dragend', dragEnd);
        }
      }
      )
    }
    else {
      let imageName = color + pieceType;
      reviveSquare.innerHTML = `<img class='all-img all-pown' src='images/${imageName}.png' pieceid=${revivedPieceId} draggable='true' alt=''>`;
      //if our piece only then add click event and drag event
      if (revivedPlayerId == getPlayerId()) {
        reviveSquare.firstChild.addEventListener('click', onPieceClick);

        reviveSquare.firstChild.addEventListener('dragstart', dragStart);
        reviveSquare.firstChild.addEventListener('dragend', dragEnd);
      }
    }

  }


  let moveTable = document.querySelector(".tableMoves");
  //if white player undo'ed:
  if (playerId == ID.PLAYER1) {
    moveTable.removeChild(moveTable.lastChild);
  }
  //if black player undo'ed:
  else {
    moveTable.lastChild.lastChild.innerText = "";
  }

})

socket.on('serverRedo', (playerId, pieceId, position, pawnPromoted, killedPlayerId, killedPieceId, killedPosition) => {
  //handle redo
  position = strPosition(position);
  //Logic to move the piece on undo
  document.querySelectorAll('.box img').forEach((piece) => {

    //logic to move back to old position by shifting old piece to new
    let color = (ID.PLAYER1 == playerId ? 'W' : 'B');
    if (piece.getAttribute('src')[7] == color && piece.getAttribute('pieceid') == pieceId) {
      if (killedPieceId != 'NIL') {
        killedPosition = strPosition(killedPosition);
        let killedSquare = document.getElementById(killedPosition);
        killedSquare.removeChild(killedSquare.firstChild);
      }


      let ourPiece = piece;
      piece.parentNode.removeChild(piece.parentNode.firstChild);

      let newSquare = document.getElementById(position);
      newSquare.appendChild(ourPiece);

      //if redo is of pawn promotion
      //need to change image back to Queen or etc.
      if (pawnPromoted == "yes") {
        let imageName = color + "queen";//remove pawnid end number.
        piece.setAttribute('src', `images/${imageName}.png`);
        //need to add to alreadyPromPawn array
        socket.emit("getAlreadyPromotedPawnOf", playerId, (alreadyPromotedPawns) => {
          alreadyPromotedPawns.push("pawn")
          socket.emit("updateAlreadyPromotedPawnOf", playerId, alreadyPromotedPawns);
        })
      }

    }
  });

})

socket.on('serverResign', (playerId) => {
  //handle resign
})
socket.on('serverReset', (playerId) => {

  //reset all variables
  currentTurn = ID.PLAYER1;
  checkedPlayerId = "";
  recentMove = { oldPos: "", newPos: "" };
  clickedPiece = null;
  draggedPiece = null;

  //remove all chesspiece images
  const pieces = document.querySelectorAll('.box img');
  pieces.forEach(piece => {
    piece.parentNode.removeChild(piece.parentNode.firstChild);
  });
  //reinsert
  document.querySelector('.container').style.pointerEvents = "all";
  insertChessPiece();
  applyClickEvent();
  applyDragEvent();

  let moveTable = document.querySelector(".tableMoves");
  while (moveTable.childElementCount > 1)
    moveTable.removeChild(moveTable.lastChild);

  unHighlightCells();
  updateTurnIndicator();

  //reset timer(keep it running)
  timer=true;
	hour = 0; 
	minute = 0; 
	second = 0; 
	document.getElementById('hr').innerHTML = "00"; 
	document.getElementById('min').innerHTML = "00"; 
	document.getElementById('sec').innerHTML = "00"; 
  
})

socket.on("serverPawnPromotion", (playerId, pieceId, position, newPieceId) => {
  //We need to convert piece of pieceid with newPieceId's image
  document.querySelectorAll('.box img').forEach((piece) => {
    let color = (ID.PLAYER1 == playerId ? 'W' : 'B');
    if (piece.getAttribute('src')[7] == color && piece.getAttribute('pieceid') == pieceId) {
      const imageName = `${color}${newPieceId}`;
      piece.setAttribute('src', `images/${imageName}.png`);//need to handle for pieceid's like rook1
      return;
    }
    //on promotion check the other player's check or mate or stalemate status
    if (getPlayerId() == playerId) {
      let opponentId = getPlayerId() == ID.PLAYER1 ? ID.PLAYER2 : ID.PLAYER1;
      socket.emit("checkOrMateStatus", opponentId);
    }
  });


})

/////////////////Main Logic Ends/////////////////////////////////////////////////////////////////////////////

function getPlayerId() {
  return sessionStorage.getItem("playerID");
}

function buildChessBoard() {
  let playerId = getPlayerId();

  if (playerId == ID.PLAYER1) {
    //if white
    for (let row = 8; row >= 1; row--) {
      buildLogic(row, playerId);
    }
  }
  else {
    //if black
    for (let row = 1; row <= 8; row++) {
      buildLogic(row, playerId);
    }
  }

  insertChessPiece();

  function buildLogic(row, playerId) {
    //create a div
    let rowDiv = document.createElement('div');
    rowDiv.className = 'div';
    rowDiv.id = `row${row}`;
    for (let i = 1; i <= 8; i++) {
      //ceate a newList ele
      let boxList = document.createElement('li');
      boxList.className = 'box';
      let colNum = (playerId == ID.PLAYER1 ? i : 9 - i);//if black column would be opposite 8,7...2,1
      boxList.id = `${row}${colNum}`;
      rowDiv.appendChild(boxList);
    }
    let boardUl = document.querySelector('ul');
    boardUl.appendChild(rowDiv);
  }

}

//inserting the piece images
function insertChessPiece() {
  document.querySelectorAll(".box").forEach((square) => {

    square.style.cursor = "pointer";

    let rowNum = eval(square.id[0]);

    if (rowNum == 1 || rowNum == 2 || rowNum == 7 || rowNum == 8) {
      let imageName = "";
      let pieceId = "";

      if (rowNum == 2) {
        imageName = "Wpawn";
        pieceId = "pawn" + square.id[1];
      }
      else if (rowNum == 7) {
        imageName = "Bpawn";
        pieceId = "pawn" + square.id[1];//black and white same pieceid??
      }

      else if (square.id == "11" || square.id == "18") {
        imageName = "Wrook";
        pieceId = "rook" + (square.id[1] == '1' ? "1" : "2");
      }
      else if (square.id == "12" || square.id == "17") {
        imageName = "Wknight";
        pieceId = "knight" + (square.id[1] == '2' ? "1" : "2");
      }
      else if (square.id == "13" || square.id == "16") {
        imageName = "Wbishop";
        pieceId = "bishop" + (square.id[1] == '3' ? "1" : "2");
      }


      else if (square.id == "81" || square.id == "88") {
        imageName = "Brook";
        pieceId = "rook" + (square.id[1] == '1' ? "1" : "2");
      }
      else if (square.id == "82" || square.id == "87") {
        imageName = "Bknight";
        pieceId = "knight" + (square.id[1] == '2' ? "1" : "2");
      }
      else if (square.id == "83" || square.id == "86") {
        imageName = "Bbishop";
        pieceId = "bishop" + (square.id[1] == '3' ? "1" : "2");
      }

      else if (square.id == "14") {
        imageName = "Wqueen";
        pieceId = "queen"
      }
      else if (square.id == "15") {
        imageName = "Wking"
        pieceId = "king"
      }
      else if (square.id == "84") {
        imageName = "Bqueen"
        pieceId = "queen"
      }
      else if (square.id == "85") {
        imageName = "Bking"
        pieceId = "king"
      }

      //dont know the meaning of class here
      square.innerHTML = `<img class='all-img all-pown' src='images/${imageName}.png' pieceid=${pieceId} draggable='true' alt=''>`;

    }
  });
}


function showRoomCode() {
  if (sessionStorage.getItem("isCreator") == "true") {
    document.getElementById("roomCode").innerText = sessionStorage.getItem("createRoomId");
  }
  else {
    document.getElementById("roomCode").innerText = sessionStorage.getItem("joinRoomId");
  }
}

// Function to apply selected theme
function coloring(theme) {
  const boxes = document.querySelectorAll('.box');
  boxes.forEach((box, index) => {
    const getId = box.id;
    const arr = Array.from(getId);
    const aside = eval(arr.pop());
    const aup = eval(arr.shift());
    const a = aside + aup;

    if ((a) % 2 == 0) {
      box.classList.remove('default-mode1', 'dark-mode1', 'light-mode1', 'red-mode1', 'blue-mode1', 'green-mode1', 'purple-mode1', 'magenta-mode1', 'orange-mode1');
      box.classList.add(theme + '-mode1');
    }
    else {
      box.classList.remove('dark-mode', 'light-mode', 'red-mode', 'blue-mode', 'green-mode', 'purple-mode', 'magenta-mode', 'orange-mode');
      box.classList.add(theme + '-mode');
    }
  });


  const Box1 = document.querySelector('.pBox1');
  const Box2 = document.querySelector('.pBox2');
  const Box3 = document.querySelector('.pBox3');
  const Box4 = document.querySelector('.pBox4');

  Box1.classList.remove('default-mode','dark-mode','light-mode','red-mode','blue-mode','green-mode','purple-mode','magenta-mode','orange-mode');
  Box1.classList.add(theme + "-mode");

  Box4.classList.remove('default-mode','dark-mode','light-mode','red-mode','blue-mode','green-mode','purple-mode','magenta-mode','orange-mode');
  Box4.classList.add(theme + "-mode");

  Box2.classList.remove('default-mode1','dark-mode1','light-mode1','red-mode1','blue-mode1','green-mode1','purple-mode1','magenta-mode1','orange-mode1');
  Box2.classList.add(theme + "-mode1");

  Box3.classList.remove('default-mode1','dark-mode1','light-mode1','red-mode1','blue-mode1','green-mode1','purple-mode1','magenta-mode1','orange-mode1');
  Box3.classList.add(theme + "-mode1");
}
// Function to apply selected theme
function coloringChat(theme) {
  const messages = document.querySelectorAll('.message');
  messages.forEach((message, index) => {
    const isLeftMessage = message.classList.contains('left');
    if (isLeftMessage) {
      message.classList.remove('default-mode1', 'dark-mode1', 'light-mode1', 'red-mode1', 'blue-mode1', 'green-mode1', 'purple-mode1', 'yellow-mode1', 'magenta-mode1', 'orange-mode1');
      message.classList.add(theme + '-mode1');
    } else {
      message.classList.remove('dark-mode', 'light-mode', 'red-mode', 'blue-mode', 'green-mode', 'purple-mode', 'yellow-mode', 'magenta-mode', 'orange-mode');
      message.classList.add(theme + '-mode');
    }
  });
}

function highlightCells(validMovesArr) {
  validMovesArr.forEach(pos => {
    const square = document.getElementById(pos);
    let color = (getPlayerId() == ID.PLAYER1 ? "W" : "B");
    //if opponent - color red; else yellow
    if (square.children.length != 0 && square.firstChild.getAttribute('src')[7] != color)
      square.style.backgroundColor = 'red';
    else
      square.style.backgroundColor = 'yellow';
  });

}
function unHighlightCells() {
  const squares = document.querySelectorAll('.box');
  squares.forEach(square => {
    square.style.backgroundColor = '';
  });

  highlightCheck();
  highlightRecentMove();
}

//Function for applying chesspiece drag events
function applyDragEvent() {
  const pieces = document.querySelectorAll('.box img');

  // Attach drag events to all only our chess pieces
  pieces.forEach(piece => {
    //if the piece image src is (same color 0:white & 1:black) then only add to the drag and click events
    let color = (getPlayerId() == ID.PLAYER1 ? "W" : "B");
    if (piece.getAttribute('src')[7] == color) {
      piece.addEventListener('dragstart', dragStart);
      piece.addEventListener('dragend', dragEnd);
    }

  });

  // Attach drop event to all chessboard squares on drag drop
  const squares = document.querySelectorAll('.box');
  squares.forEach(square => {
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', drop);
  });

}

//Function for applying chesspiece click events
function applyClickEvent() {
  const pieces = document.querySelectorAll('.box img');

  pieces.forEach(piece => {
    let color = (getPlayerId() == ID.PLAYER1 ? "W" : "B");
    if (piece.getAttribute('src')[7] == color) {
      piece.addEventListener('click', onPieceClick);
    }
  });

  //Attach drop event to all chessboard squares on click
  const squares = document.querySelectorAll('.box');
  squares.forEach(square => {
    square.addEventListener('click', function () {

      if (clickedPiece != null) {
        // If the square is empty or opponent piece, only then append the clicked piece

        //TODO: Emit move request  to server
        let oldPosition = clickedPiece.parentNode.id;
        let newPosition = this.id;
        let pieceId = clickedPiece.getAttribute('pieceid');

        console.log(getPlayerId(), pieceId, oldPosition, newPosition);

        socket.emit("pieceMove", getPlayerId(), pieceId, objPosition(oldPosition), objPosition(newPosition));
        clickedPiece.style.border = '';
        clickedPiece = null
        unHighlightCells();
      }
    });
  });

}
//Adds message to chatbox
function addMessage(message, playerId) {
  // Create a new list item for the message
  let newMessage = document.createElement('li');
  let alignment = (getPlayerId() == playerId ? "right" : "left");
  newMessage.className = 'message ' + alignment;

  // Create a paragraph element to hold the message text
  let messageText = document.createElement('p');
  messageText.textContent = message;

  // Append the message text to the new list item
  newMessage.appendChild(messageText);

  // Find the chat container and add the new message to it
  let chatContainer = document.querySelector('.chat');
  chatContainer.insertBefore(newMessage, chatContainer.firstChild);
}

function printMove(playerId, pieceId, newPosition, pieceKilled) {
  let moveTable = document.querySelector(".tableMoves");

  if (playerId == ID.PLAYER1) {
    let newEntry = document.createElement("tr");
    let indexCell = document.createElement("td");
    indexCell.textContent = moveTable.children.length;
    newEntry.appendChild(indexCell);

    let user1Cell = document.createElement("td");
    user1Cell.textContent = moveChessNotation(pieceId, newPosition, pieceKilled);
    newEntry.appendChild(user1Cell);

    let user2Cell = document.createElement("td");
    user2Cell.textContent = "  ";//empty for now
    newEntry.appendChild(user2Cell);

    // Append the new row to the table body
    moveTable.appendChild(newEntry);
  }
  else { //for Black
    let entry = moveTable.lastChild.lastChild;
    entry.textContent = moveChessNotation(pieceId, newPosition, pieceKilled);
  }
}

//Calculates the Moves notation for printing
//Assuming newPosition as string eg.: "24" or "58"
function moveChessNotation(pieceId, newPosition, pieceKilled) {
  let rowNum = newPosition[0];//string
  let colNum = newPosition[1];//string
  let colAlpha = String.fromCharCode(97 - 1 + eval(colNum));
  let newPosStr = colAlpha + rowNum
  let pieceKilledChar = (pieceKilled == true ? "x" : "")
  let pieceChar = "";

  switch (true) {
    case pieceId.startsWith("bishop"):
      pieceChar = "B";
      break;
    case pieceId.startsWith("knight"):
      pieceChar = "N";
      break;
    case pieceId.startsWith("rook"):
      pieceChar = "R";
      break;
    case pieceId.startsWith("queen"):
      pieceChar = "Q";
      break;
    case pieceId.startsWith("king"):
      pieceChar = "K";
      break;
    default:
      // Default empty eg. pawn
      pieceChar = "";
      break;
  }

  return pieceChar + pieceKilledChar + newPosStr;
}

//Function for checking and applying pawn Promotion
function checkPawnPromotion(piece) {
  const lastRank = (getPlayerId() == ID.PLAYER1 ? '8' : '1');
  const pieceId = piece.getAttribute('pieceid');
  const piecePos = piece.parentNode.getAttribute('id');
  const pieceRank = piecePos[0];
  if (pieceId.startsWith('pawn') && pieceRank == lastRank) {
    socket.emit("getAlreadyPromotedPawnOf", getPlayerId(), (alreadyPromotedPawns) => {
      if (alreadyPromotedPawns.includes(pieceId) == false) {
        alreadyPromotedPawns.push(pieceId);
        socket.emit("updateAlreadyPromotedPawnOf", getPlayerId(), alreadyPromotedPawns);
        socket.emit("pawnPromotion", getPlayerId(), pieceId, objPosition(piecePos), 'queen');
      }
    })


  }
}

function highlightCheck() {
  if (checkedPlayerId != "") {
    document.querySelectorAll('.box img').forEach((piece) => {
      let checkColor = (ID.PLAYER1 == checkedPlayerId ? 'W' : 'B');
      if (piece.getAttribute('src') == `images/${checkColor}king.png`) {
        piece.parentNode.style.backgroundColor = 'red';
      }
    });
  }
  else {
    //unhighlight both kings as not in check
    document.querySelectorAll('.box img').forEach((piece) => {
      if (piece.getAttribute('src') == `images/Wking.png` || piece.getAttribute('src') == `images/Bking.png`) {
        piece.parentNode.style.backgroundColor = '';
      }
    });

  }
}

function highlightRecentMove() {
  if (recentMove["oldPos"] == "" || recentMove["newPos"] == "")
    return;

  document.getElementById(recentMove["oldPos"]).style.backgroundColor = 'rgb(173, 216, 230)';
  document.getElementById(recentMove["newPos"]).style.backgroundColor = 'rgb(173, 216, 230)';
}

function dragStart(e) {
  draggedPiece = this;
  draggedPiece.style.border = '2px solid red';
  e.dataTransfer.setData('text/plain', ''); // Required for Firefox

  let pieceId = draggedPiece.getAttribute('pieceid');
  socket.emit("pieceFocus", getPlayerId(), pieceId);
}

function dragEnd(e) {
  draggedPiece.style.border = '';
  draggedPiece = null;
  unHighlightCells();
}

function dragOver(e) {
  e.preventDefault();
}

function drop() {
  if (draggedPiece) {

    let oldPosition = draggedPiece.parentNode.id;
    let newPosition = this.id;
    let pieceId = draggedPiece.getAttribute('pieceid');

    socket.emit("pieceMove", getPlayerId(), pieceId, objPosition(oldPosition), objPosition(newPosition));

  }
}

function onPieceClick(event) {

  if (this.style.border === '2px solid red') {
    // If already highlighted, remove the highlight(go back to default)
    this.style.border = '';
    clickedPiece = null;
    unHighlightCells();
  }
  else {
    if (clickedPiece != null) {
      //if already a piece is clicked and we choose another piece,then save & highlight newer (and remove older)
      clickedPiece.style = '';
      //assign curr as clicked piece
      this.style.border = '2px solid red';
      clickedPiece = this;
      unHighlightCells();
    }
    else {
      // If not highlighted, apply the highlight and save this piece
      this.style.border = '2px solid red';
      clickedPiece = this;
    }
    //highlight poss. moves
    let pieceId = clickedPiece.getAttribute('pieceid');
    socket.emit("pieceFocus", getPlayerId(), pieceId);
  }

  event.stopPropagation();
}

function updateTurnIndicator() {
  const whiteBoxes = document.querySelectorAll(".white_box");
  const blackBoxes = document.querySelectorAll(".black_box");

  if (currentTurn === ID.PLAYER1) {
    whiteBoxes.forEach(box => {
      box.classList.add("green_alert");
      box.classList.remove("red_alert");
    });
    blackBoxes.forEach(box => {
      box.classList.remove("green_alert");
      box.classList.add("red_alert");
    });
  }
  else {
    whiteBoxes.forEach(box => {
      box.classList.remove("green_alert");
      box.classList.add("red_alert");
    });
    blackBoxes.forEach(box => {
      box.classList.add("green_alert");
      box.classList.remove("red_alert");
    });
  }
}


function stopWatch() { 
	if (timer) { 
		second++; 

		if (second == 60) { 
			minute++; 
			second = 0; 
		} 

		if (minute == 60) { 
			hour++; 
			minute = 0; 
			second = 0; 
		} 

		let hrString = hour; 
		let minString = minute; 
		let secString = second;

		if (hour < 10) { 
			hrString = "0" + hrString; 
		} 

		if (minute < 10) { 
			minString = "0" + minString; 
		} 

		if (second < 10) { 
			secString = "0" + secString; 
		} 

		document.getElementById('hr').innerHTML = hrString; 
		document.getElementById('min').innerHTML = minString; 
		document.getElementById('sec').innerHTML = secString;  
	} 
}

//-------------------movement sound--------------------------------
// Function to play notify sound
function playNotifySound() {
  const notifySound = document.getElementById('notifySound');
  notifySound.play();
}

// Function to play move sound
function playMoveSound() {
  const moveSound = document.getElementById('moveSound');
  moveSound.play();
}

// Function to play capture sound
function playCaptureSound() {
  const captureSound = document.getElementById('captureSound');
  captureSound.play();
}

//-------------copy code--------------------------------

// document.addEventListener("DOMContentLoaded", ())
