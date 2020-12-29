const userLib = require("./userlib");
const bodyParser = require("body-parser");
const session = require("express-session");
const adminLib = require("./adminlib");
const base64Img = require("base64-img");
const logLib = require("./loglib");

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

writeLog = function (user, head, message) {
  logLib.addlog(user, head, message);
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
  var user = activeSession[req.sessionID];
  if (user !== undefined) writeLog(user, "logout", "User Logged out");
  console.log("Successfully logged out", user);
  user = undefined;
  req.session.destroy();
  res.send("logout success");
});

app.post("/getImagesAuth", auth, (req, res) => {
  // console.log(req.session, "session", req.sessionID);
  const user = activeSession[req.sessionID];
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
      writeLog(req.body.username, "loginAuth", "logged in");
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

app.post("/rename", auth, (req, res) => {
  const user = activeSession[req.sessionID];
  try {
    userLib.rename(
      "./" + req.body.path,
      req.body.oldName,
      req.body.newName,
      () => {
        res.send(true);
        writeLog(
          user,
          "rename",
          `${"./" + req.body.path}: ${req.body.oldName} changed to ${
            req.body.newName
          }`
        );
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete_file", auth, (req, res) => {
  const user = activeSession[req.sessionID];
  try {
    userLib.delete_file(req.body.file);
    writeLog(user, "delete_file", `${req.body.file} is deleted`);
    res.send("Success");
  } catch (err) {
    res.send(err);
    console.log(err);
  }
});

app.get("/getMyProfile", auth, (req, res) => {
  const user = activeSession[req.sessionID];
  try {
    userLib.getMyProfile(activeSession[req.sessionID], (profile) => {
      writeLog(user, "getMyProfile");
      res.send(profile);
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/updateProfile", auth, (req, res) => {
  const user = activeSession[req.sessionID];
  try {
    userLib.updateProfile(req.body);
    writeLog(user, "updateProfile", "Profile Updated");
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
    adminLib.getMyStatus(activeSession[req.sessionID], (allowedSpace) => {
      status = {
        used: adminLib.getUserDiskUsage(activeSession[req.sessionID]),
        allowed: allowedSpace,
        // allowed: adminLib.getUserAllowedSpace(activeSession[req.sessionID]),
        photosCount: adminLib.getPhotosCount(
          `./storage/${activeSession[req.sessionID]}`
        ),
      };
      res.send(status);
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/uploadImage", auth, (req, res) => {
  const user = activeSession[req.sessionID];
  try {
    base64Img.img(
      req.body.image,
      `./storage/${activeSession[req.sessionID]}/${req.body.dir}`,
      req.body.fname,
      function (err, filepath) {
        res.send("Sucess");
        writeLog(user, "uploadImage", `New image ${req.body.fname} Uploaded`);
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/newFolder", auth, (req, res) => {
  const user = activeSession[req.sessionID];
  try {
    userLib.newFolder(
      req.body.name,
      `storage/${user}/${req.body.path}`,
      (suc) => res.send("suc")
    );
  } catch (error) {
    console.log(error);
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
    adminLib.getAllUserData(res);
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
