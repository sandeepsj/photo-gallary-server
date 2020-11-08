var userLib = require("./userlib");
var bodyParser = require("body-parser");

// user = {name:"SAndeep S J",userid:"sandeepsj",passord:"sandeep", email:"sandeepsj@gmail.com"}
// try {
//   userLib.getImages("storage/sandeepsj");
// } catch (error) {
//   console.log(error);
// }

const express = require("express");
const cors = require("cors");
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

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.post("/signup", (req, res) => {
  try {
    userLib.createNewUser(req.body);
  } catch (error) {
    console.log(error);
  }
});

app.post("/getImagesAuth", (req, res) => {
  try {
    userLib.getImages("storage/sandeepsj/", (files) => res.send(files));
  } catch (error) {
    console.log(error);
  }
});

// app.get("/getFileAuth", (req, res) => {
//   console.log(req.query);
//   userLib.getFile(req.query["dir"], res);
// });
const port = process.env.PORT || 3005;
app.listen(port, () => console.log(`listening to port ${port}`));
