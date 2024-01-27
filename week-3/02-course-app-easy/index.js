const express = require("express");
const app = express();
const PORT = 3000;
const { v1: uuidv1, v4: uuidv4 } = require("uuid");

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { email: crrEmail, password: crrPassword } = req.headers;

  const adminCrrAccData = ADMINS.filter(
    ({ email, password }) => email === crrEmail && password === crrPassword
  );
  const doesAccountExist = adminCrrAccData.length > 0;

  if (doesAccountExist) {
    next();
  } else {
    res.status(400).send({ message: "User is not Admin" });
  }
};

// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const {
    body: { email, password },
  } = req;
  ADMINS.push({
    email,
    password,
  });
  res.status(200).send({ message: "Admin created successfully" });
});

app.post("/admin/login", (req, res) => {
  // logic to log in admin
  const { email: crrEmail, password: crrPassword } = req.headers;

  const adminCrrAccData = ADMINS.filter(
    ({ email, password }) => email === crrEmail && password === crrPassword
  );
  const doesAccountExist = adminCrrAccData.length > 0;

  if (doesAccountExist) {
    res.status(200).send({ message: "Logged in successfully" });
  } else {
    res.status(400).send({ message: "User does not exist" });
  }
});

app.post("/admin/courses", adminAuthentication, (req, res) => {
  // logic to create a course
  const { email, password } = req.headers;
  const { title, description, price, imageLink, published } = req.body;
  const newId = uuidv4();

  COURSES.push({ id: newId, ...req.body });

  res
    .status(200)
    .send({ message: "Course created successfully", courseId: newId });
});

app.put("/admin/courses/:courseId", adminAuthentication, (req, res) => {
  // logic to edit a course
  const keysToUpdate = Object.keys(req.body);
  const { courseId } = req.params;
  const courseToEdit = COURSES.filter(({ id }) => courseId === id)[0];
  for (let i = 0; i < keysToUpdate.length; i++) {
    courseToEdit[keysToUpdate[i]] = req.body[keysToUpdate[i]];
  }

  res.status(200).send({ message: "Course updated successfully" });
});

app.get("/admin/courses", adminAuthentication, (req, res) => {
  // logic to get all courses
  res.status(200).send(COURSES);
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
  const {
    body: { email, password },
  } = req;
  USERS.push({
    email,
    password,
    purchasedCourses: [],
  });
  res.status(200).send({ message: "User created successfully" });
});

app.post("/users/login", (req, res) => {
  // logic to log in user
  const { email: crrEmail, password: crrPassword } = req.headers;

  const userCrrAccData = USERS.filter(
    ({ email, password }) => email === crrEmail && password === crrPassword
  );
  const doesAccountExist = userCrrAccData.length > 0;

  if (doesAccountExist) {
    res.status(200).send({ message: "Logged in successfully" });
  } else {
    res.status(400).send({ message: "User does not exist" });
  }
});

app.get("/users/courses", (req, res) => {
  // logic to list all courses
  res.status(200).send(COURSES);
});

app.post("/users/courses/:courseId", (req, res) => {
  // logic to purchase a course
  const { email: crrEmail, password: crrPassword } = req.headers;
  const { courseId } = req.params;

  const crrUser = USERS.filter(({ email, password }) => email === crrEmail)[0];
  const purchasedCourse = COURSES.filter(({ id }) => courseId === id)[0];
  crrUser.purchasedCourses.push(purchasedCourse);

  res.status(200).send({ message: "Course Purchased Successfully" });
});

app.get("/users/purchasedCourses", (req, res) => {
  // logic to view purchased courses

  const { email: crrEmail, password: crrPassword } = req.headers;
  const crrUser = USERS.filter(({ email, password }) => email === crrEmail)[0];
  res.status(200).send(crrUser["purchasedCourses"]);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
