#include "Board.h"


Board::Board(std::string room_id)
{
    players[ID::PLAYER1] = new Player(ID::PLAYER1);
    players[ID::PLAYER2] = new Player(ID::PLAYER2);

    //Set the turn to player 1 for starters
    turn = ID::PLAYER1;

    //Set under check status of players
    under_check[ID::PLAYER1] = false;
    under_check[ID::PLAYER2] = false;

    //Set Room id for the current Game
    room_id = room_id;

    /*
    * KEY - Position on the board
    * VALUE - Pair [ player id, piece pointer]
    */

    //player one piece on board_map
    board_map[{1, 1}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::ROOK1] };     board_map[{1, 2}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::KNIGHT1] };
    board_map[{1, 3}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::BISHOP1] };   board_map[{1, 4}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::QUEEN] };
    board_map[{1, 5}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::KING] };      board_map[{1, 6}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::BISHOP2] };
    board_map[{1, 7}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::KNIGHT2] };   board_map[{1, 8}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::ROOK2] };
    board_map[{2, 1}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::PAWN1] };     board_map[{2, 2}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::PAWN2] };
    board_map[{2, 3}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::PAWN3] };     board_map[{2, 4}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::PAWN4] };
    board_map[{2, 5}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::PAWN5] };     board_map[{2, 6}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::PAWN6] };
    board_map[{2, 7}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::PAWN7] };     board_map[{2, 8}] = { ID::PLAYER1,players[ID::PLAYER1]->piece_map[ID::PAWN8] };

    //player 2 piece on board_map                                                                                         
    board_map[{8, 1}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::ROOK1] };     board_map[{8, 2}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::KNIGHT1] };
    board_map[{8, 3}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::BISHOP1] };   board_map[{8, 4}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::QUEEN] };
    board_map[{8, 5}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::KING] };      board_map[{8, 6}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::BISHOP2] };
    board_map[{8, 7}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::KNIGHT2] };   board_map[{8, 8}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::ROOK2] };
    board_map[{7, 1}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::PAWN1] };     board_map[{7, 2}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::PAWN2] };
    board_map[{7, 3}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::PAWN3] };     board_map[{7, 4}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::PAWN4] };
    board_map[{7, 5}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::PAWN5] };     board_map[{7, 6}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::PAWN6] };
    board_map[{7, 7}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::PAWN7] };     board_map[{7, 8}] = { ID::PLAYER2,players[ID::PLAYER2]->piece_map[ID::PAWN7] };
}

//--------------------------------------------------------------------------------------

Board::~Board() 
{
    // Deallocat memory for player objects
    delete players[ID::PLAYER1];
    delete players[ID::PLAYER2];
    std::cout << " Board memory is deallocated " << std::endl;
}

//--------------------------------------------------------------------------------------

//This function calculates Check Status of of 'turn' player_id
bool Board::calc_check(std::string turn)
{
    std::string checked_player_id = turn;
    std::string opponent_id = ID::PLAYER1 == turn ? ID::PLAYER2 : ID::PLAYER1;

    std::pair<int, int> king_position = players[checked_player_id]->piece_map[ID::KING]->get_position();

    //use copy of piece_map : due to two use cases

    for (auto opp_piece : players[opponent_id]->piece_map)
    {
        if (opp_piece.second->get_is_alive() == false)
            continue;

        //king cannot check another king
        if (opp_piece.first == ID::KING)
        {
            continue;
        }
        std::set<std::pair<int, int>> attack_positions = opp_piece.second->get_possible_moves(board_map, opponent_id);
        if (attack_positions.find(king_position) != attack_positions.end())
        {
            return true;//tell that the king is in check
        }
    }

    return false;
}

//This function calculates CheckMate Status of of 'turn' player_id
bool Board::calc_checkmate(std::string turn)
{
    bool king_under_check = this->calc_check(turn);

    //if not in check also not in checkmate
    if (king_under_check == false)
        return false;
    //check if any legal move exist for any piece
    std::set<std::pair<int, int>> all_legal_moves;
    for (auto piece : players[turn]->piece_map)
    {
        if (piece.second->get_is_alive() == false)
            continue;

        if (get_legal_moves(turn, piece.first).size() > 0)
            return false;
    }
    return true;

}

