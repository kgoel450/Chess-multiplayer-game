#include "King.h"

std::set<std::pair<int, int>> King::get_possible_moves(std::map<std::pair<int, int>, std::pair<std::string, Chess_Piece*>>& board_map, std::string& player_id)
{
    //------------------------------------------------------------Updated King logic for detecting only the check proof possible moves------------------------------------------------------------------------

    std::set<std::pair<int, int>> valid_moves; //Datastructure to store ultimate valid moves of the KING
    std::set<std::pair<int, int>> attacked_positions; // Datastructure to store the opponent's possible moves 
    std::pair<int, int> next_possible_move; // of King
    std::pair<int, int> opponent_king_position;//current position of opponent king
    std::pair<int, int> opponent_king_next_position;//current position of opponent king
    std::pair<int, int> opponent_pawn_possible_diagonal;
    std::string opponent_id = ID::PLAYER1 == player_id ? ID::PLAYER2 : ID::PLAYER1;

    //Possible position offset for king's move
    std::vector<std::pair<int, int>> offset_group = { {1,0}, {1,1}, {0,1}, {-1,1}, {-1,0}, {-1,-1}, {0,-1}, {1,-1} };


    /*
    * Check all pieces on the board for opponent's pieces
    * Once determined, get all the positions they are attacking - [ ATTACKED_POSITIONS ]
    * We can use it to determine which place is not valid for KING
    */
    for (auto piece : board_map)
    {
        if (piece.second.first != player_id)
        {

            if (piece.second.second->get_id() != ID::KING) {

                if (piece.second.second->get_id() != ID::PAWN1 && piece.second.second->get_id() != ID::PAWN2 && piece.second.second->get_id() != ID::PAWN3 && piece.second.second->get_id() != ID::PAWN4 && piece.second.second->get_id() != ID::PAWN5 && piece.second.second->get_id() != ID::PAWN6 && piece.second.second->get_id() != ID::PAWN7 && piece.second.second->get_id() != ID::PAWN8) {
                    std::set<std::pair<int, int>> opponent_possible_moves = piece.second.second->get_possible_moves(board_map, opponent_id);
                    attacked_positions.insert(opponent_possible_moves.begin(), opponent_possible_moves.end());
                }


                else if (piece.second.second->get_id() == ID::PAWN1 || piece.second.second->get_id() == ID::PAWN2 || piece.second.second->get_id() == ID::PAWN3 || piece.second.second->get_id() == ID::PAWN4 || piece.second.second->get_id() == ID::PAWN5 || piece.second.second->get_id() == ID::PAWN6 || piece.second.second->get_id() == ID::PAWN7 || piece.second.second->get_id() == ID::PAWN8) {

                    std::pair<int, int> opponent_pawn_position = piece.second.second->get_position();

                    std::vector<std::pair<int, int>> pl1_pawn_offset_group = { {1, -1}, {1, 1} };
                    std::vector<std::pair<int, int>> pl2_pawn_offset_group = { {-1, 1}, {-1, -1} };

                    if (piece.second.first == ID::PLAYER1) {

                        for (auto offset_1 : pl1_pawn_offset_group) {

                            opponent_pawn_possible_diagonal = { opponent_pawn_position.first + offset_1.first, opponent_pawn_position.second + offset_1.second };
                            attacked_positions.insert(opponent_pawn_possible_diagonal);

                        }

                    }
                    else if (piece.second.first == ID::PLAYER2) {

                        for (auto offset_2 : pl2_pawn_offset_group) {

                            opponent_pawn_possible_diagonal = { opponent_pawn_position.first + offset_2.first, opponent_pawn_position.second + offset_2.second };
                            attacked_positions.insert(opponent_pawn_possible_diagonal);

                        }
                    }

                }

            }
            else if (piece.second.second->get_id() == ID::KING) {

                opponent_king_position = piece.second.second->get_position();

                for (auto offset_3 : offset_group) {

                    opponent_king_next_position = { opponent_king_position.first + offset_3.first , opponent_king_position.second + offset_3.second };

                    if (opponent_king_next_position.first < 1 || opponent_king_next_position.first > 8 || opponent_king_next_position.second < 1 || opponent_king_next_position.second > 8) {

                        continue;
                    }

                    else if (board_map.find(opponent_king_next_position) == board_map.end()) {

                        attacked_positions.insert(opponent_king_next_position);
                        continue;

                    }

                    else if (board_map[opponent_king_next_position].first != player_id) {

                        attacked_positions.insert(opponent_king_next_position);
                        continue;

                    }
                    else {
                        continue;
                    }
                }
            }
        }
    }


    for (auto offset : offset_group)
    {
        /*
        * Check the kings next possible move
        * If that position is being attacked, its not a valid move
        * KING cannot voluntarily move to a CHECK
        */
        next_possible_move = { position.first + offset.first , position.second + offset.second };

        if (next_possible_move.first < 1 || next_possible_move.first > 8 || next_possible_move.second < 1 || next_possible_move.second > 8) {
            continue;
        }

        else if (board_map.find(next_possible_move) == board_map.end()) {
            if (attacked_positions.find(next_possible_move) == attacked_positions.end())
            {
                valid_moves.insert(next_possible_move);
                continue;
            }
            else { continue; }
        }

        else if (board_map[next_possible_move].first != player_id) {
            if (attacked_positions.find(next_possible_move) == attacked_positions.end())
            {
                valid_moves.insert(next_possible_move);
                continue;
            }
            else { continue; }
        }
        else {
            continue;
        }
    }

    return valid_moves;
}