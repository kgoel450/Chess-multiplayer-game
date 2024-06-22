#include "Player.h"

Player::Player(std::string player_id)
{
    id = player_id;
    if (id == ID::PLAYER1)
    {
        piece_map[ID::PAWN1]   = new Pawn({ 2,1 }, ID::PAWN1);          piece_map[ID::PAWN2]   = new Pawn({ 2,2 }, ID::PAWN2);
        piece_map[ID::PAWN3]   = new Pawn({ 2,3 }, ID::PAWN3);          piece_map[ID::PAWN4]   = new Pawn({ 2,4 }, ID::PAWN4);
        piece_map[ID::PAWN5]   = new Pawn({ 2,5 }, ID::PAWN5);          piece_map[ID::PAWN6]   = new Pawn({ 2,6 }, ID::PAWN6);
        piece_map[ID::PAWN7]   = new Pawn({ 2,7 }, ID::PAWN7);          piece_map[ID::PAWN8]   = new Pawn({ 2,8 }, ID::PAWN8);
        piece_map[ID::ROOK1]   = new Rook({ 1,1 }, ID::ROOK1);          piece_map[ID::ROOK2]   = new Rook({ 1,8 }, ID::ROOK2);
        piece_map[ID::KNIGHT1] = new Knight({ 1,2 }, ID::KNIGHT1);      piece_map[ID::KNIGHT2] = new Knight({ 1,7 }, ID::KNIGHT2);
        piece_map[ID::BISHOP1] = new Bishop({ 1,3 }, ID::BISHOP1);      piece_map[ID::BISHOP2] = new Bishop({ 1,6 }, ID::BISHOP2);
        piece_map[ID::KING]    = new King({ 1,5 }, ID::KING);           piece_map[ID::QUEEN]   = new Queen({ 1,4 }, ID::QUEEN);

    }
    else if (id == ID::PLAYER2)
    {
        piece_map[ID::PAWN1]   = new Pawn({ 7,1 }, ID::PAWN1);          piece_map[ID::PAWN2] = new Pawn({ 7,2 }, ID::PAWN2);
        piece_map[ID::PAWN3]   = new Pawn({ 7,3 }, ID::PAWN3);          piece_map[ID::PAWN4] = new Pawn({ 7,4 }, ID::PAWN4);
        piece_map[ID::PAWN5] = new Pawn({ 7,5 }, ID::PAWN5);            piece_map[ID::PAWN6] = new Pawn({ 7,6 }, ID::PAWN6);
        piece_map[ID::PAWN7] = new Pawn({ 7,7 }, ID::PAWN7);            piece_map[ID::PAWN8] = new Pawn({ 7,8 }, ID::PAWN8);
        piece_map[ID::ROOK1] = new Rook({ 8,1 }, ID::ROOK1);            piece_map[ID::ROOK2] = new Rook({ 8,8 }, ID::ROOK2);
        piece_map[ID::KNIGHT1] = new Knight({ 8,2 }, ID::KNIGHT1);      piece_map[ID::KNIGHT2] = new Knight({ 8,7 }, ID::KNIGHT2);
        piece_map[ID::BISHOP1] = new Bishop({ 8,3 }, ID::BISHOP1);      piece_map[ID::BISHOP2] = new Bishop({ 8,6 }, ID::BISHOP2);
        piece_map[ID::KING] = new King({ 8,5 }, ID::KING);              piece_map[ID::QUEEN]   = new Queen({ 8,4 }, ID::QUEEN);
    }
}


std::pair<int, int> Player::get_position(std::string piece_id)
{
    return piece_map[piece_id]->get_position();
}


// Destructor
Player::~Player() {
    // Deallocate dynamically allocated Chess_Piece objects
    for (auto& pair : piece_map) {
        delete pair.second;
    }
    // Clear the map
    piece_map.clear();
    std::cout <<"Successfully deallocated Players objects "<<std::endl;
}