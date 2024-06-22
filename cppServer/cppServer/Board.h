#pragma once

//********************************************************* 
// 
// Board class is an instance of "game played" between
// two players, it has the game state. i.e two objects of
// Player Classes for the two players each having the 
// piece information under piece_map that has reference 
// to the respective pieces [ chess_Piece] class.
// 
//*********************************************************

#include <iostream>
#include "Player.h"
#include <nlohmann/json.hpp>
#include "GlobalDefinitions.h"

using namespace nlohmann;

class Board {

private:

    std::map<std::string, Player*> players;
    std::string room_id;
    std::string turn;
    std::map<std::string, bool> under_check;

    //KEY - Position on the board
    //VALUE - Pair [ player id, chess piece pointer]

    std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>> board_map;

public:
    Board(std::string);
    ~Board();
    
    //check if the player's certain piece is at given location
    bool match_piece_at_location(std::string, std::string, std::pair<int, int>);

    //check if players are under check
    bool get_under_check(std::string);

    //update check flag of the players
    void update_under_check(std::string, bool);

    //Update the board variable after move : board_map and piece_map
    void move(json data);

    //This function calculates Check Status of 'turn' player_id
    bool calc_check(std::string turn);

    //This function calculates the checkmate status of 'turn' player_id
    bool calc_checkmate(std::string turn);

    //This function calculates the stalemate status of 'turn' player_id
    bool calc_stalemate(std::string turn);

    std::set<std::pair<int, int>> get_possible_moves(std::string, std::string);

    //This function calculate and return only the legal moves of all possible moves
    std::set<std::pair<int, int>> get_legal_moves(std::string, std::string);

    void pawn_promotion(std::string player_id, std::string piece_id, std::pair<int, int> position, std::string new_piece_id);

    std::string demoted_from_id;

    void update_position(std::string, std::string, std::pair<int, int>);

    //This function calculates if a certain move can remove the check of player
    bool if_check_after_move(std::pair<int, int> move, std::string player_id, std::string piece_id);


    json undo(std::string);
    json redo(std::string);
    bool undo_is = false;
    bool last_promoted = false;
    json last_kill_info = {};
    void print();

    std::pair<int, int> old_position;
    std::pair<int, int> new_position;
    std::pair<int, int> redo_new_position;

    bool can_castle_kingside(std::string player_id);
    bool can_castle_queenside(std::string player_id);
    void perform_castle(std::string player_id, bool is_kingside);
    bool castle_move(std::pair<int, int> initial_pos, std::pair<int, int> final_pos, std::string player_id);

};