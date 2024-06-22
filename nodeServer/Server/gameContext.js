let roomMap = {};//empty object //maps client id to his roomid
let roomState = {};//maps roomid with its gamestate

//example 
// roomState = {
//     roomId : 
//     {   turn: ID.PLAYER1,
//         [ID.PLAYER1] : {     moveMap: {'pawn1':[{ x: 6, y: 1 }, { x: 6, y: 3 } ]}    },
//         [ID.PLAYER2] : {     moveMap: {'pawn1':[{ x: 6, y: 1 }, { x: 6, y: 3 } ]}    }
//     }
//     //....roomid2
//     //.
//     //.

//   };


module.exports = {roomMap,roomState};
