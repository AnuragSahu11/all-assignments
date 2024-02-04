const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const mongoConnectionURI =
  "mongodb+srv://coolanuragsahu9:321321@course-app.mdhrqof.mongodb.net/CourseApp";

const app = express();

app.use(express.json());
app.use(cors());

const JWT_SECRET_ADMIN = "SECRET_ADMIN";
const JWT_SECRET_USERS = "SECRET_USERS";

const JWT_EXPIRATION_TIME = "1hr";

mongoose.connect(mongoConnectionURI);

const adminAuthentication = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET_ADMIN, async (err, decodedToken) => {
      if (decodedToken) {
        req.user = decodedToken.email;
        next();
      } else {
        res.status(400).send({ message: "Token not valid" });
      }
    });
  } else {
    res.status(400).send({ message: "Not Authorized" });
  }
};
const userAuthentication = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET_USERS, async (err, decodedToken) => {
      if (decodedToken) {
        req.user = decodedToken.email;
        next();
      } else {
        res.status(400).send({ message: "Token not valid" });
      }
    });
  } else {
    res.status(400).send({ message: "Not Authorized" });
  }
};

// Define Schemas

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  published: [{ type: mongoose.Schema.Types.ObjectId, ref: "courses" }],
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
});

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("users", userSchema);
const Admin = mongoose.model("admins", adminSchema);
const Course = mongoose.model("courses", courseSchema);

// Admin routes
app.post("/admin/signup", async (req, res) => {
  // logic to sign up admin
  const {
    body: { email, password },
  } = req;

  try {
    const admin = await Admin.findOne({ email });
    if (admin) {
      res.status(403).send("Account Already Exists");
    } else {
      const newUser = { email, password };
      const newAdmin = await Admin(newUser);
      await newAdmin.save();
      const token = jwt.sign({ email }, JWT_SECRET_ADMIN, {
        expiresIn: JWT_EXPIRATION_TIME,
      });
      res.status(200).send({ message: "Account Created", token });
    }
  } catch (err) {
    res.status(400).send("Encountered an Error");
  }
});

app.post("/admin/login", async (req, res) => {
  // logic to log in admin

  const { email, password } = req.body;
  try {
    const crrUser = await Admin.findOne({ email });
    if (crrUser) {
      const token = jwt.sign({ email }, JWT_SECRET_ADMIN, {
        expiresIn: JWT_EXPIRATION_TIME,
      });
      res.status(200).send({ message: "User Logged In", token });
    } else {
      res.status(400).send("User does not exist.");
    }
  } catch (err) {
    res.status(400).send("Internal Server Error");
  }
});

app.post("/admin/courses", adminAuthentication, async (req, res) => {
  // logic to create a course

  try {
    const { title, description, price, imageLink, published } = req.body;
    const newCourse = await Course(req.body);
    await newCourse.save();
    res.status(200).send({ message: "Course Created" });
  } catch (err) {
    res.status(400).send({ message: "Internal Server Error" });
  }
});

app.put("/admin/courses/:courseId", adminAuthentication, async (req, res) => {
  // logic to edit a course
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndUpdate(courseId, req.body);
    res.status(200).send({
      message: "Course updated",
    });
  } catch (err) {
    res.status(400).send("Internal Server Error");
  }
});

app.get("/admin/courses", adminAuthentication, async (req, res) => {
  // logic to get all courses

  try {
    const course = await Course.find();
    res.status(200).send(course);
  } catch (err) {
    res.status(400).send("Internal Server Error");
  }
});

// User routes
app.post("/users/signup", async (req, res) => {
  // logic to sign up user

  const {
    body: { email, password },
  } = req;

  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(403).send("Account Already Exists");
    } else {
      const newUserDetails = { email, password, published: [] };
      const newUser = await User(newUserDetails);
      await newUser.save();
      const token = jwt.sign({ email }, JWT_SECRET_USERS, {
        expiresIn: JWT_EXPIRATION_TIME,
      });
      res.status(200).send({ message: "Account Created", token });
    }
  } catch (err) {
    res.status(400).send("Encountered an Error");
  }
});

app.post("/users/login", async (req, res) => {
  // logic to log in user

  const { email, password } = req.body;
  try {
    const crrUser = await User.findOne({ email });
    if (crrUser) {
      const token = jwt.sign({ email }, JWT_SECRET_USERS, {
        expiresIn: JWT_EXPIRATION_TIME,
      });
      res.status(200).send({ message: "User Logged In", token });
    } else {
      res.status(400).send("User does not exist.");
    }
  } catch (err) {
    res.status(400).send("Internal Server Error");
  }
});

app.get("/users/courses", userAuthentication, async (req, res) => {
  // logic to list all courses

  try {
    const course = await Course.find();
    res.json(course);
  } catch (err) {
    res.status(400).send("Internal Server Error");
  }
});

app.post("/users/courses/:courseId", userAuthentication, async (req, res) => {
  // logic to purchase a course

  try {
    const courseId = req.params.courseId;
    const crrUserData = await User.findOne({ email: req.user });
    crrUserData.published.push(`${courseId}`);
    await crrUserData.save();
    res.status(200).send({ message: "Course Purchased" });
  } catch (err) {
    res.status(400).send("Internal Server Error");
  }
});

app.get("/users/purchasedCourses", userAuthentication, async (req, res) => {
  // logic to view purchased courses

  try {
    const crrUserPurchasedCourseData = await User.findOne({
      email: req.user,
    }).populate("published");

    if (crrUserPurchasedCourseData) {
      res.status(200).json(crrUserPurchasedCourseData);
    }
  } catch (err) {
    res.status(400).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
