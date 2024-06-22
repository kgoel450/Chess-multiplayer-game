require("dotenv").config();
const { fireApp } = require("../config/firebase.js");

const {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} = require("firebase/auth");

const { collection, query, getCountFromServer, where, addDoc, getFirestore } = require("firebase/firestore");

const db = getFirestore(fireApp);
const auth = getAuth();
const usersCollectionRef = collection(db, "users");

//---------Signup Handler ------------------------------------------//
exports.registerUser = async (req, res) => {
    const { userName, email, password } = req.body;

    //check if the username already exists
    const sameUsername = await getCountFromServer(query(usersCollectionRef, where("userName", "==", req.body.userName)
    ));
    if (sameUsername.data().count != 0) {
        return res.status(409).json({
            message: "username already exists",
        });
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;
        await addDoc(usersCollectionRef, {
            uid: user.uid,
            userName: userName,
            email: email,
            win: 0,
            draw: 0,
            resign: 0,
            loss: 0,
            matchList: [],
            ratingChangeList: [],
            rating: 650
        });
        console.log("User Created");
        res.status(201).json({
            message: "user created successfully",
        });
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            res.status(409).json({
                message: "email already in use",
            });
        } else {
            res.status(500).json({
                message: `${error.message} : An error occured while registering`,
            });
        }
    }
};

//---------Signin Handler ------------------------------------------//
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("inside server login handler : ", req.body);
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const idToken = userCredential._tokenResponse.idToken
            if (idToken) {
                res.cookie('access_token', idToken, {
                    httpOnly: true
                });
                res.status(200).json({ message: "User logged in successfully", userCredential });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        })
        .catch((error) => {
            if (error.code === "auth/invalid-credential") {
                res.status(401).json({ message: "Invalid credentials" });
            } else {
                res.status(500).json({ message: `${error.message} : An error occured while logging in` });
            }
        });
};

exports.logoutUser = async (req, res) => {
    signOut(auth)
        .then(() => {
            res.clearCookie('access_token');
            res.status(200).json({ message: "User logged out successfully" });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        });
}