//--------------------------------------------------------------------------------------

//This function calculates StaleMate Status of of 'turn' player_id
bool Board::calc_stalemate(std::string turn)
{
    std::set<std::pair<int, int>> all_legal_moves;
    for (auto piece : players[turn]->piece_map)
    {
        if (piece.second->get_is_alive() == false)
            continue;

        if (get_legal_moves(turn, piece.first).size() > 0)
            return false;
    }
    return true;
}

//--------------------------------------------------------------------------------------

void Board::move(json data) {

    //extracting pos data 
    int x = data["position"]["x"];
    int y = data["position"]["y"];

    std::pair<int, int> newPosition = std::make_pair(x, y);
    
    std::string pieceId_1;
    std::string playerId_1;

    last_promoted = false;

    //removing the position from board_map
    board_map.erase(players[data["player_id"]]->get_position(data["piece_id"]));

    if (board_map.find(newPosition) != board_map.end())////////
    {
        board_map[newPosition].second->set_is_alive(false);
        
        if (board_map[newPosition].second->get_is_promoted() == true) {

            pieceId_1 = board_map[newPosition].second->get_promoted_from();
        }
        else {

            pieceId_1 = board_map[newPosition].second->get_id();

        }
        playerId_1 = board_map[newPosition].first;

        board_map.erase(newPosition);

        last_kill_info["piece_id"] = pieceId_1;
        last_kill_info["player_id"] = playerId_1;
    }
    else {

        last_kill_info["piece_id"] = "NIL";
        last_kill_info["player_id"] = "NIL";
    }

    board_map[newPosition] = { data["player_id"], players[data["player_id"]]->piece_map[data["piece_id"]] };

    //update piece position
    update_position(data["player_id"], data["piece_id"], newPosition);

}

//--------------------------------------------------------------------------------------

json Board::undo(std::string clicked_by) {

    json undo_data = {};

    if (board_map.find(new_position) != board_map.end()) {

        auto piece = board_map[new_position];
        std::string playerId = piece.first;
        std::string pieceId = piece.second->get_id();
        std::string promoted_from_pieceId;
        
        if (clicked_by == playerId) {

            redo_new_position = new_position;

            if (last_kill_info["piece_id"] != "NIL" && last_kill_info["player_id"] != "NIL") {

                board_map.erase(new_position);   //clearing the position to undo the pice to its previous position

                //updating the last killed piece in the board_map
                board_map[new_position] = { last_kill_info["player_id"], players[last_kill_info["player_id"]]->piece_map[last_kill_info["piece_id"]] };

                //update last killed piece position in piece_map
                update_position(last_kill_info["player_id"], last_kill_info["piece_id"], new_position);

                board_map[new_position].second->set_is_alive(true);

                undo_data["revived_piece_id"] = last_kill_info["piece_id"];
                undo_data["revived_player_id"] = last_kill_info["player_id"];
                undo_data["revived_position"]["x"] = new_position.first;
                undo_data["revived_position"]["y"] = new_position.second;


            }
            else {

                board_map.erase(new_position);

                undo_data["revived_piece_id"] = "NIL";
                undo_data["revived_player_id"] = "NIL";
                undo_data["revived_position"]["x"] = "NIL";
                undo_data["revived_position"]["y"] = "NIL";
            }

            if (piece.second->get_is_promoted() == true && last_promoted == true) {

                promoted_from_pieceId = piece.second->get_promoted_from();

                if ((playerId == ID::PLAYER1 && old_position.first == 7) || (playerId == ID::PLAYER2 && old_position.first == 2)) {

                    demoted_from_id = players[playerId]->piece_map[promoted_from_pieceId]->get_id();

                    delete players[playerId]->piece_map[promoted_from_pieceId];

                    players[playerId]->piece_map[promoted_from_pieceId] = new Pawn(old_position, promoted_from_pieceId);
                    
                    last_promoted = false;
                }

                board_map[old_position] = { playerId , players[playerId]->piece_map[promoted_from_pieceId] };
                undo_data["piece_id"] = promoted_from_pieceId;
                undo_data["is_demoted"] = "yes";

            }
            else if (piece.second->get_is_promoted() == true) {

                promoted_from_pieceId = piece.second->get_promoted_from();

                board_map[old_position] = { playerId , players[playerId]->piece_map[promoted_from_pieceId] };

                //update piece position
                update_position(playerId, promoted_from_pieceId, old_position);
                undo_data["piece_id"] = promoted_from_pieceId;
            }
            else {
                board_map[old_position] = { playerId , players[playerId]->piece_map[pieceId] };

                //update piece position
                update_position(playerId, pieceId, old_position);
                undo_data["piece_id"] = pieceId;

            }

            undo_data["player_id"] = playerId;
            undo_data["status"] = "SUCCESSFUL";

            new_position = { 0, 0 };

        }
        else {

            undo_data["status"] = "Invalid Request";

        }
    }
    else {
        undo_data["status"] = "Invalid Request";
    }

    return undo_data;
}

