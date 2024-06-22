
const axiosInstance = axios.create({
    withCredentials: true
});

const toast = (status, title, text) => {
    return new Notify({
        status: status,
        title: title,
        text: text,
        effect: 'slide',
        speed: 300,
        customClass: '',
        customIcon: '',
        showIcon: true,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 3000,
        notificationsGap: 3000,
        notificationsPadding: null,
        type: 'filled',
        position: 'right top',
        customWrapper: '',
    })
}

const signUpHandler = () => {
    const userName = document.getElementById('rUserName').value;
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const confirmPassword = document.getElementById('rcPassword').value;

    if (password != confirmPassword) {
        toast('warning', 'Passwords do not Match', 'Try Again');
        return;
    }
    const body = {
        userName: userName,
        email: email,
        password: password
    }
    axiosInstance.post(`http://${SERVER_IP}:${N_PORT}/api/register`, body)
        .then((response) => {
            toast('success', 'Registration Successful 😊', 'Redirecting to Login Page');
            setTimeout(() => {
                const loginLink = document.getElementById("login-link");
                loginLink.click();
            }, 2000);

        })
        .catch((error) => {
            if (error.response && error.response.status === 409) {
                toast("info", error.response.data.message, "Try with other credentials");
            } else {
                console.log("Error:", error);
            }
        })
}


const signInHandler = () => {
    const email = document.getElementById('Email').value;
    const password = document.getElementById('Password').value;

    const body = {
        email: email,
        password: password
    }
    console.log("inside client login handler", SERVER_IP);
    axiosInstance.post(`http://${SERVER_IP}:${N_PORT}/api/login`, body)
        .then((response) => {
            if (response.status == 200) {
                toast("success", "Login Successful", "")
                window.location.href = `http://${SERVER_IP}:${N_PORT}/menu`
                sessionStorage.setItem('uid', response.data.userCredential.user.uid);
            }
        })
        .catch((error) => {
            if (error.response && error.response.status === 401) {
                toast("error", "Invalid Credentials", "Try Again");
            } else {
                console.log("Error:", error);
            }
        })
}

const signOutHandler = () => {
    axiosInstance.post(`http://${SERVER_IP}:${N_PORT}/api/logout`)
        .then((response) => {
            window.location.href = `http://${SERVER_IP}:${N_PORT}/`;
        })
        .catch((error) => {
            if (error.response && error.response.status === 401) {
                alert("Invalid Credentials, Try Again");
            } else {
                console.log("Error:", error);
            }
        })
}


const toggleForm = () => {
    const loginForm = document.querySelector("#login-form");
    const signupForm = document.querySelector("#signup-form");

    loginForm.classList.toggle("hidden");
    signupForm.classList.toggle("hidden");
}