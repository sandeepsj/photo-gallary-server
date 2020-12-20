const { json } = require("express");
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "wtauserdb",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to Database!");
});
executeQuery = function (sql, callback, extras, title) {
  con.query(sql, function (err, res) {
    if (err) throw err;
    const Result = {};
    res.map((row) => {
      Result[row.userid] = {};
      Object.keys(row).map((key) => {
        Result[row.userid][key] = row[key];
      });
      if (extras[row.userid] !== undefined)
        Result[row.userid][title] = extras[row.userid];
    });
    callback(Result);
    //console.log("Result:" + JSON.stringify(Result));
  });
};

getAllUserData = function (callback, usedSpace, title) {
  const sql = "select * from users";
  executeQuery(sql, callback, usedSpace, title);
};

addNewUser = function (user) {
  user["Allowed Space"] = 200;
  const sql = `insert into users values("${user.userid}","${user.name}","${user.email}","${user.password}",${user["Allowed Space"]})`;
  con.query(sql, function (err, res) {
    if (err) throw err;
    console.log(res + "Successfully added new user to database");
  });
  //console.log(sql);
};

updateAllowedSpace = function (user, newValue) {
  const sql = `update users set \`Allowed Space\` = ${newValue} where \`userid\`="${user}"`;
  con.query(sql);
  console.log(sql);
};

getUserAllowedSpace = function (callBack, user) {
  const sql = `select \`Allowed Space\` from users where \`userid\`="${user}"`;
  con.query(sql, (err, res) => {
    if (err) throw err;
    callBack(res[0]["Allowed Space"]);
  });
};
updateProfile = function (user, newProfile, callBack) {
  const sql = `update users set name='${newProfile.name}', userid='${newProfile.userid}', password='${newProfile.password}', email='${newProfile.email}' where userid='${user}'`;
  con.query(sql, (err, res) => {
    if (err) throw err;
  });
};

getPassword = function (user, callBack) {
  const sql = `select password from users where userid = '${user}'`;
  con.query(sql, (err, res) => {
    if (res[0] === undefined) throw "no such user";
    callBack(res[0]["password"]);
  });
};
getMyProfile = function (user, callBack) {
  const sql = `select * from users where userid= '${user}'`;
  con.query(sql, (err, res) => {
    callBack(res[0]);
  });
};
module.exports = {
  getAllUserData: getAllUserData,
  addNewUser: addNewUser,
  updateAllowedSpace: updateAllowedSpace,
  getUserAllowedSpace: getUserAllowedSpace,
  updateProfile: updateProfile,
  getPassword: getPassword,
  getMyProfile: getMyProfile,
};
