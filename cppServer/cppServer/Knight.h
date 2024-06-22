#pragma once
#include "Chess_Piece.h"

class Knight : public Chess_Piece
{
	void valid_move_knight(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>&, std::string&, std::set<std::pair<int, int>>&, std::pair<int, int>);

public:

    Knight(std::pair<int, int> position, std::string id, bool is_alive = true , bool is_promoted = false) : Chess_Piece(position, id, is_alive , is_promoted)
    {

    }
	std::set<std::pair<int, int>> get_possible_moves(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>> &, std::string &);
};


