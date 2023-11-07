/**
  You need to create a HTTP server in Node.js which will handle the logic of an authentication server.
  - Don't need to use any database to store the data.

  - Save the users and their signup/login data in an array in a variable
  - You can store the passwords in plain text (as is) in the variable for now

  The expected API endpoints are defined below,
  1. POST /signup - User Signup
    Description: Allows users to create an account. This should be stored in an array on the server, and a unique id should be generated for every new user that is added.
    Request Body: JSON object with username, password, firstName and lastName fields.
    Response: 201 Created if successful, or 400 Bad Request if the username already exists.
    Example: POST http://localhost:3000/signup

  2. POST /login - User Login
    Description: Gets user back their details like firstname, lastname and id
    Request Body: JSON object with username and password fields.
    Response: 200 OK with an authentication token in JSON format if successful, or 401 Unauthorized if the credentials are invalid.
    Example: POST http://localhost:3000/login

  3. GET /data - Fetch all user's names and ids from the server (Protected route)
    Description: Gets details of all users like firstname, lastname and id in an array format. Returned object should have a key called users which contains the list of all users with their email/firstname/lastname.
    The users username and password should be fetched from the headers and checked before the array is returned
    Response: 200 OK with the protected data in JSON format if the username and password in headers are valid, or 401 Unauthorized if the username and password are missing or invalid.
    Example: GET http://localhost:3000/data

  - For any other route not defined in the server return 404

  Testing the server - run `npm run test-authenticationServer` command in terminal
 */

const express = require("express");
const PORT = 3000;
const app = express();
const bodyParser = require("body-parser");

const { v1: uuidv1, v4: uuidv4 } = require("uuid");
// write your logic here, DONT WRITE app.listen(3000) when you're running tests, the tests will automatically start the server

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

app.use(bodyParser.json());

const userList = [];

app.post("/signup", (req, res) => {
  const {
    body: { firstName, lastName, userName, password },
  } = req;

  const userNameAlreadyExists =
    userList.filter(({ userName: crrUserName }) => crrUserName === userName)
      .length > 0;

  if (userNameAlreadyExists) {
    res.status(400).send("ACCOUNT ALREADY EXISTS");
  } else {
    const requestedNewUser = {
      id: uuidv4(),
      firstName,
      lastName,
      userName,
      password,
    };
    userList.push(requestedNewUser);

    res.status(201).send("ACCOUNT CREATED");
  }
});

app.post("/login", (req, res) => {
  const { userName, password } = req.body;

  const requestedUser = userList.filter(
    ({ userName: crrUserName, password: crrPassword }) =>
      userName === crrUserName && password === crrPassword
  );

  if (requestedUser.length > 0) {
    res.status(201).send(requestedUser);
  } else {
    res.status(400).send("UNAUTHORIZED");
  }
});

app.get("/data", (req, res) => {
  const { userName, password } = req.headers;
  const isValidReq = userList.filter(
    ({ userName: crrUserName, password: crrUserPassword }) =>
      userName === crrUserName && crrUserPassword === password
  );
  if (isValidReq) {
    res.status(200).send(JSON.stringify(userList));
  }
});

module.exports = app;
