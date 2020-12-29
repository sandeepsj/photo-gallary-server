const { profile } = require("console");
var fs = require("fs");
var baseDir = "./storage";
var dblib = require("./userdblib");

getAllUserData = function (res) {
  files = fs.readdirSync(baseDir);
  const userData = {};
  usedSpaceDict = {};
  files.forEach(function (file) {
    fileDir = baseDir + "/" + file;
    //console.log(fileDir);

    if (fs.statSync(fileDir).isDirectory()) {
      var profileDir = fileDir + "/profile.json";
      var profile = JSON.parse(fs.readFileSync(profileDir));
      profile["Used Space"] = parseInt(
        getUserDiskUsage(profile.userid) / (1024 * 1024)
      );
      usedSpaceDict[profile.userid] = profile["Used Space"];
      userData[profile.userid] = { ...profile };
    }
  });
  dblib.getAllUserData((data) => res.send(data), usedSpaceDict, "Used Space");
  //console.log(JSON.stringify(userData));
  //return userData;
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
    if (file.match(/.(json)$/i)) count -= 1;
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
  dblib.updateAllowedSpace(user, newValue);
  profileDir = `${baseDir}/${user}/profile.json`;
  newProfile = JSON.parse(fs.readFileSync(profileDir));
  newProfile["Allowed Space"] = newValue;
  fs.writeFile(profileDir, JSON.stringify(newProfile, null, 2), (err) => {
    if (err) throw err;
    console.log(`Allowed Space updated to file - ${user}`);
  });
};
getUserAllowedSpace = function (user, callBack) {
  dblib.getUserAllowedSpace(callBack, user);
  profileDir = `${baseDir}/${user}/profile.json`;
  newprofile = JSON.parse(fs.readFileSync(profileDir));
  return newprofile["Allowed Space"];
};

getMyStatus = function (user, callBack) {
  getUserAllowedSpace(user, callBack);
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
  getMyStatus: getMyStatus,
};
