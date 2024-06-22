//********************************************************* 
// 
// This is the entry point for the game
// creates a server class object and pass the port
// we pant cpp server to run on, and route will be 
// device ipv4
// 
//*********************************************************

#include <boost/asio.hpp>
#include <iostream>
#include <string>
#include <stdexcept>
#include "server.h"
#include "Conn_handler.h"

namespace asio = boost::asio;
namespace ip = asio::ip;
using namespace nlohmann;

int main(int argc, char* argv[])
{

    try
    {
        asio::io_context io_context;
        Server server(io_context, 5000);
        io_context.run();
    }
    catch (std::exception& e)
    {
        std::cerr << e.what() << std::endl;
    }
    return 0;
}
