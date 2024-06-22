const {ID} = require('./config/utils');
const {roomState} = require('./gameContext');
require("dotenv").config();

class NodeCppHandler
{
    constructor(io)
    {
        this.front_io = io; 
        this.axios = require('axios');
    }

    //sends Request to cpp to create/initialize a game for 'roomId'
    createRoomRequest(roomId)
    {
        const request = {
            req_id : "create_room",
            room_id : roomId
        };
        this.sendRequest(request);
    }
    //get valid Moves possible for given piece
    getValidMovesRequest(roomId,playerId,pieceId)
    {
        const request = {
            req_id : "valid_moves",
            room_id : roomId,
            player_id : playerId,
            piece_id : pieceId,
        };
        this.sendRequest(request);
        console.log("sent data mreq");
    }
    //emit to update the position of given piece 
    updatePositionRequest(roomId,playerId,pieceId,oldPosition,newPosition)
    {
        const request = {
            req_id : "update_position",
            room_id : roomId,
            player_id : playerId,
            piece_id : pieceId,
            old_position : oldPosition,
            position : newPosition
        };
        this.sendRequest(request);
    }
    
    getCheckOrMateRequest(roomId,playerId)
    {
        console.log("in get request"," roomid:",roomId," playerid: ",playerId);
        const request = {
            req_id : "check_or_mate",
            room_id : roomId,
            player_id : playerId,
        };
        this.sendRequest(request);
    }

    undoMoveRequest(roomId,playerId)
    {
        console.log("undoMoveRequest called");
        const request = {
            req_id : "undo_move",
            room_id : roomId,
            player_id : playerId,
        };
        this.sendRequest(request);
    }

    redoMoveRequest(roomId,playerId)
    {
        console.log("redoMoveRequest called by:",playerId);
        const request = {
            req_id : "redo_move",
            room_id : roomId,
            player_id : playerId,
        };
        this.sendRequest(request);
    }

    resignRequest(roomId,playerId)
    {
        console.log("resign called");
        const request = {
            req_id : "resign",
            room_id : roomId,
            player_id : playerId,
        };
        this.sendRequest(request);
    }

    resetRequest(roomId,playerId)
    {
        console.log("reset called");
        const request = {
            req_id : "reset",
            room_id : roomId,
            player_id : playerId,
        };
        this.sendRequest(request);
    }

    pawnPromotionRequest(roomId,playerId,pieceId,position,newPieceId)
    {
        console.log("pawnPromotion called");
        const request = {
            req_id : "pawn_promotion",
            room_id : roomId,
            player_id : playerId,
            piece_id : pieceId,
            position : position,
            new_piece_id : newPieceId
        };
        this.sendRequest(request);
    }

    //convert request object to string and emit to cpp server
    sendRequest(request)
    {
        console.log("in send request:",request);

        // Send a POST request with JSON data
        //this.axios.post(`http://${process.env.SERVER_IP}:${process.env.C_PORT}`, request)10.211.55.3
        this.axios.post(`http://${process.env.SERVER_IP}:${process.env.C_PORT}`, request)
        .then(response => {
        // Handle response from the backend

        console.log('Response from backend:', response.data);
    
        this.handleResponse(response.data);
        })
        .catch(error => {
        // Handle errors
        console.error('Your Error is:', error);
        });
    }
    //handle the data/response received from cpp backend server
    handleResponse(responseData)
    {
        //No need axios convert to json automatic
        //let responseObj = JSON.parse(response);
        let responseObj = responseData;

        switch (responseObj.res_id) 
        {
            case "create_room"      :   this.createRoomResponse(responseObj);
                break;
            case "valid_moves"      :   this.getValidMovesResponse(responseObj);
                break;
            case "update_position"  :   this.updatePositionResponse(responseObj);
                break;
            case "check_or_mate"    :   this.getCheckorMateResponse(responseObj);
                break;
            case "undo_move"        :   this.undoMoveResponse(responseObj);
                break;
            case "redo_move"        :   this.redoMoveResponse(responseObj);
                break;
            case "resign"           :   this.resignResponse(responseObj);
                break;
            case "reset"            :   this.resetResponse(responseObj);
                break;
            case "pawn_promotion"   :   this.pawnPromotionResponse(responseObj);
                break;
            default:
                console.log("Unknown response from c++!!");
        }
    }
    

