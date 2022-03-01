"use strict";

(function() {
    /** upon loading attaches the button handlers */
    document.addEventListener('DOMContentLoaded', function () {

        const registerForm = document.getElementById("registerForm");

        /**
         * Submit a request listener: stop submit, checks that the email no already exists in the database
         * (by fetch request to '/api/emailCheck') and continues the submit.
         * If already exists showing a message about it.
         */
        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const email = document.getElementById("emailAddress");

            fetch('/api/emailCheck', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "email": email.value.toLowerCase().trim() })
            })
            .then(function (response) {
                // handle the error
                if (!response.ok)
                    throw response.status;

                response.json().then(function (data) {
                    if (data.emailAlreadyExists)
                        document.getElementById("emailAlreadyExists").classList.remove('d-none');
                    else {
                        document.getElementById("emailAlreadyExists").classList.add('d-none');
                        registerForm.submit();  // to send the form
                    }
                });
            })
            .catch(function (err) {
                console.log('*** Fetch Error :', err);
            });
        });
    });
})()
