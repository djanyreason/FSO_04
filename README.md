This repository is for exercises in Part 4 of Full Stack Open (FSO), "Testing Express servers, user administration" - https://fullstackopen.com/en/part4

The exercises for this part build a back-end server with NodeJS and Express. The server connects to a MongoDB database. The API and database store both data for a collection of blog posts, and a list of authorized users (with username and password). The blog model contains the user who added the blog to the database, and the user model contains an array of the blogs that user has added.

The API also handles token-based user authentication.

The project also includes testing through jest - tests are included in the /blogList/tests subfolder.

This project builds upon topics covered in Part 3 of FSO, including nodemon, Postman, Visual Studio Code REST client, middleware, and linting.

The the project that handles the following calls in the following manners:
* GET /API/blogs - returns all blogs in database, populating the userName, name, and id of the user who added the blog
* POST /API/blogs - if a valid token and a valid blog entry are included in the request header, adds the blog to the database
* DELTE /API/blogs/:id - if a valid token is in the request header with a user that matches the user who added the blog, deletes the blog from the database
* PUT /API/blogs/:id - if a valid token is in the request header with a user that matches the user who added the blog, updates the blog info with information contained in the request header

* GET /API/users/ - returns all users in database, populating the blog arrays with the blog's url, title, author, and id
* POST /API/users/ - if the request header includes the necessary username and password field, adds a new user to the database with a password hash

* POST /API/login/ - if the request header contains a valid username and password returns a token valid for 1 hour; otherwise returns 401
