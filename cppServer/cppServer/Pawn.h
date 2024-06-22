#pragma once
#include "Chess_Piece.h"

class Pawn : public Chess_Piece
{
private:
    int type;

public:

    Pawn(std::pair<int, int> position, std::string id, bool isAlive = true , bool is_promoted = false) : Chess_Piece(position, id, isAlive , is_promoted)
    {

    }

    std::set<std::pair<int, int>> get_possible_moves(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>> &, std::string &);

};