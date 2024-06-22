#pragma once
#include "iostream"
#include "GlobalDefinitions.h"
#include "Chess_Piece.h"
#include "Pawn.h"
#include "King.h"
#include "Queen.h"
#include "Rook.h"
#include "Bishop.h"
#include "Knight.h"

class Player {

    std::string id;
    

public:
    std::map<std::string, Chess_Piece *> piece_map;

    Player(std::string );
    //void update_position(std::string piece_id, std::pair<int, int> position);
    std::pair<int, int> get_position(std::string piece_id);
//    std::set<std::pair<int, int>> get_possible_positions(
//        std::string piece_id,
//        std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>& board_map
//    );

    //helps in access change
    //from players[player_id].piece_map[piece_id]  -> players[player_id][piece_id]
    Chess_Piece *operator[](std::string piece_id)
    {
        return piece_map[piece_id];
    }

    ~Player(); // Destructor
};