    createRoomResponse(responseObj)
    {
        if(responseObj.status != "SUCCESSFUL")
        {
            console.log("Create Room Unsuccessfull in c++ !!");
            return;
        }

        //initialize turn for white
        //roomState[responseObj.room_id]={};
        roomState[responseObj.room_id].turn = ID.PLAYER1;
        roomState[responseObj.room_id][ID.PLAYER1] = { moveMap: {} ,alreadyPromotedPawns : []};
        roomState[responseObj.room_id][ID.PLAYER2] = { moveMap: {} ,alreadyPromotedPawns : []};
        
        
        //emit to both client in the room to start the game
        this.front_io.to(responseObj.room_id).emit("startGame");
       
    }
    getValidMovesResponse(responseObj)
    {
        if(responseObj.status != "SUCCESSFUL")
        {
            console.log("Response Unsuccessfull gvm from c++ !!");
            return;
        }

        this.front_io.to(responseObj.room_id).emit('serverPieceFocus',responseObj.player_id,responseObj.position_array);
        roomState[responseObj.room_id][responseObj.player_id]['moveMap'][responseObj.piece_id] = responseObj.position_array;
    }
    updatePositionResponse(responseObj)
    {
        if(responseObj.status != "SUCCESSFUL")
        {
            console.log("Response Unsuccessfull up pos from c++ !!");
            return;
        }
        this.front_io.to(responseObj.room_id).emit("serverPieceMove", responseObj.player_id, responseObj.piece_id, responseObj.old_position, responseObj.position);
        //change turn and emit to clients
        roomState[responseObj.room_id].turn = roomState[responseObj.room_id].turn == ID.PLAYER1 ? ID.PLAYER2 : ID.PLAYER1;
        this.front_io.to(responseObj.room_id).emit("changeTurn", roomState[responseObj.room_id].turn);        
    }
    getCheckorMateResponse(responseObj)
    {
        if(responseObj.status != "SUCCESSFUL")
        {
            console.log("Response Unsuccessfull check or mate from c++ !!");
            return;
        }
        console.log("received check or mate status: ",responseObj.check_or_mate_status);

        switch(responseObj.check_or_mate_status)
        {
            case "CHECK_MATE"   :   this.front_io.to(responseObj.room_id).emit("checkMate", responseObj.player_id);  
                break;
            case "CHECK"        :   this.front_io.to(responseObj.room_id).emit("check", responseObj.player_id);  
                break;
            case "STALE_MATE"   :   this.front_io.to(responseObj.room_id).emit("staleMate", responseObj.player_id);
                break;
            case "NIL"          :         //Do nothing
                break;
            default             :   console.log("Invalid check/mate status received!!");
        }
    }   
    undoMoveResponse(responseObj)
    {
        if(responseObj.status != "SUCCESSFUL")
        {
            console.log("Response Unsuccessfull for undoMove from c++ !!");
            return;
        }

        this.front_io.to(responseObj.room_id).emit("serverUndo", responseObj.player_id, responseObj.piece_id,responseObj.position,responseObj.is_demoted,responseObj.revived_player_id,responseObj.revived_piece_id,responseObj.revived_position);
        //change turn and emit to clients
        roomState[responseObj.room_id].turn = roomState[responseObj.room_id].turn == ID.PLAYER1 ? ID.PLAYER2 : ID.PLAYER1;
        this.front_io.to(responseObj.room_id).emit("changeTurn", roomState[responseObj.room_id].turn);
    }

    redoMoveResponse(responseObj)
    {
        if(responseObj.status != "SUCCESSFUL")
        {
            console.log("Response Unsuccessfull for redoMove from c++ !!");
            return;
        }

        this.front_io.to(responseObj.room_id).emit("serverRedo", responseObj.player_id, responseObj.piece_id,responseObj.position,responseObj.pawn_promoted,responseObj.killed_player_id,responseObj.killed_piece_id,responseObj.killed_position);
        //change turn and emit to clients
        roomState[responseObj.room_id].turn = roomState[responseObj.room_id].turn == ID.PLAYER1 ? ID.PLAYER2 : ID.PLAYER1;
        this.front_io.to(responseObj.room_id).emit("changeTurn", roomState[responseObj.room_id].turn);
    }

    resignResponse(responseObj)
    {
        if(responseObj.status != "SUCCESSFUL")
        {
            console.log("Response Unsuccessfull for resign from c++ !!");
            return;
        }

        this.front_io.to(responseObj.room_id).emit("serverResign", responseObj.player_id);
    }

    resetResponse(responseObj)
    {
        if(responseObj.status != "SUCCESSFUL")
        {
            console.log("Response Unsuccessfull for reset from c++ !!");
            return;
        }

        //TODO:reset all variable in server for this room
        //reset the roomstate
        //roomState[responseObj.room_id]={};
        roomState[responseObj.room_id].turn = ID.PLAYER1;
        roomState[responseObj.room_id][ID.PLAYER1] = { moveMap: {} ,alreadyPromotedPawns : []};
        roomState[responseObj.room_id][ID.PLAYER2] = { moveMap: {} ,alreadyPromotedPawns : []};


        this.front_io.to(responseObj.room_id).emit("serverReset", responseObj.player_id);
    }

    pawnPromotionResponse(responseObj)
    {
        if(responseObj.status != "SUCCESSFUL")
        {
            console.log("Response Unsuccessfull for pawn promotion from c++ !!");
            return;
        }
        
        this.front_io.to(responseObj.room_id).emit("serverPawnPromotion", responseObj.player_id,responseObj.piece_id,responseObj.position,responseObj.new_piece_id);
    }
////////////////////////////////////////////////////////////////////////////////////////////

};

module.exports = NodeCppHandler;