//--------------------------------------------------------------------------------------

json Board::redo(std::string clicked_by) {
    
    json redo_data = {};


    if (undo_is == true && board_map.find(old_position) != board_map.end()) {
        
        auto piece = board_map[old_position];
        std::string playerId = piece.first;
        std::string pieceId = piece.second->get_id();

        if (clicked_by == playerId) {

            if (board_map.find(redo_new_position) != board_map.end()) {

                board_map[redo_new_position].second->set_is_alive(false);

                board_map.erase(redo_new_position);

                board_map.erase(old_position);

                redo_data["killed_piece_id"] = last_kill_info["piece_id"];
                redo_data["killed_player_id"] = last_kill_info["player_id"];
                redo_data["killed_position"]["x"] = redo_new_position.first;
                redo_data["killed_position"]["y"] = redo_new_position.second;

                //old_position = { 0, 0 };
            }
            else {

                board_map.erase(old_position);
                redo_data["killed_piece_id"] = "NIL";
                redo_data["killed_player_id"] = "NIL";
                redo_data["killed_position"]["x"] = "NIL";
                redo_data["killed_position"]["y"] = "NIL";
            }


            if ((pieceId.substr(0, 4) == "pawn") && ((playerId == ID::PLAYER1 && redo_new_position.first == 8) || (playerId == ID::PLAYER2 && redo_new_position.first == 1))) {

                pawn_promotion(playerId, pieceId, redo_new_position, demoted_from_id);
                redo_data["pawn_promoted"] = "yes";
                redo_data["piece_id"] = pieceId;

            }
            else if (piece.second->get_is_promoted() == true) {
                std::string promoted_from_pieceId = piece.second->get_promoted_from();

                board_map[redo_new_position] = { playerId , players[playerId]->piece_map[promoted_from_pieceId] };

                update_position(playerId, promoted_from_pieceId, redo_new_position);
                redo_data["piece_id"] = promoted_from_pieceId;
            }
            else {
                board_map[redo_new_position] = { playerId , players[playerId]->piece_map[pieceId] };

                update_position(playerId, pieceId, redo_new_position);
                redo_data["piece_id"] = pieceId;

            }


            redo_data["player_id"] = playerId;
            redo_data["status"] = "SUCCESSFUL";
        }
        else {

            redo_data["status"] = "Invalid Request";

        }
    }
    else {
        redo_data["status"] = "Invalid Request";
    }

    return redo_data;
}

//--------------------------------------------------------------------------------------

void Board::update_position(std::string player_id, std::string piece_id, std::pair<int, int> position)
{
    players[player_id]->piece_map[piece_id]->set_position(position);
}

//--------------------------------------------------------------------------------------

std::set<std::pair<int, int>> Board::get_possible_moves(std::string player_id, std::string piece_id)
{
    return players[player_id]->piece_map[piece_id]->get_possible_moves(board_map, player_id);
}

//--------------------------------------------------------------------------------------

