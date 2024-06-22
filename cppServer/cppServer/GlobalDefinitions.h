#pragma once
#include <string>

#ifndef GLOBALDEFINITIONS_H
#define GLOBALDEFINITIONS_H

namespace ID {
	extern const std::string ROOK1	;
	extern const std::string ROOK2	;
	extern const std::string KNIGHT1 ;
	extern const std::string KNIGHT2 ;
	extern const std::string BISHOP1 ;
	extern const std::string BISHOP2 ;
	extern const std::string KING	;
	extern const std::string QUEEN	;
	extern const std::string PAWN1	;
	extern const std::string PAWN2	;
	extern const std::string PAWN3	;
	extern const std::string PAWN4	;
	extern const std::string PAWN5	;
	extern const std::string PAWN6	;
	extern const std::string PAWN7	;
	extern const std::string PAWN8	;
	extern const std::string PLAYER1 ;
	extern const std::string PLAYER2 ;
}


struct json_move {
	std::string room_id;
	std::string player_id;
	std::string piece_id;
	std::pair<int, int> new_position;
};

#endif


