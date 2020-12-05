const { profile } = require("console");
var fs = require("fs");
var baseDir = "./storage";

getAllUserData = function () {
  files = fs.readdirSync(baseDir);
  const userData = {};
  files.forEach(function (file) {
    fileDir = baseDir + "/" + file;
    //console.log(fileDir);
    if (fs.statSync(fileDir).isDirectory()) {
      var profileDir = fileDir + "/profile.json";
      var profile = JSON.parse(fs.readFileSync(profileDir));
      userData[profile.userid] = { ...profile };
    }
  });
  return userData;
};
getUsersCount = function () {
  files = fs.readdirSync(baseDir);
  count = 0;
  files.forEach(function (file) {
    count += 1;
  });
  return count;
};

getTotalDiskusage = function () {
  return getSizeofDirectory(baseDir);
};

getUserDiskUsage = function (user) {
  const userDir = baseDir + "/" + user;
  return getSizeofDirectory(userDir);
};

getPhotosCount = function (dirPath) {
  if (dirPath === undefined) dirPath = baseDir;
  files = fs.readdirSync(dirPath);
  count = 0;
  files.forEach(function (file) {
    fileDir = dirPath + "/" + file;
    //console.log(fileDir);
    if (fs.statSync(fileDir).isDirectory()) count += getPhotosCount(fileDir);
    else count += 1;
  });

  return count;
};

getSizeofDirectory = function (dirPath) {
  files = fs.readdirSync(dirPath);
  size = 0;
  files.forEach(function (file) {
    fileDir = dirPath + "/" + file;
    //console.log(fileDir);
    if (fs.statSync(fileDir).isDirectory()) size += getSizeofDirectory(fileDir);
    else size += fs.statSync(fileDir).size;
  });

  return size;
};

updateAllowedSpace = function (user, newValue) {
  profileDir = `${baseDir}/${user}/profile.json`;
  newProfile = JSON.parse(fs.readFileSync(profileDir));
  newProfile["Allowed Space"] = newValue;
  fs.writeFile(profileDir, JSON.stringify(newProfile, null, 2), (err) => {
    if (err) throw err;
    console.log(`Allowed Space updated to file - ${user}`);
  });
};
getUserAllowedSpace = function (user) {
  profileDir = `${baseDir}/${user}/profile.json`;
  newprofile = JSON.parse(fs.readFileSync(profileDir));
  return newprofile["Allowed Space"];
};

module.exports = {
  getSizeofDirectory: getSizeofDirectory,
  getPhotosCount: getPhotosCount,
  getAllUserData: getAllUserData,
  updateAllowedSpace: updateAllowedSpace,
  getTotalDiskusage: getTotalDiskusage,
  getUsersCount: getUsersCount,
  getUserDiskUsage: getUserDiskUsage,
  getUserAllowedSpace: getUserAllowedSpace,
};
