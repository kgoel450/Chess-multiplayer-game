#include "Knight.h"
#include <vector>

void Knight::valid_move_knight(
    std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>& board_map,
    std::string& player_id,
    std::set<std::pair<int, int>>& valid_moves,
    std::pair<int, int> offset)
{
    std::pair<int, int> new_position = position;


    new_position = { new_position.first + offset.first, new_position.second + offset.second };

    //out of bounds
    if (new_position.first > 8 || new_position.first < 1 || new_position.second > 8 || new_position.second < 1)
    {
        return;
    }
    //if is empty add to moves and continue to next
    else if (board_map.find(new_position) == board_map.end())
    {
        valid_moves.insert(new_position);
    }
    //if opponent piece- add to move and break
    else if (board_map[new_position].first != player_id)
    {
        valid_moves.insert(new_position);
        return;
    }
    //if our piece then break
    else
    {
        return;
    }

}

std::set<std::pair<int, int>> Knight::get_possible_moves(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>& board_map, std::string& player_id)
{
    std::set<std::pair<int, int>> valid_moves;
    //check in the diagonal positions
    std::vector<std::pair<int, int>> offset_group = { {2,1}, {2,-1}, {1,2}, {-1,2}, {-2, 1}, {-2,-1}, {1, -2}, {-1, -2} };
    for (auto offset : offset_group)
    {
        valid_move_knight(board_map, player_id, valid_moves, offset);
    }
    return valid_moves;
}
