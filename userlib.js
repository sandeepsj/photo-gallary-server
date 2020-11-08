var fs = require("fs");
var baseDir = "./storage";
function createNewUser(user) {
  var profilePath = `${baseDir}/${user.userid}/profile.json`;
  var userDir = `${baseDir}/${user.userid}`;
  if (fs.existsSync(userDir)) throw `User already exists - ${userDir}`;

  if (!user.userid) throw `userid is undefined - ${user.userid}`;
  fs.mkdir(userDir, (err) => {
    if (err) throw err;
    console.log(`Directory created successfully! - ${userDir}`);
  });
  fs.open(profilePath, "w", function (err, file) {
    if (err) throw err;
    console.log(`SuccessFully Created Profile File for - ${user.userid}`);
  });
  fs.writeFile(profilePath, JSON.stringify(user, null, 2), (err) => {
    if (err) throw err;
    console.log(`Data written to file - ${user.userid}`);
  });
}

function getImages(path, callBack) {
  if (!fs.existsSync(path)) throw `path doesnt exists - ${path}`;

  if (path === undefined) throw `path is undefined - ${path}`;

  fs.readdir(path, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    const images = files.filter((filename) => {
      //console.log(filename.slice(-5).localeCompare(".json"));

      if (filename.match(/.(jpg|jpeg|png|gif)$/i)) return true;
      return false;
    });
    const folders = files.filter((filename) => {
      //console.log(filename.slice(-5).localeCompare(".json"));

      if (filename.match(/.(jpg|jpeg|png|gif|json)$/i)) return false;
      return true;
    });
    //returning all files in path
    if (callBack) {
      callBack({ images: images, folders: folders });
      return;
    }
  });
}

// function getFile(path, res) {
//   //if (!fs.existsSync(path)) throw `path doesnt exists - ${path}`;

//   //if (path === undefined) throw `path is undefined - ${path}`;

//   var options = {};
//   var fileName = `${__dirname}\\storage\\sandeepsj\\${path}`;
//   console.log("Asdf", fileName);

//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       return "There is an error on res.send file";
//     } else {
//       console.log("Sent:", fileName);
//     }
//   });
// }

module.exports = {
  createNewUser: createNewUser,
  getImages: getImages,
  // getFile: getFile,
};
