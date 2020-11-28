var userLib = require("./userlib");
var bodyParser = require("body-parser");
var session = require("express-session");
const activeSession = {};
const activeAdmin = {};
const adminPassword = "admin123";

// user = {name:"SAndeep S J",userid:"sandeepsj",passord:"sandeep", email:"sandeepsj@gmail.com"}
// try {
//   userLib.getImages("storage/sandeepsj");
// } catch (error) {
//   console.log(error);
// }

const express = require("express");
const cors = require("cors");
const { createNewUser } = require("./userlib");
const app = express();

//var publicDir = require("path").join(__dirname, "/storage");
app.use(express.static("."));

//use cors to allow cross origin resource sharing
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "sdlfjljrowuroweu",
    cookie: { secure: false },
  })
);

var auth = function (req, res, next) {
  // console.log(activeSession);

  if (activeSession[req.sessionID] !== undefined) return next();
  else {
    res.status(401);
    throw `user not logged in - ${req.body.username}`;
  }
};

var adminAuth = function (req, res, next) {
  // console.log(activeSession);

  if (activeAdmin[req.sessionID] !== undefined) return next();
  else {
    res.status(401);
    throw `user not logged in - ${req.body.username}`;
  }
};

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/signup", (req, res) => {
  try {
    console.log(req.body);
    userLib.createNewUser(req.body);
  } catch (error) {
    console.log(error);
  }
});

app.get("/logout", (req, res) => {
  console.log("Successfully logged out", activeSession[req.sessionID]);
  activeSession[req.sessionID] = undefined;
  req.session.destroy();
  res.send("logout success");
});

app.post("/getImagesAuth", auth, (req, res) => {
  // console.log(req.session, "session", req.sessionID);
  let user = activeSession[req.sessionID];
  try {
    userLib.getImages(`storage/${user}/${req.body.path}`, (files) =>
      res.send(files)
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/loginAuth", (req, res) => {
  try {
    // console.log(req.session, "session", req.sessionID);
    // console.log(req.body.username, req.body.password);
    userLib.login(req.body.username, req.body.password, () => {
      activeSession[req.sessionID] = req.body.username;
      console.log(`Successfully logged in ${req.body.username}`);
      res.send(true);
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/adminLoginAuth", (req, res) => {
  if (req.body.password === adminPassword) {
    activeAdmin[req.sessionID] = "admin";
  } else {
    console.log("Wrong password for Admin Authentication");
  }
});

app.get("/rename", auth, (req, res) => {
  try {
    userLib.rename(req.body.path, req.body.oldName, req.body.newName, () => {
      console.log("renamed");
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete_file", auth, (req, res) => {
  try {
    userLib.delete_file(req.body.file);
    res.send("Success");
  } catch (err) {
    res.send(err);
    console.log(err);
  }
});

app.get("/getMyProfile", auth, (req, res) => {
  try {
    userLib.getMyProfile(activeSession[req.sessionID], (profile) => {
      res.send(profile);
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/updateProfile", auth, (req, res) => {
  try {
    userLib.updateProfile(req.body);
  } catch (err) {
    console.log(err);
  }
});

app.get("/getMyUserName", (req, res) => {
  try {
    res.send(activeSession[req.sessionID]);
  } catch (err) {
    console.log(err, "on getMyUserName");
  }
});

// app.get("/getFileAuth",  (req, res) => {
//   console.log(req.query);
//   userLib.getFile(req.query["dir"], res);
// });
const port = process.env.PORT || 3005;
app.listen(port, () => console.log(`listening to port ${port}`));
