import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const users = {};

const getUserById = (users, id) => users[id];

const getAllUsers = () => users;

const getUserOrders = async (id) => {
  const userObj = getUserById(users, id);
  if (!userObj === true) return false;
  const userOrders = [];
  await axios
    .get("http://localhost:3001/orders")
    .then(({ data }) => {
      for (const key in data) {
        if (data[key].userId == id) userOrders.push(data[key]);
      }
    })
    .catch((err) => {
      console.log(err);
    });
  return { user: userObj, orders: userOrders };
};

const addUser = (() => {
  let id = 1;
  return (userObj) => {
    if (!userObj.name === true) return false;
    users[id] = { userId: id++, ...userObj };
    return true;
  };
})();

app.get("/users", function (req, res) {
  res.status(200).json(getAllUsers());
  console.log(`GET ${req.path} --> (200)`);
  res.end();
});

app.get("/user/:userId(\\d+)", function (req, res) {
  const userRes = getUserById(users, req.params.userId);
  res.status(userRes ? 200 : 404).json(userRes || "404 Not Found!");
  console.log(`GET ${req.path} --> (${userRes ? 200 : 404})`);
  res.end();
});

app.post("/user", function (req, res) {
  if (addUser(req.body)) {
    res.status(201).send(`\n${JSON.stringify(req.body)}\n\n`);
    console.log(`POST ${req.path} --> User added (201)`);
  } else {
    res.status(400).send(`\n${JSON.stringify(req.body)}\n\n`);
    console.log(`POST ${req.path} --> Bad request (400)`);
  }
  res.end();
});

app.get("/user_orders/:userId(\\d+)", async function (req, res) {
  const userOrders = await getUserOrders(req.params.userId);
  res.status(userOrders ? 200 : 404).json(userOrders || "404 Not Found!");
  console.log(`GET ${req.path} --> (${userOrders ? 200 : 404})`);
  res.end();
});

app.get("/*", function (req, res) {
  res.status(404).send("404 Not Found!");
  console.log(`GET ${req.path} --> Non-existing path (404)`);
  res.end();
});

app.listen(3000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server started on port 3000 / Listening");
});
