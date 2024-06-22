#pragma once
#include <map>
#include <string>
#include "Board.h"

class Game
{
public:
	std::map<std::string, Board* > game_map;

	Game(); //Constructor
	~Game(); // Destructor
	
	bool create_room(std::string);
	bool delete_room(std::string);
	bool reset_room(std::string);

	Board *operator[](std::string room_id)
	{
		try
		{
			if (game_map.find(room_id) == game_map.end())
			{
				throw("Room : " + room_id + " Does Not Exist");
			}
		}
		catch (const std::string& error)
		{
			std::cerr
				<< error
				<< std::endl;
			return NULL;
		}
		std::cout << "\nIn game class roomid: " << room_id;
		std::cout << "\ngamemap::roomid: " << game_map[room_id];
		return game_map[room_id];
	}
};


