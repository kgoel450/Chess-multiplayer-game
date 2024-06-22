require("dotenv").config();
const { fireApp } = require("../config/firebase.js");
const {
    collection,
    query,
    limit,
    orderBy,
    getCountFromServer,
    where,
    doc,
    updateDoc,
    getDocs,
    getFirestore,
} = require("firebase/firestore");
const db = getFirestore(fireApp);
const usersCollectionRef = collection(db, "users");
var cuid = require('cuid');

//---------Checkmate Update Handler ------------------------------------------//
exports.checkmateUpdate = async (req, res) => {
    console.log("update handler reached");
    const { uid, uid_opp, win} = req.body;
    console.log(uid, uid_opp, win);
    const userQueryA = query(usersCollectionRef, where("uid", "==", uid));
    const userQueryB = query(usersCollectionRef, where("uid", "==", uid_opp));

    let playerA = {};
    let playerB = {};

    const userQuerySnapshot = await getDocs(userQueryA)
    userQuerySnapshot.forEach((Ele) => {
        playerA = {
            ...Ele.data(),
            docId: Ele.id
        };
    });

    const userQuerySnapshot2 = await getDocs(userQueryB)
    userQuerySnapshot2.forEach((Ele) => {
        playerB = {
            ...Ele.data(),
            docId: Ele.id
        };
    });


    let expectedScoreA = 1 / (1 + Math.pow(10, (playerB.rating - playerA.rating) / 100));
    let expectedScoreB = 1 / (1 + Math.pow(10, (playerA.rating - playerB.rating) / 100));

    let scoreA = win;
    let scoreB = 1 - win;


    let newRatingA = Math.round(playerA.rating + 30 * (scoreA - expectedScoreA));
    let newRatingB = Math.round(playerB.rating + 30 * (scoreB - expectedScoreB));

    console.log(newRatingA, playerA.rating);
    console.log(newRatingB, playerB.rating);

    const playerARef = doc(db, "users", playerA.docId);
    const playerBRef = doc(db, "users", playerB.docId);

    let statUpdatesA = {};
    let statUpdatesB = {};
    const matchId = cuid();

    statUpdatesA = {
        rating: newRatingA,
        win: playerA.win + win,
        loss: playerA.loss + (1 - win),
        matchList: [...playerA.matchList, {
            matchId: matchId,
            type: win == 1 ? "win" : "loss",
            oppUid: playerB.uid,
            oppUserName: playerB.userName
        }],
        ratingChangeList: [...playerA.ratingChangeList, {
            matchId: matchId,
            ratingChange: newRatingA - playerA.rating
        }]
    };

    statUpdatesB = {
        rating: newRatingB,
        win: playerB.win + (1 - win),
        loss: playerB.loss + win,
        matchList: [...playerB.matchList, {
            matchId: matchId,
            type: win == 0 ? "win" : "loss",
            oppUid: playerA.uid,
            oppUserName: playerB.userName
        }],
        ratingChangeList: [...playerB.ratingChangeList, {
            matchId: matchId,
            ratingChange: newRatingB - playerB.rating
        }]
    };


    try{
        await updateDoc(playerARef, statUpdatesA);
        await updateDoc(playerBRef, statUpdatesB);
        res.status(200).json({
            message: "update successful"
        });
    }
    catch(error)
    {
        res.status(500).json({
            message: `error : ${error.message}`
        });
    }

    
};

//---------Stalemate Update Handler ------------------------------------------//

