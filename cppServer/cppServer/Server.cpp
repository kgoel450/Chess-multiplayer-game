#include "Server.h"

Server::Server(
    asio::io_context& io_context,
    int port
) : acceptor_(
    io_context,
    ip::tcp::endpoint(ip::tcp::v4(), port)
)
{
    game = new Game();
    //boost::asio::ip::tcp::endpoint endpoint(boost::asio::ip::address::from_string("192.168.1.1"), 8080);
    ip::address add = ip::tcp::endpoint(ip::tcp::v4(),port).address();
    std::cout <<" "<<add.to_string()<< " " << "GAME RESET" << game->game_map.size() << std::endl;

    start_accept(game);

}

//--------------------------------------------------------------------------------------


Server::~Server()
{
    delete game;
    std::cout << "Game is Deleted." << std::endl;
}

//--------------------------------------------------------------------------------------

void Server::start_accept(Game *game)
{
    // socket
    Conn_handler::pointer connection = 
        Conn_handler::create(
            (asio::io_context&)acceptor_.get_executor().context(),
            game);

    // asynchronous accept operation and wait for a new connection.
    acceptor_.async_accept(connection->getSocket(),
        boost::bind(&Server::handle_accept, this, connection,
            boost::asio::placeholders::error));
}

//--------------------------------------------------------------------------------------

void Server::handle_accept(
    Conn_handler::pointer connection, 
    const boost::system::error_code& err
)
{
    if (!err) {
        std::cout << "connected" << std::endl;
        connection->start();
    }
    start_accept(game);
}