//This function calculate and return only the legal moves among all possible moves(which doesn't cause their king in check)
std::set<std::pair<int, int>> Board::get_legal_moves(std::string player_id, std::string piece_id)
{
    std::set<std::pair<int, int>> valid_moves = this->get_possible_moves(player_id, piece_id);

    std::set<std::pair<int, int>> copy_valid_moves = valid_moves;

    //now we need to only keep moves which protect the king in check
    //only allow those move after which the there is no check afterward (if either in check or not) 
    for (auto move : copy_valid_moves)
    {
        if (this->if_check_after_move(move, player_id, piece_id) == true)
        {
            //Check exist after this move
            valid_moves.erase(move);//then remove this move
        }
        else
        {
            //okay
        }
    }
    return valid_moves;
}

//--------------------------------------------------------------------------------------

void Board::pawn_promotion(std::string player_id, std::string piece_id, std::pair<int, int> position, std::string new_piece_id)
{
    this->players[player_id]->piece_map[piece_id]->set_is_alive(false);

    last_promoted = true;

    if (new_piece_id == "queen") {
       
        this->players[player_id]->piece_map[piece_id] = new Queen(position, ID::QUEEN);

    }
    else if (new_piece_id == "rook") {

        this->players[player_id]->piece_map[piece_id] = new Rook(position, new_piece_id);

    }
    else if (new_piece_id == "bishop") {

        this->players[player_id]->piece_map[piece_id] = new Bishop(position, new_piece_id);

    }
    else if (new_piece_id == "knight") {

        this->players[player_id]->piece_map[piece_id] = new Knight(position, new_piece_id);

    }
    else {

        //error
    }
    
    this->players[player_id]->piece_map[piece_id]->set_is_promoted(true);

    this->players[player_id]->piece_map[piece_id]->set_promoted_from(piece_id);

    board_map[position] = { player_id , this->players[player_id]->piece_map[piece_id] };

}

//--------------------------------------------------------------------------------------

bool Board::match_piece_at_location(std::string player_id, std::string piece_id, std::pair<int, int> position)
{
    if (board_map.find(position) == board_map.end())
    {
        return false;
    }
    else
    {
        if (((board_map[position].second)->get_id() == piece_id) && board_map[position].first == player_id)
        {
            return true;
        }
    }
    return false;
}

//--------------------------------------------------------------------------------------

bool Board::get_under_check(std::string player_id)
{
    return under_check[player_id];
}

//--------------------------------------------------------------------------------------

void Board::update_under_check(std::string player_id, bool is_checked)
{
    under_check[player_id] = is_checked;
}

//--------------------------------------------------------------------------------------

bool Board::if_check_after_move(std::pair<int, int> move, std::string player_id, std::string piece_id)
{
    std::pair<int, int> new_pos = move;
    //save curr(old) position of piece
    std::pair<int, int> old_pos = this->players[player_id]->get_position(piece_id);

    //save if anything existed in new_Pos 
    bool flag = false;
    std::string saved_piece_player_id = "";
    Chess_Piece* saved_piece_ptr = nullptr;

    if (board_map.find(new_pos) != board_map.end())
    {
        flag = true;
        saved_piece_player_id = board_map[new_pos].first;
        saved_piece_ptr = board_map[new_pos].second;
        saved_piece_ptr->set_is_alive(false);
    }

    //temporarily move the piece
    board_map.erase(old_pos);

    board_map[new_pos] = { player_id, players[player_id]->piece_map[piece_id] };

    update_position(player_id, piece_id, new_pos);

    bool is_still_check = this->calc_check(player_id);

    //undo the temp. move
    board_map.erase(new_pos);
    if (flag == true)
    {
        board_map[new_pos].first = saved_piece_player_id;
        board_map[new_pos].second = saved_piece_ptr;
        saved_piece_ptr->set_is_alive(true);
    }
    board_map[old_pos] = { player_id, players[player_id]->piece_map[piece_id] };
    update_position(player_id, piece_id, old_pos);

    return is_still_check;
}

//--------------------------------------------------------------------------------------

void Board::print()
{
    std::cout << "HELLO" << std::endl;
    std::cout << "game room id:" << room_id;
}