exports.stalemateUpdate = async (req, res) => {
    const { uid, uid_opp} = req.body;
    const userQueryA = query(usersCollectionRef, where("uid", "==", uid));
    const userQueryB = query(usersCollectionRef, where("uid", "==", uid_opp));

    let playerA = {};
    let playerB = {};

    const userQuerySnapshot = await getDocs(userQueryA)
    userQuerySnapshot.forEach((Ele) => {
        playerA = {
            ...Ele.data(),
            docId: Ele.id
        };
    });

    const userQuerySnapshot2 = await getDocs(userQueryB)
    userQuerySnapshot2.forEach((Ele) => {
        playerB = {
            ...Ele.data(),
            docId: Ele.id
        };
    });


    let expectedScoreA = 1 / (1 + Math.pow(10, (playerB.rating - playerA.rating) / 100));
    let expectedScoreB = 1 / (1 + Math.pow(10, (playerA.rating - playerB.rating) / 100));

    let scoreA = 0.5;
    let scoreB = 0.5;

    let newRatingA = Math.round(playerA.rating + 30 * (scoreA - expectedScoreA));
    let newRatingB = Math.round(playerB.rating + 30 * (scoreB - expectedScoreB));

    console.log(newRatingA, playerA.rating);
    console.log(newRatingB, playerB.rating);

    const playerARef = doc(db, "users", playerA.docId);
    const playerBRef = doc(db, "users", playerB.docId);

    let statUpdatesA = {};
    let statUpdatesB = {};
    const matchId = cuid();

    statUpdatesA = {
        rating: newRatingA,
        draw: playerA.draw + 1,
        matchList: [...playerA.matchList, {
            matchId: matchId,
            type: "draw",
            oppUid: playerB.uid,
            oppUserName: playerB.userName
        }],
        ratingChangeList: [...playerA.ratingChangeList, {
            matchId: matchId,
            ratingChange: newRatingA - playerA.rating,
        }]
    };

    statUpdatesB = {
        rating: newRatingB,
        draw: playerB.draw + 1,
        matchList: [...playerB.matchList, {
            matchId: matchId,
            type: "draw",
            oppUid: playerA.uid,
            oppUserName: playerB.userName
        }],
        ratingChangeList: [...playerB.ratingChangeList, {
            matchId: matchId,
            ratingChange: newRatingB - playerB.rating
        }]
    };

    try{
        await updateDoc(playerARef, statUpdatesA);
        await updateDoc(playerBRef, statUpdatesB);
        res.status(200).json({
            message: "update successful"
        });
    }
    catch(error)
    {
        res.status(500).json({
            message: `error : ${error.message}`
        });
    }
    
};

//---------Check mate Update Handler ------------------------------------------//
exports.getLeadersStats = async (req, res) => {

    console.log("leader Stat fetched");
    const userOffset = (req.query.page-1)*req.query.quantity;
    if(req.query.orderField == undefined)
        {
            req.query.orderField = "rating";
        }
    const leaderListQuery = query(usersCollectionRef, orderBy(req.query.orderField, "desc"), limit(req.query.quantity*req.query.page))
    const leaderList = await getDocs(leaderListQuery);
    let list = [];
    leaderList.forEach( user => {
        list = [...list, {
            userName: user.data().userName,
            rating: user.data().rating,
            games: user.data().win + user.data().loss + user.data().draw + user.data().resign,
            win: user.data().win
        }]
    })

    const pageList = list.slice(userOffset, userOffset + req.query.quantity);

    if(pageList.length == 0)
        {
            res.status(200).json({
                empty: "true",
                leaderList: pageList,
            });
        }
        else
        {
            res.status(200).json({
                empty: "false",
                leaderList: pageList,
            });
        }
}

exports.getUserStats = async (req, res) => {
    const userId = req.user.uid;
    const userQuery= query(usersCollectionRef, where("uid", "==", userId));

    let player = {};

    const userQuerySnapshot = await getDocs(userQuery)
    userQuerySnapshot.forEach((Ele) => {
        player = {
            ...Ele.data(),
            docId: Ele.id
        };
    });

    let matches = [];
    player.matchList.forEach((match, index) => {
        matches.push({
            opponent: match.oppUserName,
            result: match.type,
            ratingChange: player.ratingChangeList[index].ratingChange
        })
    })

    let ratingGraph = [];
    player.ratingChangeList.forEach((match) => {
        ratingGraph.push(match.ratingChange)
    })

    let responseData = {
        win: player.win,
        loss: player.loss,
        draw: player.draw,
        resign: player.resign,
        rating: player.rating,
        userName: player.userName,
        matches: matches,
        ratingGraph: ratingGraph
    }


    res.status(200).json(responseData);

}

exports.demo = async (req, res) => {
    // const userQuery = query(usersCollectionRef, where("userName", "==", req.body.userName));
    // const userQuerySnapshot = await getDocs(userQuery)
    // userQuerySnapshot.forEach((user) => {
    //     console.log(user.data())
    // })
    const snap = await getCountFromServer(query(usersCollectionRef, where("userName", "==", req.body.userName)
      ));
    res.status(200).json({
        count: snap.data().count
    });
}