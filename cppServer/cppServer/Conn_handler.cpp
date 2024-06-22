#include "Conn_handler.h"

Conn_handler::Conn_handler(boost::asio::io_context& io_context, Game* game) : socket(io_context) {

    // keeps the current game instance 
    // from previous connection to new

    this->game = game;
}

//--------------------------------------------------------------------------------------

Conn_handler::~Conn_handler()
{
    try
    {
        // Close the socket
        socket.close();
        std::cout << "Disconnected" << std::endl;
    }
    catch (const std::exception& e)
    {
        std::cerr << "Exception in Conn_handler destructor: " << e.what() << std::endl;
    }
}

//--------------------------------------------------------------------------------------

ip::tcp::socket& Conn_handler::getSocket()
{
    return this->socket;
}

//--------------------------------------------------------------------------------------

void Conn_handler::start()
{
    auto self(shared_from_this());

    socket.async_read_some(
        asio::buffer(received_data, max_length),
        [this, self](const boost::system::error_code& error, size_t bytesRead) {
            if (!error) {
                read_data(error, bytesRead);
            }
            else {
                // Handle read error
            }
        });
}

//--------------------------------------------------------------------------------------

void Conn_handler::read_data(const boost::system::error_code& error, size_t bytesRead)
{
    if (!error) {
        // Add the received data to the request queue
        std::string request(received_data, bytesRead);

        // Process the next request in the queue
        process_http_request(request);

    }
}

//--------------------------------------------------------------------------------------

void Conn_handler::process_http_request(const std::string& request)
{

    try {
        //std::string request_data(received_data, bytesRead);
        size_t header_end = request.find("\r\n\r\n");

        if (header_end == std::string::npos) {
            throw std::runtime_error("Malformed HTTP request");
        }
        std::string request_body = request.substr(header_end + 4);
        json req_data = json::parse(request_body);

        //currently only post is used in node part
        //if in future, more type of method is required, do the needful
        std::string method = request.substr(0, request.find(' '));
        if (method != "POST") {
            throw std::runtime_error("Unsupported HTTP method");
        }


        // Request to create a Room after 2nd player joins
        if (req_data["req_id"] == "create_room") {
            create_room(req_data);
        }
        // Request to get valid possible moves of a piece
        else if (req_data["req_id"] == "valid_moves") {
            get_legal_moves(req_data);
        }
        // Request to update the position: when move is among valid moves in node
        else if (req_data["req_id"] == "update_position") {
            update_board(req_data);
        }

        // After Turn changes in Node, this event should be requested
        // This updates the "under_check[player_id]"
        // And sends the check flag to Node.
        else if (req_data["req_id"] == "check_or_mate") {
            validate_check(req_data);
        }

        else if (req_data["req_id"] == "pawn_promotion")
        {
            pawn_promotion(req_data);
        }
        else if (req_data["req_id"] == "undo_move")
        {
            undo(req_data);
        }
        else if (req_data["req_id"] == "redo_move") {

            redo(req_data);
        }
        else if (req_data["req_id"] == "reset") {
            reset_room(req_data);
        }
        else if (req_data["req_id"] == "castle") {
            castle_move(req_data);
        }
        else if (req_data["req_id"] == "exit") {

        }
        else {
            throw std::runtime_error("Invalid request type");
        }

        std::string response_body = return_data;
        std::string response = "HTTP/1.1 200 OK\r\nContent-Length: " + std::to_string(response_body.size()) + "\r\n\r\n" + response_body;

        // Send the response back to the client
        send_http_response(response);

    }
    catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        // Send an error response or handle the error appropriately
    }
}

//--------------------------------------------------------------------------------------

void Conn_handler::send_http_response(const std::string& response)
{
    std::cout << response << std::endl;
    auto self(shared_from_this());
    asio::async_write(
        socket,
        asio::buffer(response.data(), response.size()),
        [this, self](const boost::system::error_code& error, std::size_t bytes_transferred) {
            if (!error) {
                // Response sent successfully
                std::cout << "Response sent: " << std::endl;

            }
            else {
                // Handle write error
                std::cerr << "Error sending response: " << error.message() << std::endl;
            }
        });
}

//--------------------------------------------------------------------------------------

