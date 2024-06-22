#pragma once
#include "Chess_Piece.h"

class Bishop : public Chess_Piece
{
public:

    Bishop(std::pair<int, int> position, std::string id, bool is_alive = true , bool is_promoted = false) : Chess_Piece(position, id, is_alive , is_promoted)
    {

    }
    std::set<std::pair<int, int>> get_possible_moves(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>& board_map, std::string& player_id);
};
