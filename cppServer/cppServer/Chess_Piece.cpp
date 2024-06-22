#include "Chess_Piece.h"

std::pair<int, int> Chess_Piece::get_position()
{
    return position;
}
void Chess_Piece::set_position(std::pair<int, int> position)
{
    this->position = position;
}

std::string Chess_Piece::get_id()
{
    return id;
}
bool Chess_Piece::get_is_alive()
{
    return is_alive;
}
void Chess_Piece::set_is_alive(bool flag)
{
    is_alive = flag;
}

void Chess_Piece::set_is_promoted(bool flag) {
    is_promoted = flag;
}

bool Chess_Piece::get_is_promoted() {
    return is_promoted;
}

void Chess_Piece::set_promoted_from(std::string pawn_id) {

    promoted_from = pawn_id;
}

std::string Chess_Piece::get_promoted_from() {
    return promoted_from;
}

void Chess_Piece::valid_move_update(
    std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>& board_map,
    std::string& player_id,
    std::set<std::pair<int, int>>& valid_moves,
    std::pair<int, int> offset)
{
    std::pair<int, int> new_position = position;

    while (true)
    {
        new_position = { new_position.first + offset.first, new_position.second + offset.second };

        //out of bounds
        if (new_position.first > 8 || new_position.first < 1 || new_position.second > 8 || new_position.second < 1)
        {
            break;
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
            break;
        }
        //if our piece then break
        else
        {
            break;
        }
    }

}