var userLib = require("./userlib");
var bodyParser = require("body-parser");
var session = require("express-session");
var adminLib = require("./adminlib");
var base64Img = require("base64-img");

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
bodyParser = {
  json: { limit: "50mb", extended: true },
  urlencoded: { limit: "50mb", extended: true },
};
var auth = function (req, res, next) {
  // console.log(activeSession);

  if (activeSession[req.sessionID] !== undefined) return next();
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

app.get("/getMyStatus", auth, (req, res) => {
  try {
    res.send({
      used: adminLib.getUserDiskUsage(activeSession[req.sessionID]),
      allowed: adminLib.getUserAllowedSpace(activeSession[req.sessionID]),
      photosCount: adminLib.getPhotosCount(
        `./storage/${activeSession[req.sessionID]}`
      ),
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/uploadImage", auth, (req, res) => {
  try {
    base64Img.img(
      req.body.image,
      `./storage/${activeSession[req.sessionID]}/${req.body.dir}`,
      req.body.fname,
      function (err, filepath) {
        res.send("Sucess");
      }
    );
  } catch (err) {
    console.log(err);
  }
});

/*  
Here onwared Admin requests Starts
...............
.
.
.
.
.*/

var adminAuth = function (req, res, next) {
  // console.log(activeSession);

  if (activeAdmin[req.sessionID] !== undefined) return next();
  else {
    res.status(401);
    throw `admin not logged in`;
  }
};

app.get("/getAllUserData", adminAuth, (req, res) => {
  try {
    res.send(adminLib.getAllUserData());
  } catch (err) {
    console.log(err);
  }
});

app.post("/updateAllowedSpace", adminAuth, (req, res) => {
  try {
    adminLib.updateAllowedSpace(req.body.userid, req.body["Allowed Space"]);
  } catch (err) {
    console.log(err);
  }
});

app.get("/getCounts", adminAuth, (req, res) => {
  try {
    res.send({
      count_of_photos: adminLib.getPhotosCount(),
      count_of_users: adminLib.getUsersCount(),
      total_disk_space: adminLib.getTotalDiskusage(),
    });
  } catch (err) {
    console.log(err);
  }
});

const port = process.env.PORT || 3005;
app.listen(port, () => console.log(`listening to port ${port}`));