void Conn_handler::create_room(json req_data)
{
    bool success_game_creation = game->create_room(req_data["room_id"]);
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];
    if (success_game_creation)
    {
        res_data["status"] = "SUCCESSFUL";
    }
    else
    {
        res_data["status"] = "DUPLICATE_ROOM_ID";
    }

    return_data = res_data.dump();
}

//--------------------------------------------------------------------------------------

void Conn_handler::delete_room(json req_data) {

    bool game_exited = game->delete_room(req_data["room_id"]);
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];
    if (game_exited)
    {
        res_data["status"] = "SUCCESSFUL";
    }
    else
    {
        res_data["status"] = "INVALID";
    }

    return_data = res_data.dump();

}

//--------------------------------------------------------------------------------------

void Conn_handler::get_legal_moves(json req_data)
{
    std::cout << "GAME in get valid: size : " << game->game_map.size() << " " << req_data["room_id"] << std::endl;
    Board* board = (*game)[req_data["room_id"]];
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];
    res_data["player_id"] = req_data["player_id"];
    res_data["piece_id"] = req_data["piece_id"];
    if (board == NULL)
    {
        res_data["status"] = "ROOM_DOES_NOT_EXIST";
    }
    else
    {
        res_data["status"] = "SUCCESSFUL";

        std::set<std::pair<int, int>> legal_moves = board->get_legal_moves(res_data["player_id"], res_data["piece_id"]);

        res_data["position_array"] = {};
        for (auto move : legal_moves)
        {
            res_data["position_array"] += {{"x", move.first}, { "y", move.second }};
        }
    }

    return_data = res_data.dump();
}


// "res_id" : "valid_moves"
// "status" : "SUCCESSFUL"
// "position_array" : [{"x": 1, "y":2}, {}, {}]

//--------------------------------------------------------------------------------------

void Conn_handler::update_board(json req_data)
{
    Board* board = (*game)[req_data["room_id"]];
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];
    res_data["old_position"] = req_data["old_position"];

    board->undo_is = false;

    if (board == NULL)
    {
        res_data["status"] = "ROOM_DOES_NOT_EXIST";
        return;
    }

    board->old_position = { req_data["old_position"]["x"] , req_data["old_position"]["y"] };
    //update the board_map and piece_map
    board->move(req_data);
    //converting data to int

    board->new_position = { req_data["position"]["x"] , req_data["position"]["y"] };

    int x = req_data["position"]["x"];
    int y = req_data["position"]["y"];

    res_data["status"] = "SUCCESSFUL";
    res_data["player_id"] = req_data["player_id"];
    res_data["piece_id"] = req_data["piece_id"];
    res_data["position"] = req_data["position"];

    return_data = res_data.dump();
}

//--------------------------------------------------------------------------------------

//When player plays a move and 
void Conn_handler::validate_check(json req_data)
{
    Board* board = (*game)[req_data["room_id"]];
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];
    res_data["player_id"] = req_data["player_id"];
    if (board == NULL)
    {
        res_data["status"] = "ROOM_DOES_NOT_EXIST";
    }
    else
    {
        res_data["status"] = "SUCCESSFUL";

        if (board->calc_check(req_data["player_id"]) == true)
        {
            //Player in check
            //update the board under_check property of this player:to true
            board->update_under_check(req_data["player_id"], true);

            if (board->calc_checkmate(req_data["player_id"]) == true)
            {
                res_data["check_or_mate_status"] = "CHECK_MATE";
            }
            else
            {
                res_data["check_or_mate_status"] = "CHECK";
            }
        }
        else
        {
            //Player not in check
            //update the board under_check property of this player:to false
            board->update_under_check(req_data["player_id"], false);

            //but check for stalemate
            //If current player has no legal moves
            if (board->calc_stalemate(req_data["player_id"]) == true)
            {
                res_data["check_or_mate_status"] = "STALE_MATE";
            }
            else
            {
                res_data["check_or_mate_status"] = "NIL";
            }
        }
    }

    return_data = res_data.dump();
}

//--------------------------------------------------------------------------------------

