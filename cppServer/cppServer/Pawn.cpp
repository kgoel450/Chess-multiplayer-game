#include "Pawn.h"

std::set<std::pair<int, int>> Pawn::get_possible_moves(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>& board_map, std::string& player_id)
{
    std::set<std::pair<int, int>> valid_moves;

    if (player_id == ID::PLAYER1)
    {
        /*
        * is attack on opponent possible as next move
        * the pawn can move diagonal to north-east and north-west
        */
        std::pair<int, int> forward_right = { position.first + 1, position.second + 1 };
        std::pair<int, int> forward_left = { position.first + 1, position.second - 1 };

        //forward right
        if (forward_right.first <= 8 && forward_right.second <= 8 && board_map.find(forward_right) != board_map.end()) {
            // cannot attack if same team piece or opponents king
            if (board_map[forward_right].first != ID::PLAYER1 )
            {
                valid_moves.insert(forward_right);
            }
        }

        //forward left
        if (forward_left.first <= 8 && forward_left.second >= 1 && board_map.find(forward_left) != board_map.end()) {
            // cannot attack if same team piece or opponents king
            if (board_map[forward_left].first != ID::PLAYER1 )
            {
                valid_moves.insert(forward_left);
            }
        }

        /*
        * forward move depends on wether pawn is on home rank or not
        * Rest time can move one place forward
        */

        std::pair<int, int> forward = { position.first + 1, position.second };
        //one move forward
        if (forward.first <= 8 && board_map.find(forward) == board_map.end())
        {
            valid_moves.insert(forward);

            // if pawn is on home rank
            if (position.first == 2) {
                std::pair<int, int> forward_double = { position.first + 2, position.second };

                if (board_map.find(forward_double) == board_map.end()) {
                    valid_moves.insert(forward_double);
                }
            }
        }
    }
    //for player 2
    else
    {
        /*
        * is attack on opponent possible as next move
        * the pawn can move diagonal to north-east and north-west
        */
        std::pair<int, int> forward_right = { position.first - 1, position.second - 1 };
        std::pair<int, int> forward_left = { position.first - 1, position.second + 1 };

        //forward right
        if (forward_right.first >= 1 && forward_right.second >= 1 && board_map.find(forward_right) != board_map.end()) {
            // cannot attack if same team piece or opponents king
            if (board_map[forward_right].first != ID::PLAYER2 )
            {
                valid_moves.insert(forward_right);
            }
        }

        //forward left
        if (forward_left.first >= 1 && forward_left.second <= 8 && board_map.find(forward_left) != board_map.end()) {
            // cannot attack if same team piece or opponents king
            if (board_map[forward_left].first != ID::PLAYER2 )
            {
                valid_moves.insert(forward_left);
            }
        }

        /*
        * forward move depends on wether pawn is on home rank or not
        * Rest time can move one place forward
        */

        std::pair<int, int> forward = { position.first - 1, position.second };
        //one move forward
        if (forward.first >= 1 && board_map.find(forward) == board_map.end())
        {
            valid_moves.insert(forward);

            // if pawn is on home rank
            if (position.first == 7) {
                std::pair<int, int> forward_double = { position.first - 2, position.second };

                if (board_map.find(forward_double) == board_map.end()) {
                    valid_moves.insert(forward_double);
                }
            }
        }
    }

    return valid_moves;

}
