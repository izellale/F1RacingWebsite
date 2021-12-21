
//  Call the function after window Load completed.
window.addEventListener("load", getAllDrivers);

const searchDrivers = document.getElementById("drivers");
searchDrivers.addEventListener("change", getAllDrivers);

const BASE_URL = "https://formula-api-youssef.herokuapp.com";

let driversFetched = false;

/**
 * Main function called to get driver.
 */
function getAllDrivers() {
    getDrivers();
    const driver = searchDrivers.options[searchDrivers.selectedIndex];
    fetchData(driver.value);
}

/**
 * Function that fetch the list of all drivers.
 */
function getDrivers() {
    if (!driversFetched) {
        const DRIVERS_URL_REQUEST = `${BASE_URL}/api/drivers`;

        //  Fetch Request to the API.
        fetch(DRIVERS_URL_REQUEST)
            .then(response => response.json())
            .then(data => {
                const drivers = data.data;
                //  Remove the previous option to avoid duplication.
                searchDrivers.remove(0);

                for (let i = 0; i < drivers.length; i++) {
                    let driverOption = document.createElement('option');
                    driverOption.value = drivers[i].driverId;
                    driverOption.innerHTML = drivers[i].forename + " " + drivers[i].surname;
                    //  Select Lewis Hamilton as default driver.
                    if (driverOption.value === "1") driverOption.selected = true;
                    searchDrivers.appendChild(driverOption);
                }
            })
            .catch((err) => console.log(err));

        driversFetched = true;
    }
}

/**
 * Update the number of pole positions of a driver
 * @param {*} driverId the selected driver 
 */
function getPolePosition(driverId) {
    const API_URL = `${BASE_URL}/api/qualify?driverId=${driverId}&position=1`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const qualifications = data.data;
            let pole = qualifications.length;
            updateIndividualUI("pposition", pole);
        });
}


function fetchData(driverId) {
    const DRIVERS_URL_REQUEST = `${BASE_URL}/api/drivers/${driverId}`;

    fetch(DRIVERS_URL_REQUEST)
        .then(response => response.json())
        .then(data => {
            const driver = data.data[0];
            updateIndividualUI("dob", driver.dob);
            updateIndividualUI("nationality", driver.nationality);
            getRaceWins(driver.driverId);
            getPodiums(driver.driverId);
            getPolePosition(driver.driverId);
            getTeam(driver.driverId);
        })
        .catch((err) => console.log(err));
}



function updateIndividualUI(cardName, data) {
    const card = document.getElementById(cardName);
    card.innerHTML = data;
}


/**
 * Update the number of races won
 * @param {*} driverId the driver selected
 */
function getRaceWins(driverId) {
    const API_URL = `${BASE_URL}/api/results?driverId=${driverId}&position=1`;
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const wins = data.data.length;
            updateIndividualUI("wins", wins);
        });
}


/**
 * Update the number of podiums a driver got
 * @param {*} driverId selected driver
 */
function getPodiums(driverId) {
    const API_URL = `${BASE_URL}/api/standing?driverId=${driverId}`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const allStandings = data.data;
            let podium = 0;
            for (let i = 0; i < allStandings.length; i++) {
                if (parseInt(allStandings[i].position) <= 3) {
                    podium++;
                }
            }
            updateIndividualUI("podium", podium);
        });
}


/**
 * Update the Team of the driver
 * @param {*} driverId the driver seleceted 
 */
function getTeam(driverId) {
    const API_URL = `${BASE_URL}/api/races?year=2020`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const raceId = data.data[0].raceId;
            getConstructorId(driverId, raceId);
        });
}


function getConstructorId(driverId, raceId) {
    const API_URL = `${BASE_URL}/api/results?driverId=${driverId}&raceId=${raceId}`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const constructorId = data.data.length !== 0 ? data.data[0].constructorId : -1;
            getConstructorName(constructorId);
        });
}

function getConstructorName(constructorId) {
    if (constructorId === -1) {
        updateIndividualUI("team", "Retired");
    }
    else {
        const API_URL = `${BASE_URL}/api/constructors/${constructorId}`;

        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                const constructorName = data.data[0].name;
                updateIndividualUI("team", constructorName);
            });
    }


}