void Conn_handler::pawn_promotion(json req_data)
{
    Board* board = (*game)[req_data["room_id"]];
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];
    res_data["player_id"] = req_data["player_id"];
    res_data["piece_id"] = req_data["piece_id"];
    res_data["position"] = req_data["position"];
    res_data["new_piece_id"] = req_data["new_piece_id"];


    if (board == NULL)
    {
        res_data["status"] = "ROOM_DOES_NOT_EXIST";
    }
    else
    {
        res_data["status"] = "SUCCESSFUL";
        int x = req_data["position"]["x"];
        int y = req_data["position"]["y"];
        
        std::pair<int, int> position = std::make_pair(x, y);

        board->pawn_promotion(req_data["player_id"], req_data["piece_id"], position, req_data["new_piece_id"]);
        

    }
    return_data = res_data.dump();
}

//--------------------------------------------------------------------------------------

void Conn_handler::undo(json req_data) {

    Board* board = (*game)[req_data["room_id"]];
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];

    if (board == NULL) {

        res_data["status"] = "ROOM_DOES_NOT_EXIST";

    }
    else{

        json undo_data = board->undo(req_data["player_id"]);

        int x = board->old_position.first;
        int y = board->old_position.second;

        if (undo_data["status"] == "SUCCESSFUL") {

            board->undo_is = true;

            res_data["position"]["x"] = x;
            res_data["position"]["y"] = y;
            res_data["player_id"] = undo_data["player_id"];
            res_data["piece_id"] = undo_data["piece_id"];
            res_data["status"] = undo_data["status"];
            res_data["revived_player_id"] = undo_data["revived_player_id"];
            res_data["revived_piece_id"] = undo_data["revived_piece_id"];
            res_data["revived_position"]["x"] = undo_data["revived_position"]["x"];
            res_data["revived_position"]["y"] = undo_data["revived_position"]["y"];
            res_data["is_demoted"] = undo_data["is_demoted"];
        }
        else {


            res_data["status"] = undo_data["status"];

        }

    }

    return_data = res_data.dump();
}

//--------------------------------------------------------------------------------------

void Conn_handler::redo(json req_data) {

    Board* board = (*game)[req_data["room_id"]];
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];


    if (board == NULL) {

        res_data["status"] = "ROOM_DOES_NOT_EXIST";

    }
    else {

        json redo_data = board->redo(req_data["player_id"]);

        int x = board->redo_new_position.first;
        int y = board->redo_new_position.second;

        if (redo_data["status"] == "SUCCESSFUL") {

            board->undo_is = false;

            res_data["position"]["x"] = x;
            res_data["position"]["y"] = y;
            res_data["player_id"] = redo_data["player_id"];
            res_data["piece_id"] = redo_data["piece_id"];
            res_data["status"] = redo_data["status"];
            res_data["killed_player_id"] = redo_data["killed_player_id"];
            res_data["killed_piece_id"] = redo_data["killed_piece_id"];
            res_data["killed_position"]["x"] = redo_data["killed_position"]["x"];
            res_data["killed_position"]["y"] = redo_data["killed_position"]["y"];
            res_data["pawn_promoted"] = redo_data["pawn_promoted"];

        }
        else {


            res_data["status"] = redo_data["status"];

        }
    }

    return_data = res_data.dump();

}

//--------------------------------------------------------------------------------------

void Conn_handler::reset_room(json req_data)
{

    bool success_game_reset = game->reset_room(req_data["room_id"]);
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];
    if (success_game_reset)
    {
        res_data["status"] = "SUCCESSFUL";
    }
    else
    {
        res_data["status"] = "NOT Reset";
    }

    return_data = res_data.dump();
}

//----------------------------------------------------------------------------------------
void Conn_handler::castle_move(json req_data) 
{
    
    Board* board = (*game)[req_data["room_id"]];
    json res_data = {};

    res_data["res_id"] = req_data["req_id"];
    res_data["room_id"] = req_data["room_id"];
    res_data["player_id"] = req_data["player_id"];
    res_data["piece_id"] = req_data["piece_id"];
    res_data["position"] = req_data["position"];
    


    if (board == NULL)
    {
        res_data["status"] = "ROOM_DOES_NOT_EXIST";
    }
    else
    {
        res_data["status"] = "SUCCESSFUL";
        int x = req_data["position"]["x"];
        int y = req_data["position"]["y"];

        std::pair<int, int> position = std::make_pair(x, y);

        board->castle_move(req_data["position"],position, req_data["player_id"]);


    }
    return_data = res_data.dump();
}
