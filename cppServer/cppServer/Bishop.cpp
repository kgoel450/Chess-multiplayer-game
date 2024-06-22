#include <set>
#include "Bishop.h"
#include <vector>

std::set<std::pair<int, int>> Bishop::get_possible_moves(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>& board_map, std::string& player_id)
{

    std::set<std::pair<int, int>> valid_moves;
    //check in the diagonal positions
    std::vector<std::pair<int, int>> offset_group = { {1,1}, {-1,1}, {-1,-1}, {1,-1} };
    for (auto offset : offset_group)
    {
        valid_move_update(board_map, player_id, valid_moves, offset);
    }
    return valid_moves;
}