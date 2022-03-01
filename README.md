[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-f059dc9a6f8d3a56e377f745f24479a46679e63a5d9fe6f495e02850cd0d8118.svg)](https://classroom.github.com/online_ide?assignment_repo_id=6632747&assignment_repo_type=AssignmentRepo)
# ex4 - Mars Images nodejs 
Locate Mars images with user authentication (including registration option) and saving the user's image list in a database.

Register for the site by:
• E-mail
• First name
• Last Name
• Password (after sending name and email)

After registration, the user (with his details) is stored in a database (SQLite).
Note: The user must complete the registration process (name + email + password) within one minute of sending name and email.

Login to the site by:
• Email
• Password

After a successful login, the server returns access site for NASA's Mars image database. with the logged on username displayed (at the top) inside the page.
The site allows:
1. Search images.
2. Favorite images list (displayed after login to the site).
3. Save photos to the favorites list.
4. Show the favorites  list in the carousel.
5. Editing the Favorites List:
   deleting an image / clearing the entire list.

There is also a logout button to exit the site (will return the user to the login page).

Note: The list is stored in a database (SQLite).

Explanation of access site for NASA's Mars image database:
First the program obtains data on the various tasks.
Only after obtaining all the required data we will activate the search button in form (it disabled button).
If data obtaining failed, an error message will be displayed.
In addition, the program will display the list of the user's favorite images (stored in a database).

The search by: date (in Earth date or sol date format), task selection, camera selection.
After validation of the input, A REST API request is sent to a NASA server upon user input.
The result will be displayed to the user in "search results".
If there are pictures each picture will be displayed inside a card with details and a save button.
If there are no pictures, the user will be notified that there are no pictures.
If the request fails, the user will be notified that the request failed.

When saving an image the image will be displayed in the list of saved images.
If the image is already saved, a message will be displayed.
In addition, you can activate and stop a carousel that displays the saved images.

Other notes:
There are functions that can be written as anonymous functions but for order in the code I wrote them as regular functions.

<h1>Elie Frankenhuis</h1>
<p>Email: eliezerfr@edu.hac.ac.il</p>

<h1>Initialization</h1>
<p>
Open console, execute : npm install
</p>
<h1>Execution</h1>
<p>Use the configuration in Webstorm (top right 'play' button) or: open terminal,
and execute : node bin/www
</p>
<p>
Then open your browser at http://localhost:3000
</p>
<h1>Assumptions</h1>
<p>
  The site use bootstap CDN therefore assumes an internet connection is available.
</p>
