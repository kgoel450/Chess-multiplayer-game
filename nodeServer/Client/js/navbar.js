
let pageNumber = 1;
const navThemeOption = () => {
    const ThemeModal = document.getElementById("popup-themes");
    ThemeModal.style.display = "block";
}

const globalLeaderOption = () => {
    const leaderModal = document.getElementById("popup-global");
    leaderModal.style.display = "block";
    pageNumber = 1;
    fetchLeaderData(pageNumber);
}

const personalStatOption = () => {
    const personalModal = document.getElementById("popup-personal");
    personalModal.style.display = "block";
    pageNumberPersonal = 1;
    fetchPersonalData();
}

const restartOption = () => {
    new Notify({
        status: "success",
        title: "Game Reset Successful",
        text: "Continue Playing Again",
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

const helperOption = () => {
    const ThemeModal = document.getElementById("popup-aichat");
    ThemeModal.style.display = "block";
}

const fetchLeaderData = async () => {
    if (pageNumber == 1) {
        const previousButton = document.querySelector('#previousPage');
        previousButton.style.pointerEvents = "none";
        previousButton.classList.add("disabled-button");
    }
    else {
        const previousButton = document.querySelector('#previousPage');
        previousButton.style.pointerEvents = "all";
        previousButton.classList.remove("disabled-button");
    }
    console.log("called with" + pageNumber)
    await axiosInstance.get(`http://${SERVER_IP}:${N_PORT}/api/leader-stats?page=${pageNumber}&quantity=5&orderField=rating`)
        .then((response) => {

            if (response.data.empty == "true") {
                pageNumber = pageNumber - 1;
                const nextButton = document.querySelector('#nextPage');
                nextButton.style.pointerEvents = "none";
                nextButton.classList.add("disabled-button");
            }
            else {
                const nextButton = document.querySelector('#nextPage');
                nextButton.style.pointerEvents = "all";
                nextButton.classList.remove("disabled-button");

                const leaderData = response.data.leaderList;
                var tableBody = document.querySelector('.tableGlobal tbody');
                tableBody.innerHTML = '';

                console.log(leaderData);

                leaderData.forEach(function (data, index) {

                    var newRow = document.createElement('tr');
                    var rankCell = document.createElement('td');
                    rankCell.textContent = "#" + ((pageNumber - 1) * 5 + index + 1).toString();
                    rankCell.classList.add("globalData");
                    newRow.appendChild(rankCell);

                    var usernameCell = document.createElement('td');
                    usernameCell.textContent = data.userName;
                    usernameCell.classList.add("globalData");
                    newRow.appendChild(usernameCell);

                    var eloRatingCell = document.createElement('td');
                    eloRatingCell.textContent = data.rating;
                    eloRatingCell.classList.add("globalData");
                    newRow.appendChild(eloRatingCell);

                    var matchesPlayedCell = document.createElement('td');
                    matchesPlayedCell.textContent = data.games;
                    matchesPlayedCell.classList.add("globalData");
                    newRow.appendChild(matchesPlayedCell);

                    var totalWinsCell = document.createElement('td');
                    totalWinsCell.textContent = data.win;
                    totalWinsCell.classList.add("globalData");
                    newRow.appendChild(totalWinsCell);

                    tableBody.appendChild(newRow);
                });
                const pageNumberElement = document.querySelector('#pageNumber');
                pageNumberElement.textContent = pageNumber.toString();
            }
        })

}

const incrementPage = () => {
    pageNumber = pageNumber + 1;
    fetchLeaderData();
}

const decrementPage = () => {
    pageNumber = pageNumber - 1;
    fetchLeaderData();
}

const fetchPersonalData = async () => {
    await axiosInstance.get(`http://${SERVER_IP}:${N_PORT}/api/user-stats`)
        .then((response) => {
            const data = response.data;

            //add username
            const usernameCell = document.querySelector('.userNameData');
            usernameCell.textContent = data.userName;

            //add rating 
            const ratingCell = document.querySelector('.userRatingData');
            ratingCell.textContent = data.rating;

            //add windata
            const winCell = document.querySelector('.winData')
            winCell.textContent = data.win;

            //add lossdata
            const lossCell = document.querySelector(".lossData")
            lossCell.textContent = data.loss;

            //add drawdata
            const drawCell = document.querySelector(".drawData")
            drawCell.textContent = data.draw;

            //add resigndata
            const resignCell = document.querySelector(".resignData")
            resignCell.textContent = data.resign;

            var tableBody = document.querySelector('.tableStat tbody');
            tableBody.innerHTML = '';

            //data.matches.forEach(function (match, index) {
            for (let i = data.matches.length - 1; i >= 0; i--) {
                var newRow = document.createElement('tr');
                var matchIndexCell = document.createElement('td');
                matchIndexCell.textContent = (i).toString();
                matchIndexCell.classList.add("statData");
                newRow.appendChild(matchIndexCell);

                var oppnameCell = document.createElement('td');
                oppnameCell.textContent = data.matches[i].opponent;
                oppnameCell.classList.add("statData");
                newRow.appendChild(oppnameCell);

                var statusCell = document.createElement('td');
                statusCell.textContent = data.matches[i].result;
                statusCell.classList.add("statData");
                newRow.appendChild(statusCell);

                var ratingChangeCell = document.createElement('td');
                ratingChangeCell.textContent = data.matches[i].ratingChange;

                if (data.matches[i].ratingChange >= 0) {
                    ratingChangeCell.classList.add("positiveRatingChangeData");
                }
                else {
                    ratingChangeCell.classList.add("negativeRatingChangeData");
                }

                newRow.appendChild(ratingChangeCell);
                tableBody.appendChild(newRow);
            };

            let yaxis = [650];
            let xaxis = [""];
            for (let i = 0; i < data.ratingGraph.length; i++) {
                yaxis.push(yaxis[i] + data.ratingGraph[i]);
                xaxis.push(data.matches[i].opponent);
            }
            graphContruct(xaxis, yaxis);

        })
}

const graphContruct = async (labels, data) => {

    new Chart(
        document.getElementById('graphColumn'),
        {
            type: 'line',
            data: {
                //  borderColor: Utils.CHART_COLORS.red,
                // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
                // pointStyle: 'circle',
                // pointRadius: 10,
                // pointHoverRadius: 15,
                labels: labels,
                options: {
                    aspectRatio: 1,
                },
                datasets: [
                    {
                        label: 'Rating Changes',
                        data: data
                    }
                ],
            }
        }
    );
};
