var fs = require("fs");
var baseDir = "./storage";

isDir = function (path) {
  console.log(path);

  if (!fs.existsSync(path)) throw `path doesnt exists - ${path}`;
  if (path === undefined) throw `path is undefined - ${path}`;
};

createLogFile = function (user) {
  const logPath = `${baseDir}/${user.userid}/log.json`;
  const userDir = `${baseDir}/${user.userid}`;
  isDir(userDir);
  fs.open(logPath, "w", function (err, file) {
    if (err) throw err;
    console.log(`SuccessFully Created logfile for - ${user.userid}`);
  });
  fs.writeFile(logPath, JSON.stringify({}, null, 2), (err) => {
    if (err) throw err;
    console.log(`log is written to file - ${user}`);
  });
};

addlog = function (user, head, message) {
  const logPath = `${baseDir}/${user}/log.json`;
  isDir(logPath);
  var userLog = JSON.parse(fs.readFileSync(logPath));
  if (userLog[head] === undefined) userLog[head] = [];
  userLog[head].push({ message: message, timeStamp: Date.now() });
  fs.writeFile(logPath, JSON.stringify(userLog, null, 2), (err) => {
    if (err) throw err;
    console.log(`log is written to file - ${user}`);
  });
};

module.exports = {
  createLogFile: createLogFile,
  addlog: addlog,
};
