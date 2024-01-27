const express = require("express");
const app = express();
const PORT = 3000;
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const JWT_SECRET_ADMIN = "LEARN";
const JWT_SECRET_USERS = "LEARN_USERS";

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    const token = authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET_ADMIN, (err, decoded) => {
      if (decoded) {
        const adminCrrAccData = ADMINS.find(({ email }) => email === decoded);
        req.user = adminCrrAccData;
        next();
      } else {
        throw err;
      }
    });
  } catch (err) {
    res.status(400).send({ message: "User is not Admin" });
  }
};

const userAuthentication = async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    const token = authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET_USERS, (err, decoded) => {
      if (decoded) {
        const userCrrAccData = USERS.find(({ email }) => email === decoded);
        req.user = userCrrAccData;
        next();
      } else {
        throw err;
      }
    });
  } catch (err) {
    res.status(400).send({ message: "User is not Authorized" });
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
  const token = jwt.sign(email, JWT_SECRET_ADMIN);

  res.status(200).send({ message: "Admin created successfully", token: token });
});

app.post("/admin/login", (req, res) => {
  // logic to log in admin
  const { email: crrEmail, password: crrPassword } = req.body;

  const adminCrrAccData = ADMINS.filter(
    ({ email, password }) => email === crrEmail && password === crrPassword
  );
  const doesAccountExist = adminCrrAccData.length > 0;

  const token = jwt.sign(crrEmail, JWT_SECRET_ADMIN);

  if (doesAccountExist) {
    res.status(200).send({ message: "Logged in successfully", token });
  } else {
    res.status(400).send({ message: "User does not exist" });
  }
});

app.post("/admin/courses", adminAuthentication, (req, res) => {
  // logic to create a course
  const { email, password } = req.user;
  const { title, description, price, imageLink, published } = req.body;
  const newId = uuidv4();

  COURSES.push({ id: newId, ...req.body });

  res
    .status(200)
    .send({ message: "Course created successfully", courseId: newId });
});

app.put("/admin/courses/:courseId", adminAuthentication, (req, res) => {
  // logic to edit a course
  const { courseId } = req.params;
  const courseToEdit = COURSES.filter(({ id }) => courseId === id)[0];
  Object.assign(courseToEdit, req.body);

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
  const token = jwt.sign(email, JWT_SECRET_USERS);
  res.status(200).send({ message: "User created successfully", token });
});

app.post("/users/login", (req, res) => {
  // logic to log in user
  const { email: crrEmail, password: crrPassword } = req.body;

  const userCrrAccData = USERS.filter(
    ({ email, password }) => email === crrEmail && password === crrPassword
  );
  const doesAccountExist = userCrrAccData.length > 0;

  const token = jwt.sign(crrEmail, JWT_SECRET_USERS);

  if (doesAccountExist) {
    res.status(200).send({ message: "Logged in successfully", token });
  } else {
    res.status(400).send({ message: "User does not exist" });
  }
});

app.get("/users/courses", userAuthentication, (req, res) => {
  // logic to list all courses
  res.status(200).send(COURSES);
});

app.post("/users/courses/:courseId", userAuthentication, (req, res) => {
  // logic to purchase a course
  const { courseId } = req.params;

  req.user.purchasedCourses.push(courseId);
  res.status(200).send({ message: "Course Purchased Successfully" });
});

app.get("/users/purchasedCourses", userAuthentication, (req, res) => {
  // logic to view purchased courses

  const { email: crrEmail, password: crrPassword, purchasedCourses } = req.user;
  const crrUserPurchasedCourses = purchasedCourses.map((courseId) => {
    return COURSES.find(({ id }) => id === courseId);
  });
  res.status(200).send(crrUserPurchasedCourses);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
