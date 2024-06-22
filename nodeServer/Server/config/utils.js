//ENUMS
const ID = Object.freeze({
    PLAYER1: "pl1",
    PLAYER2: "pl2"
});

//convert position in objectform(server) into stringform(client)
function strPosition(positionObj)
{
    return ""+positionObj.x+positionObj.y;
}

//convert position in objectform(server) into stringform(client)
function objPosition(positionStr)
{
    return { x: eval(positionStr[0]) , y: eval(positionStr[1])};
}

module.exports = {ID,strPosition,objPosition};