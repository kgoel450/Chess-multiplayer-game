## Server-Side :

**Technology and Responsiblity:**
- **Node.js** for Server implementation, this includes **socket.io** for client to Node Server communication.
- **expressJS** for Rest API in node.js for **page serves, authentication routes and stats update routes**.
- **C++**'s **Boost::Asio** was used for Game logic server (this is second server besides node). Only responsibility is to keep game state and provide logic behind all the chess functions.
- **axios** 
    - for sending http requests from Node server to Cpp server for game State updates and game logic.
- **Firebase** - authentication is provided using firebase auth via email and password. Auth requests are made from client to server via **"/api/login"** or **"/api/register"**, and gets a user token (if authenticated) for subsequent requests.

## Client-Side :

**Technology and Responsiblity:** 
- **HTML**, **CSS**, and **JS** were used for the frontend.
- **socket.io** was also used in client to write emitters and listeners for to and fro from Node server.
- **axios** was used for sending http requests from client to Node server for authentication and stats update.
- **Auth :** Uses axios for making request for register and login.
- **Database :** 
    - Uses axios to make stats update in the case of checkmate and stalemate.
    - Fetches leaderboard data and personal stats and renders them onto the window.
- **Conv AI :** was used to provide users with an AI assistant that was configured to act as a chess grandmaster and help users with chess related queries.

---
## Installation 
from the base folder, for **C++ Server**,
```sh
cd cppServer
```
Open the project in Visual Studio, and run the program.

On the Node side,from the base folder
```sh
cd nodeServer
```
Install the node modules required
```sh
npm install
```
## Run

### Start the React frontend
from the nodeServer folder,
```sh
npm start
```
note:
Node server - http://localhost:3000
Cpp server - http://localhost:5000

## Result
we can now access the Game at the "http://localhost:3000" default address.

## Note
In **Node Server** folder, 
* **Client/js/utils.js** - environment variables for client
* **.env** - environment varibles for server

.env - 
* **SERVER_IP** : should be set to required local IP, by default its localhost
* **N_PORT** : port where node server is running, by default its 3000
* **C_PORT** : port where c++ server is running, by default its 5000

Convai : is **voiceEnabled : true**, this works only when **SERVER_IP is localhost**. when its is set to ip's like "10.65.13.3" the default browser stops the audiocontext from creating. and thus the ai chat feature does not work.

---