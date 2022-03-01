"use strict";

(function() {

    /** Class for start date, most recent Earth date and most recent SOL date for mission (Data for validation). */
    class DataMis {
        /**
         * constructor - Update the parameters for a mission.
         * @param landing_date - the start date
         * @param max_date - the most recent Earth date
         * @param max_sol - the most recent SOL date
         */
        constructor(landing_date, max_date, max_sol) {
            this.landing_date = landing_date;
            this.max_date = max_date;
            this.max_sol = max_sol;
        }
    }

    /** Class for save an image */
    class SaveImage {
        /** constructor */
        constructor() {}

        /**
         * Add an image to the list of saved images. Addition will be made only if the image is not yet saved.
         * If the image is already saved, a model will appear if a message is appropriate.
         * Add to database (by fetch request to '/api/saveImg'), ul list and carousel.
         * If the request fails, logout.
         * @param img - the image to add
         */
        add(img) {
            loadingImg.remove('d-none');
            
            fetch('/api/saveImg', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "url": img.url,
                                            "imageId": img.imageId,
                                            "earthDate": img.earthDate,
                                            "sol": img.sol,
                                            "camera": img.camera})
            })
            .then(status)
            .then(function (response) {
                response.json().then(function ([image,created]) {
                    if(created) {
                        saveImg.addLiToList(image);
                        listSavedImg.lastElementChild.firstElementChild.addEventListener('click', saveImg.delete);
                        saveImg.addToCarousel(image);
                    }
                    else
                        document.getElementById("btnSavedModal").click(); //show savedModal
                });
            })
            .catch(function (err) {
                console.log('*** Fetch', err);
                document.getElementById("logout").click();
            })
            .finally(function () {
                loadingImg.add('d-none');
            });
        }

        /**
         * Add the image to listSavedImg.
         * @param img - the image to add
         */
        addLiToList(img) {
            let btnVisible = document.getElementById("edit-list").classList.contains('d-none') ? '' : 'd-none';
            listSavedImg.insertAdjacentHTML('beforeend',`<li class="${img.imageId}">
                        <button type="button" class="btn-delete btn btn-danger ${btnVisible} togglevisible">X</button>
                        <a href=${img.url} target="_blank">Image id: ${img.imageId}</a>
                        <p class="mb-0">
                            Earth date: ${img.earthDate} , Sol: ${img.sol} , Camera: ${img.camera}
                        </p>
                    </li>`);
        }

        /**
         * delete an image from the list of saved images.
         * delete from database (by fetch request to '/api/deleteImg'), ul list and carousel.
         * If the request fails, logout.
         * @param event - The event that clicked on
         */
        delete(event) {
            loadingImg.remove('d-none');

            const imageId = event.target.parentElement.className;
            fetch('/api/deleteImg', {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "imageId": imageId })
            })
            .then(status)
            .then(function () {
                event.target.parentElement?.remove();
                const carouselItem = carousel.getElementsByClassName(imageId).item(0);
                carouselItem?.remove();
                if(carouselItem?.classList.contains('active'))
                    document.getElementById("start-slide").click();
            })
            .catch(function (err) {
                console.log('*** Fetch', err);
                document.getElementById("logout").click();
            })
            .finally(function () {
                loadingImg.add('d-none');
            });
        }

        /**
         * Add the image to carousel.
         * @param img - the image to add
         */
        addToCarousel(img) {
            carousel.insertAdjacentHTML('beforeend',`<div class="carousel-item mb-3 ${img.imageId}">
                                <img src=${img.url} class="img-fluid" style="width: 35rem;" alt="...">
                                <div class="carousel-caption">
                                    <h5>${img.camera}</h5>
                                    <p>${img.earthDate}</p>
                                    <a href=${img.url} class="btn btn-primary" target="_blank">Full size</a>
                                </div>
                            </div>`);
        }
    }

    /**
     * a module for all validation functions
     * @type {{DateOrSolIsValid: ((function(*=, *): {isValid: boolean, message: string})|*),
     *         isNotEmpty: (function(*): {isValid: boolean, message: string}),
     *         hasDateOrSol: (function(*=): {isValid, message: string})}}
     */
    const validatorModule = (function() {
        /**
         * checks if a string is empty
         * Assumes that str is not NULL or undefined.
         * @param str - the string to validate
         * @returns {{isValid: boolean, message: string}} - a boolean and a message ins case validation failed.
         */
        const isNotEmpty = function (str)  {
            return  {
                isValid: (str.length !== 0),
                message: 'Input is required here'
            };
        }
        /**
         * Checks if the string is a date in YYYY-DD-MM format (with numbers), and that too is a valid date.
         * Or it contains a SOL date with numbers only.
         * Assumes that str is not NULL or undefined.
         * @param str - the string to validate
         * @returns {{isValid: (boolean|boolean), message: string}} - a boolean and a message ins case validation failed.
         */
        const hasDateOrSol = function (str) {
            return {
                isValid: (/^\d{4}(-\d{1,2}){2}$/.test(str) && !isNaN(Date.parse(str))) || /^\d+$/.test(str),
                message: 'please enter a SOL number or a valid date'
            }
        }
        /**
         * Checks if the date is correct for the selected mission.
         * If it's Earth date Checks if it's between the landing_date and the max_date of the selected mission.
         * And if it is a SOL date checks that it is smaller than the max_sol of the selected mission.
         * Assumes this is Earth date or SOL date greater than 0.
         * @param date - the date to validate
         * @param mis - the selected mission
         * @returns {{isValid: boolean, message: string}} - a boolean and a message ins case validation failed.
         */
        const DateOrSolIsValid = function (date, mis) {
            let msg = 'the mission you\'ve selected requires a';

            if(isNaN(date))
                return {
                    isValid: (new Date(date)) >= new Date(dataMissions[mis].landing_date) && (new Date(date)) <= new Date(dataMissions[mis].max_date),
                    message: (new Date(date)) < new Date(dataMissions[mis].landing_date) ?
                        `${msg} date after ${dataMissions[mis].landing_date}`: `${msg} date before ${dataMissions[mis].max_date}`
                }
            else
                return {
                    isValid: date <= dataMissions[mis].max_sol,
                    message: `${msg} SOL before ${dataMissions[mis].max_sol}`
                }
        }

        return {
            isNotEmpty: isNotEmpty,
            hasDateOrSol: hasDateOrSol,
            DateOrSolIsValid: DateOrSolIsValid
        }
    }) ();

    /**
     * A function that receives input and a validation function and checks that the input is correct according to the validation function.
     * If not correct display the error message that the validation function returns.
     * @param inputElement - the input to validate
     * @param validateFunc - the validation function
     * @param inputElement2 - the additional input for validation function of input with input (in another case it is null)
     * @returns {boolean|*} - a boolean ins case validation failed.
     */
    const validateInput = (inputElement, validateFunc, inputElement2 = null) => {
        let errorElement = inputElement.nextElementSibling; // the error message div
        let v = inputElement2 ? validateFunc(inputElement.value, inputElement2.value) : validateFunc(inputElement.value); // call the validation function
        errorElement.innerHTML = v.isValid ? '' : v.message; // display the error message
        v.isValid ? inputElement.classList.remove("is-invalid") : inputElement.classList.add("is-invalid");
        return v.isValid;
    }

    /**
     * Validate the input elements. (All validation is performed by the function validateInput)
     * validation for all inputs that are not empty,
     * if the date input is not empty, verify that it is also valid.
     * and if the rover input is not empty either, verify that the date is also correct for the rover.
     * @param dateOrSolElem - the dateOrSol input
     * @param roverElem - the rover input
     * @param cameraElem - the camera input
     * @returns {boolean|*} - a boolean in case the form input validation failed. (true only if all validations are true)
     */
    const validateForm = (dateOrSolElem, roverElem, cameraElem) => {
        dateOrSolElem.value = dateOrSolElem.value.trim();

        // display all errors, force checking all fields
        let v1 = (validateInput(dateOrSolElem, validatorModule.isNotEmpty) && validateInput(dateOrSolElem, validatorModule.hasDateOrSol));
        let v2 = validateInput(roverElem, validatorModule.isNotEmpty);
        let v3 = validateInput(cameraElem, validatorModule.isNotEmpty);

        return (v1 && v2) ? (validateInput(dateOrSolElem, validatorModule.DateOrSolIsValid, roverElem) && v3) : (v1 && v2 && v3);
    }

    /** Reset all errors (warning sign and error message). */
    const resetErrors = function() {
        document.querySelectorAll(".is-invalid").forEach((e) => e.classList.remove("is-invalid"));
        document.querySelectorAll(".errormessage").forEach((e) => e.innerHTML = "");
    }

    const APIKEY = '35o9qm3Lb8FhMAnLsVYbTmSCOh4DLkdrTn0IoFYt'; // api_key to requests from NASA
    const dataMissions = {}; // data of Curiosity, Opportunity and Spirit
    const saveImg = new SaveImage();

    // elements initialization happens in DOMContentLoaded
    let listSavedImg = null;
    let listResults = null;
    let loadingImg = null;
    let searchBtn = null;
    let carousel =  null;

    /** attach listeners to buttons save */
    function attachListenersForSave() {
        for (const b of document.getElementsByClassName("btn-save"))
            b.addEventListener('click', (event) => {
                const e = event.target.parentElement.parentElement.parentElement;
                saveImg.add({url: e.firstElementChild.src,
                            imageId: Number(e.id),
                            earthDate: e.dataset.earthDate,
                            sol: Number(e.dataset.sol),
                            camera: e.dataset.camera});
            });
    }

    /** remove all results in listResults */
    function clearResults() {
        while(listResults.firstElementChild)
            listResults.firstElementChild.remove();
    }

    /**
     * upon loading initializes the elements,
     * get manifest data of all missions,
     * get saved Images list of the user,
     * and attaches the button handlers
     * (search (submit), clear (reset), start and stop slide show, edit list, finish editing, clear list).
     */
    document.addEventListener('DOMContentLoaded', function () {
        listSavedImg = document.getElementById('savedImagesList');
        listResults = document.getElementById('searchResults');
        loadingImg = document.getElementById('loadingImg').classList;
        searchBtn = document.getElementById("search").classList;
        carousel = document.querySelector(".carousel-inner");

        getManifestOfMissions();
        getSavedImages();

        const searchForm = document.getElementById("searchForm");

        /** Submit a request listener: stop submit, clear results and fetch the request after validating */
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            clearResults();
            searchImages();
        });

        /** Reset form listener: reset the form, clear results and reset errors */
        searchForm.addEventListener("reset", function (){
            clearResults();
            resetErrors();
        });

        /** start slide carousel listener: start slide carousel if is inactive */
        document.getElementById("start-slide").addEventListener('click', () => {
            if(!carousel.querySelector(".active"))
                carousel.firstElementChild?.classList.add("active"); //start slide
        });

        /** stop slide carousel listener: stop slide carousel if is active */
        document.getElementById("stop-slide").addEventListener('click', () => {
            carousel.querySelector(".active")?.classList.remove("active");
        });

        /** edit-list listener: show the buttons clear-list and delete an item in the list */
        document.getElementById("edit-list").addEventListener('click', toggleDisplay);

        /** finish-editing listener: hide the buttons clear-list and delete an item in the list */
        document.getElementById("finish-editing").addEventListener('click', toggleDisplay);

        /**
         * clear-list listener: delete all images from the list of saved images.
         * delete from database (by fetch request to '/api/deleteAll'), ul list and carousel.
         * If the request fails, logout.
         */
        document.getElementById("clear-list").addEventListener('click', () => {
            loadingImg.remove('d-none');

            fetch('/api/deleteAll', { method: "DELETE" })
            .then(status)
            .then(function () {
                while(listSavedImg.firstElementChild)
                    listSavedImg.firstElementChild.remove();

                while(carousel.firstElementChild)
                    carousel.firstElementChild.remove();
            })
            .catch(function (err) {
                console.log('*** Fetch', err);
                document.getElementById("logout").click();
            })
            .finally(function () {
                loadingImg.add('d-none');
            });
        });
    });

    /**
     * Get manifest data of all missions (Curiosity, Opportunity, Spirit)
     * Performs a fetch request for each mission and saves the required data in dataMissions.
     * After obtaining all the required data we will activate the search button in form (it disabled button).
     * If we have not obtained all the data, an error message will be displayed to the user.
     */
    function getManifestOfMissions() {
        loadingImg.remove('d-none');

        const missions = ['Curiosity', 'Opportunity', 'Spirit'];

        missions.forEach((mis) =>
            fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${mis}?api_key=${APIKEY}`)
                .then(status)
                .then(res => res.json())
                .then(json => {
                    dataMissions[mis] = new DataMis(json.photo_manifest.landing_date,json.photo_manifest.max_date,json.photo_manifest.max_sol);
                    if(Object.keys(dataMissions).length === 3) {
                        loadingImg.add('d-none');
                        searchBtn.remove("disabled");
                    }
                })
                .catch(function() {
                    document.getElementById("errorNasaServer").classList.remove("d-none");
                    loadingImg.add('d-none');
                }));
    }

    /**
     * get all images of the list of saved images.
     * get from database (by fetch request to '/api/savedImages'), and insert to ul list and to carousel.
     * If the request fails, logout.
     */
    function getSavedImages() {
        loadingImg.remove('d-none');

        fetch('/api/savedImages')
            .then(status)
            .then(function (response) {
                response.json().then(function (imagesList) {
                    imagesList.forEach((img) => {
                        saveImg.addLiToList(img);
                        saveImg.addToCarousel(img);
                    });

                    /** attach listeners to buttons delete */
                    for (const b of document.getElementsByClassName("btn-delete"))
                        b.addEventListener('click', saveImg.delete);
                });
            })
            .catch(function (err) {
                console.log('*** Fetch', err);
                document.getElementById("logout").click();
            })
            .finally(function () {
                if(Object.keys(dataMissions).length === 3)
                    loadingImg.add('d-none');
            });
    }

    /**
     * Checks if the response status is OK (OK: the response status is between 200 and 300).
     * @param response - the response
     * @returns {Promise<never>|Promise<unknown>} - Promise with the response if is OK, else Promise with the Error.
     */
    function status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    /**
     * Fetch the request after validating.
     * if the request was successful insert the results in the search results.
     * else an error message will be displayed to the user.
     * if there are images in the results displays them in the image card with details and option to save.
     * While sending the request, the search button is disabled.
     */
    function searchImages() {
        const dateOrSol = document.getElementById("dateOrSol");
        const rover = document.getElementById("rover");
        const camera = document.getElementById("camera");

        if (validateForm(dateOrSol, rover, camera)) {
            loadingImg.remove('d-none');
            searchBtn.add("disabled");

            // build the URL parameters string
            const params = new URLSearchParams()
            params.append(isNaN(dateOrSol.value) ? 'earth_date' : 'sol', dateOrSol.value);
            params.append('camera', camera.value);
            params.append('api_key', APIKEY);

            fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover.value}/photos?${params.toString()}`)
                .then(status)
                .then(res => res.json())
                .then(json => {
                    if (json.photos.length) {
                        json.photos.forEach((item) =>
                            listResults.insertAdjacentHTML('beforeend', `<div class="col">
                                <div class="card h-100" id="${item.id}" data-earth-date="${item.earth_date}" data-sol="${item.sol}" data-camera="${item.camera.name}" style="width: 18rem;">
                                    <img src=${item.img_src} class="card-img-top img-fluid" alt="...">
                                    <div class="card-body">
                                        <p class="card-text">Earth date: ${item.earth_date}</p>
                                        <p class="card-text">Sol: ${item.sol}</p>
                                        <p class="card-text">Camera: ${item.camera.name}</p>
                                        <p class="card-text">Mission: ${item.rover.name}</p>
                                        <div class="d-grid gap-2 d-md-flex">
                                            <button type="button" class="btn btn-info btn-save">Save</button>
                                            <a href=${item.img_src} class="btn btn-primary" target="_blank">Full size</a>
                                        </div>
                                    </div>
                                </div>
                            </div>`));

                        attachListenersForSave();
                    } else
                        listResults.innerHTML = '<div class="col"><div class="bg-warning p-2 text-dark bg-opacity-25 rounded"><h3><b>No images found!</b></h3></div></div>';
                })
                .catch(function () {
                    listResults.innerHTML = `<div class="col d-flex mt-4"><div class="card border-danger"><div class="card-body text-danger">
                                             <p class="card-text">Sorry, the request failed... try again!</p></div></div></div>`;
                }).finally(function () {
                    loadingImg.add('d-none');
                    searchBtn.remove("disabled");
            });
        }
    }

    /**
     * toggle display for all elements with class name togglevisible
     */
    function toggleDisplay() {
        document.querySelectorAll(".togglevisible").forEach((e) => e.classList.toggle("d-none"));
    }
})()
