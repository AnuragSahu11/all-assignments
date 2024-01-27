const express = require("express");
const app = express();
const PORT = 3000;
const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const fs = require("fs");

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
    jwt.verify(token, JWT_SECRET_ADMIN, async (err, decoded) => {
      if (decoded) {
        const adminData = await readJson("admin");
        const adminCrrAccData = adminData.find(
          ({ email }) => email === decoded
        );
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
    jwt.verify(token, JWT_SECRET_USERS, async (err, decoded) => {
      if (decoded) {
        const usersData = await readJson("users");
        const userCrrAccData = usersData.find(({ email }) => email === decoded);
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

const readJson = async (fileName) => {
  try {
    const jsonFileData = await fs.promises.readFile(`./files/${fileName}.json`);
    return JSON.parse(jsonFileData);
  } catch (err) {
    return err;
  }
};

const writeJson = async (fileName, jsonData) => {
  try {
    const jsonFileData = await fs.promises.writeFile(
      `./files/${fileName}.json`,
      JSON.stringify(jsonData)
    );
    return jsonData;
  } catch (err) {
    return err;
  }
};

// Admin routes
app.post("/admin/signup", async (req, res) => {
  // logic to sign up admin
  const {
    body: { email, password },
  } = req;

  try {
    const token = jwt.sign(email, JWT_SECRET_ADMIN);
    const adminAccData = await readJson("admin");
    const doesAccountExist = adminAccData.find(
      ({ email: userEmail }) => email === userEmail
    );
    if (doesAccountExist) {
      res.status(400).send({ message: "Account Already Exists" });
    } else {
      adminAccData.push({
        email,
        password,
      });
      const createNewAcc = await writeJson("admin", adminAccData);

      res
        .status(200)
        .send({ message: "Admin created successfully", token: token });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post("/admin/login", async (req, res) => {
  // logic to log in admin
  const { email: crrEmail, password: crrPassword } = req.body;

  try {
    const adminAccData = await readJson("admin");
    const adminCrrAccData = adminAccData.filter(
      ({ email, password }) => email === crrEmail && password === crrPassword
    );
    const doesAccountExist = adminCrrAccData.length > 0;
    const token = jwt.sign(crrEmail, JWT_SECRET_ADMIN);

    if (doesAccountExist) {
      res.status(200).send({ message: "Logged in successfully", token });
    } else {
      res.status(400).send({ message: "User does not exist" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post("/admin/courses", adminAuthentication, async (req, res) => {
  // logic to create a course
  const { email, password } = req.user;
  const { title, description, price, imageLink, published } = req.body;
  try {
    const newId = uuidv4();
    const allCourses = await readJson("courses");
    allCourses.push({ id: newId, ...req.body });
    const createCourse = await writeJson("courses", allCourses);

    res
      .status(200)
      .send({ message: "Course created successfully", courseId: newId });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.put("/admin/courses/:courseId", adminAuthentication, async (req, res) => {
  // logic to edit a course
  try {
    const { courseId } = req.params;
    const allCourses = await readJson("courses");

    const courseToEdit = allCourses.filter(({ id }) => courseId === id)[0];
    Object.assign(courseToEdit, req.body);

    const editedData = await writeJson("courses", allCourses);

    res.status(200).send({ message: "Course updated successfully" });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/admin/courses", adminAuthentication, async (req, res) => {
  // logic to get all courses
  try {
    const allCourses = await readJson("courses");

    res.status(200).send(allCourses);
  } catch (err) {
    res.status(400).send(err);
  }
});

// User routes
app.post("/users/signup", async (req, res) => {
  // logic to sign up user
  const {
    body: { email, password },
  } = req;

  try {
    const token = jwt.sign(email, JWT_SECRET_USERS);
    const adminAccData = await readJson("users");
    const doesAccountExist = adminAccData.find(
      ({ email: userEmail }) => email === userEmail
    );
    if (doesAccountExist) {
      res.status(400).send({ message: "Account Already Exists" });
    } else {
      adminAccData.push({
        email,
        password,
        purchasedCourses: [],
      });
      const createNewAcc = await writeJson("users", adminAccData);

      res
        .status(200)
        .send({ message: "Admin created successfully", token: token });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post("/users/login", async (req, res) => {
  // logic to log in user
  const { email: crrEmail, password: crrPassword } = req.body;

  try {
    const adminAccData = await readJson("users");
    const adminCrrAccData = adminAccData.filter(
      ({ email, password }) => email === crrEmail && password === crrPassword
    );
    const doesAccountExist = adminCrrAccData.length > 0;
    const token = jwt.sign(crrEmail, JWT_SECRET_USERS);

    if (doesAccountExist) {
      res.status(200).send({ message: "Logged in successfully", token });
    } else {
      res.status(400).send({ message: "User does not exist" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/users/courses", userAuthentication, async (req, res) => {
  // logic to list all courses

  try {
    const courses = await readJson("courses");
    res.status(200).send(courses);
  } catch (err) {
    res.status(200).send(err);
  }
});

app.post("/users/courses/:courseId", userAuthentication, async (req, res) => {
  // logic to purchase a course
  try {
    const { courseId } = req.params;
    const usersData = await readJson("users");
    const crrUserData = usersData.find(({ email }) => email === req.user.email);
    crrUserData.purchasedCourses.push(courseId);
    // req.user.purchasedCourses.push(courseId);
    const data = await writeJson("users", usersData);

    res.status(200).send({ message: "Course Purchased Successfully" });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/users/purchasedCourses", userAuthentication, async (req, res) => {
  // logic to view purchased courses

  try {
    const {
      email: crrEmail,
      password: crrPassword,
      purchasedCourses,
    } = req.user;
    const allCourses = await readJson("courses");
    const crrUserPurchasedCourses = purchasedCourses.map((courseId) => {
      return allCourses.find(({ id }) => id === courseId);
    });
    res.status(200).send(crrUserPurchasedCourses);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
