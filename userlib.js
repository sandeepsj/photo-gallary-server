var fs = require("fs");
var baseDir = "./storage";
var logLib = require("./loglib");
var dblib = require("./userdblib");

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

  user["Allowed Space"] = 200;
  fs.writeFile(profilePath, JSON.stringify(user, null, 2), (err) => {
    if (err) throw err;
    console.log(`Data written to file - ${user.userid}`);
    logLib.createLogFile(user);
  });
  dblib.addNewUser(user);
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

function login(user, password, callBack) {
  // dblib.getPassword(user, (correctPassword) => {
  //   console.log(password, correctPassword, "asdf");
  //   if (correctPassword === password) {
  //     callBack();
  //   } else {
  //     throw `password is incorrect for user - ${user}`;
  //   }
  // });
  if (fs.existsSync(`${baseDir}/${user}`)) {
    let profile = JSON.parse(
      fs.readFileSync(`${baseDir}/${user}/profile.json`)
    );
    if (profile.password === password) {
      callBack();
    } else {
      throw `password is incorrect for user - ${user}`;
    }
  } else {
    throw `User does not exists - ${user}`;
  }
}

function rename(path, name, newName, callBack) {
  //if (!fs.existsSync(path)) throw `path doesnt exists - ${path}`;
  console.log(path + "/" + name, path + "/" + newName);
  fs.rename(path + "/" + name, path + "/" + newName + ".jpg", callBack);
}

function delete_file(file) {
  if (!fs.existsSync(file)) throw `file doesnt exists to delete- ${file}`;
  fs.unlink(file, (err) => {
    if (err) {
      console.error(err);
    } else console.log(`Successfully removed ${file}`);
  });
}

function getMyProfile(user, callBack) {
  if (!fs.existsSync(`${baseDir}/${user}`))
    throw `User doesnt exists - ${path}`;
  dblib.getMyProfile(user, callBack);
  // let profile = JSON.parse(fs.readFileSync(`${baseDir}/${user}/profile.json`));
  // callBack(profile);
}

function updateProfile(newProfile, callBack) {
  let user = newProfile.userid;
  if (!fs.existsSync(`${baseDir}/${user}`))
    throw `User doesnt exists - ${user}`;
  let profilePath = `${baseDir}/${user}/profile.json`;
  fs.writeFile(profilePath, JSON.stringify(newProfile, null, 2), (err) => {
    if (err) throw err;
    console.log(`Data updated to file - ${user}`);
  });
  dblib.updateProfile(user, newProfile, callBack);
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
  login: login,
  rename: rename,
  delete_file: delete_file,
  getMyProfile: getMyProfile,
  updateProfile: updateProfile,
};
