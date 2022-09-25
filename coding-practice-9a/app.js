const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");
let db = null;

const initializeDBserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`DB server is UP and RUNNING`);
    });
  } catch (error) {
    console.log(`DBserver {error.message}`);
    process.exit(1);
  }
};

initializeDBserver();

// ### API 1

// #### Path: `/register`

// #### Method: `POST`
// username": "adam_richard",
//   "name": "Adam Richard",
//   "password": "richard_567",
//   "gender": "male",
//   "location"

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  console.log(username);
  const hashPassword = await bcrypt.hash(password, 10);
  const selectQuery = `SELECT * FROM user WHERE username = '${username}'`;

  const isFound = await db.get(selectQuery);
  console.log(isFound);
  if (isFound === undefined && password.length >= 5) {
    const dbQuery = `
        INSERT INTO user (username, name, password, gender,location )
        VALUES ('${username}', '${name}', '${hashPassword}', '${gender}','${location}' )
        `;

    await db.run(dbQuery);
    response.status(200);
    response.send("User created successfully");
  } else if (isFound === undefined && password.length < 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// ### API 2

// #### Path: `/login`

// #### Method: `POST`

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  console.log(username);
  const selectQuery = `SELECT * FROM user WHERE username = '${username}'`;
  console.log(selectQuery);
  const isFound = await db.get(selectQuery);

  if (isFound !== undefined) {
    const comparePassword = await bcrypt.compare(password, isFound.password);
    if (comparePassword === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});

// ### API 3

// #### Path: `/change-password`

// #### Method: `PUT`
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  console.log(username);
  const hashNewPassword = await bcrypt.hash(newPassword, 10);
  const selectQuery = `SELECT * FROM user WHERE username = '${username}'`;
  console.log(selectQuery);
  const isFound = await db.get(selectQuery);

  if (isFound !== undefined) {
    //
    const comparePassword = await bcrypt.compare(oldPassword, isFound.password);
    //
    if (comparePassword === true && newPassword.length < 5) {
      //
      response.status(400);
      response.send("Password is too short");
      //
    } else if (comparePassword === true && newPassword.length >= 5) {
      //
      const dbQuery = `
      UPDATE user
      SET 
      password = '${hashNewPassword}'
      WHERE 
      username = '${username}'
      `;
      const array = await db.run(dbQuery);
      response.status(200);
      response.send("Password updated");
      //
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});

module.exports = app;
