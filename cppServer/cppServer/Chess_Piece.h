#pragma once
#include "GlobalDefinitions.h"
#include <map>
#include <set>

class Chess_Piece
{

protected:
    std::pair<int, int> position; //Piece Position
    std::string id;
    bool is_alive;
    bool is_promoted;
    std::string promoted_from;
    
    void valid_move_update(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>&, std::string&, std::set<std::pair<int, int>>&, std::pair<int, int>);

public:
    
    /* Constructor */
    Chess_Piece(std::pair<int, int> position, std::string id, bool is_alive, bool is_promoted)
    {
        this->position = position;
        this->is_alive = is_alive;
        this->id = id;
        this->is_promoted = is_promoted;
    }

    /* Getters and Setters */
    std::pair<int, int> get_position();
    
    void set_position(std::pair<int, int>);
    std::string get_id();
    
    bool get_is_alive(); //check Piece is alive or not
    void set_is_alive(bool);    

    bool get_is_promoted(); //check Piece is a promoted piece or not
    void set_is_promoted(bool);

    void set_promoted_from(std::string); //storing the pawn id from which this piece is promoted 
    std::string get_promoted_from();

    /* Member Functions */
    virtual std::set<std::pair<int, int>> get_possible_moves(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>& board_map, std::string& player_id) = 0; //Possible moves
};