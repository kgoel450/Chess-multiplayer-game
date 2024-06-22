#pragma once

//********************************************************* 
// 
// Server implementation - this is an asynchronous server
// it uses conn_handler class to make connection and make
// it keeps the server listening to new requests after
// request by creating a shared pointer for the conn_handler
// object.
// 
//*********************************************************


#include "Conn_handler.h"
#include <boost/asio.hpp>
#include <boost/bind.hpp>
#include <boost/enable_shared_from_this.hpp>

namespace asio = boost::asio;
namespace ip = asio::ip;

class Server
{
private:

    // Main game object should be created only once
    // during the server lifetime, it keeps the state
    // of all the active games.

    Game* game;

    ip::tcp::acceptor acceptor_;
    void start_accept(Game*);

public:
    
    Server(asio::io_context&, int);
    ~Server();
    
    //async accept handler for connection

    void handle_accept(Conn_handler::pointer, const boost::system::error_code&);
};

