
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require('dotenv').config();

var app = express();
app.use(express.json());
app.use(cookieParser());


var server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const authRouter = require("./routes/auth.js");
const statsRouter = require("./routes/stats.js")
const gameRouter = require("./routes/game.js")

app.use(cors({
  origin: process.env.SERVER_ADD,
  credentials : true,
}));

app.use(authRouter);
app.use(statsRouter);
app.use(gameRouter);
app.use(express.static(path.resolve(__dirname, "../Client")));

/////////////////////////////////////////////////////////////////////////////

const {ID} = require('./config/utils.js');
const {roomMap,roomState} = require('./gameContext');

const NodeCppHandler = require('./nodeCppHandler');
const nodeCppHandler = new NodeCppHandler(io);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on("roomExistsCheck", (joinRoomId, callback) => {
    //check if room exist of given 'joinRoomId'
    const roomsMap=io.sockets.adapter.rooms;
    const room=roomsMap.get(joinRoomId);
    let roomCodeExist = io.sockets.adapter.rooms.has(joinRoomId);
    let allUsers;
    let roomSizeExist=true;
    let roomExist;
        if(room){
            allUsers=room;
        }
        let numClients=0;
        if(allUsers){
            numClients=room.size;
        }
        if(numClients==0){
          roomSizeExist=false;
        }
        else if(numClients>1){
          roomSizeExist=false;
        }
        if(roomCodeExist==true && roomSizeExist==true)
          {
            roomExist=true;
          }
          else{
            roomExist=false;
          }
    let joinerPlayerId = "";
    //If room exist,then give the joiner the other playerID than creator's PlayerId
    if(roomSizeExist)
        joinerPlayerId = roomState[joinRoomId].creatorId == ID.PLAYER1 ? ID.PLAYER2:ID.PLAYER1;
    
    callback(roomSizeExist,joinerPlayerId);
  })
  
  socket.on('createRoom', (createRoomId,chosenPlayerId) => {
    socket.join(createRoomId);
    //save the client roomid in map
    roomMap[socket.id] = createRoomId;
    roomState[createRoomId]={};/////////
    roomState[createRoomId].creatorId= chosenPlayerId;//////////////
  });

  socket.on('joinRoom', (joinRoomId,uid) => {
    socket.join(joinRoomId);
    //save the client roomid in map
    roomMap[socket.id] = joinRoomId;
    io.to(joinRoomId).emit("uidPropogate", uid);
    nodeCppHandler.createRoomRequest(joinRoomId);
  });

  socket.on("chatText", (playerId, msg) => {
    //propagate msg to both/all of the clients in the room
    let clientRoomId = roomMap[socket.id];
    io.to(clientRoomId).emit("serverChatText", playerId, msg);
  });

  socket.on("pieceFocus",(playerId, pieceId)=>{
    let clientRoomId = roomMap[socket.id];

    if (playerId != roomState[clientRoomId].turn) {
      console.log(`invalid move! not ${(playerId == ID.PLAYER1 ? "white" : "black")}'s turn!!`);
      return;
    }
    nodeCppHandler.getValidMovesRequest(clientRoomId,playerId,pieceId);

  })
  
  socket.on("pieceMove", (playerId, pieceId, oldPosition, newPosition) => {
    let clientRoomId = roomMap[socket.id];

    if (playerId != roomState[clientRoomId].turn) {
      console.log(`invalid move! not ${(playerId == ID.PLAYER1 ? "white" : "black")}'s turn!!`);
      return;
    }

    //check if in saved moveMap
    const storedValidMoves = roomState[clientRoomId]?.[playerId]?.['moveMap']?.[pieceId];
    if(storedValidMoves === undefined)
    {
      console.log("storedValidMoves is undefined");
      return;
    }
    if(storedValidMoves === null)
    {
      console.log("storedValidMoves is null");
      return;
    }

    const isCurrMoveValid = ( storedValidMoves.some(obj => JSON.stringify(obj) === JSON.stringify(newPosition)) );
    if(isCurrMoveValid == false)
    {
      console.log("invalid move position");
      return;
    }

    //emit update to cpp current movePos
    nodeCppHandler.updatePositionRequest(clientRoomId,playerId,pieceId,oldPosition,newPosition);

  });
  
  socket.on("checkOrMateStatus",(playerId)=>{
    let clientRoomId = roomMap[socket.id];
    nodeCppHandler.getCheckOrMateRequest(clientRoomId,playerId);
  })

  socket.on("undo",(playerId)=>{
    let clientRoomId = roomMap[socket.id];
    nodeCppHandler.undoMoveRequest(clientRoomId,playerId);
  })

  socket.on("redo",(playerId)=>{
    let clientRoomId = roomMap[socket.id];
    nodeCppHandler.redoMoveRequest(clientRoomId,playerId);
  })

  socket.on("resign",(playerId)=>{
    let clientRoomId = roomMap[socket.id];
    nodeCppHandler.resignRequest(clientRoomId,playerId);
  })

  socket.on("reset",(playerId)=>{
    let clientRoomId = roomMap[socket.id];
    nodeCppHandler.resetRequest(clientRoomId,playerId);
  })

  socket.on("pawnPromotion",(playerId,pieceId,position,newPieceId)=>{
    let clientRoomId = roomMap[socket.id];
    nodeCppHandler.pawnPromotionRequest(clientRoomId,playerId,pieceId,position,newPieceId);
  })

  socket.on("updateAlreadyPromotedPawnOf",(playerId,updatedAlreadyPromotedPawn)=>{
    let clientRoomId = roomMap[socket.id];
    roomState[clientRoomId][playerId].alreadyPromotedPawns = updatedAlreadyPromotedPawn;
  })

  socket.on("getAlreadyPromotedPawnOf",(playerId,callback)=>{
    let clientRoomId = roomMap[socket.id];
    
    callback( roomState[clientRoomId][playerId].alreadyPromotedPawns );
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
  
});

server.listen(process.env.N_PORT, process.env.SERVER_IP , () => console.log('Server started at 3000'));