bool Board::can_castle_kingside(std::string player_id) {
    if (under_check[player_id]) return false;

    std::pair<int, int> king_initial_pos = (player_id == ID::PLAYER1) ? std::make_pair(1, 5) : std::make_pair(8, 5);
    std::pair<int, int> rook_initial_pos = (player_id == ID::PLAYER1) ? std::make_pair(1, 8) : std::make_pair(8, 8);

    if (board_map.find(king_initial_pos) == board_map.end() || board_map.find(rook_initial_pos) == board_map.end()) return false;
    if (board_map[king_initial_pos].second->get_id() != ID::KING || board_map[rook_initial_pos].second->get_id() != ID::ROOK2) return false;

    // Check if the squares between the king and rook are empty
    for (int i = 6; i <= 7; ++i) {
        if (board_map.find({ king_initial_pos.first, i }) != board_map.end()) return false;
    }

    // Check if the king would be in check in any of these squares
    for (int i = 5; i <= 7; ++i) {
        if (this->if_check_after_move({ king_initial_pos.first, i }, player_id, ID::KING)) return false;
    }

    return true;
}

bool Board::can_castle_queenside(std::string player_id) {
    if (under_check[player_id]) return false;

    std::pair<int, int> king_initial_pos = (player_id == ID::PLAYER1) ? std::make_pair(1, 5) : std::make_pair(8, 5);
    std::pair<int, int> rook_initial_pos = (player_id == ID::PLAYER1) ? std::make_pair(1, 1) : std::make_pair(8, 1);

    if (board_map.find(king_initial_pos) == board_map.end() || board_map.find(rook_initial_pos) == board_map.end()) return false;
    if (board_map[king_initial_pos].second->get_id() != ID::KING || board_map[rook_initial_pos].second->get_id() != ID::ROOK1) return false;

    // Check if the squares between the king and rook are empty
    for (int i = 2; i <= 4; ++i) {
        if (board_map.find({ king_initial_pos.first, i }) != board_map.end()) return false;
    }

    // Check if the king would be in check in any of these squares
    for (int i = 3; i <= 5; ++i) {
        if (this->if_check_after_move({ king_initial_pos.first, i }, player_id, ID::KING)) return false;
    }

    return true;
}

void Board::perform_castle(std::string player_id, bool is_kingside) {
    std::pair<int, int> king_initial_pos = (player_id == ID::PLAYER1) ? std::make_pair(1, 5) : std::make_pair(8, 5);
    std::pair<int, int> rook_initial_pos = is_kingside ?
        ((player_id == ID::PLAYER1) ? std::make_pair(1, 8) : std::make_pair(8, 8)) :
        ((player_id == ID::PLAYER1) ? std::make_pair(1, 1) : std::make_pair(8, 1));

    std::pair<int, int> king_final_pos = is_kingside ?
        ((player_id == ID::PLAYER1) ? std::make_pair(1, 7) : std::make_pair(8, 7)) :
        ((player_id == ID::PLAYER1) ? std::make_pair(1, 3) : std::make_pair(8, 3));

    std::pair<int, int> rook_final_pos = is_kingside ?
        ((player_id == ID::PLAYER1) ? std::make_pair(1, 6) : std::make_pair(8, 6)) :
        ((player_id == ID::PLAYER1) ? std::make_pair(1, 4) : std::make_pair(8, 4));

    // Move the king
    board_map[king_final_pos] = board_map[king_initial_pos];
    board_map.erase(king_initial_pos);

    // Move the rook
    board_map[rook_final_pos] = board_map[rook_initial_pos];
    board_map.erase(rook_initial_pos);
}

bool Board::castle_move(std::pair<int, int> initial_pos, std::pair<int, int> final_pos, std::string player_id)
{
    if (can_castle_kingside(player_id) && final_pos == (player_id == ID::PLAYER1 ? std::make_pair(1, 7) : std::make_pair(8, 7))) {
        perform_castle(player_id, true);
        return true;
    }
    else if (can_castle_queenside(player_id) && final_pos == (player_id == ID::PLAYER1 ? std::make_pair(1, 3) : std::make_pair(8, 3))) {
        perform_castle(player_id, false);
        return true;
    }
    else {
        return false;
    }
}
