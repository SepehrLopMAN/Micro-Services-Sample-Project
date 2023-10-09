import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const orders = {};

const getOrderByID = (orders, id) => orders[id];

const getAllOrders = () => orders;
const placeOrder = (() => {
  let id = 1;
  return async (orderObj) => {
    if (!orderObj.items === true || !orderObj.userId === true) return false;
    let user;
    await axios
      .get(`http://localhost:3000/user/${orderObj.userId}`)
      .then(({ data, status }) => {
        user = status === 200 ? data : undefined;
      })
      .catch((err) => {});
    if (user === undefined) return "User doesn't exist!";

    orders[id] = { orderId: id++, items: orderObj.items, ...user };
    return true;
  };
})();

app.get("/orders", function (req, res) {
  res.status(200).json(getAllOrders());
  console.log(`GET ${req.path} --> (200)`);
  res.end();
});

app.get("/order/:orderId(\\d+)", function (req, res) {
  const orderRes = getOrderByID(orders, req.params.orderId);
  res.status(orderRes ? 200 : 404).json(orderRes || "404 Not Found!");
  console.log(`GET ${req.path} --> (${orderRes ? 200 : 404})`);
  res.end();
});

app.post("/order", async function (req, res) {
  const placeOrderRes = await placeOrder(req.body);
  if (placeOrderRes === true) {
    res.status(201).send(`\n${JSON.stringify(req.body)}\n\n`);
    console.log(`POST ${req.path} --> Order added (201)`);
  } else {
    res.status(400).send(`\n${JSON.stringify(req.body)}\n\n`);
    console.log(
      `POST ${req.path} --> ${
        placeOrderRes === false ? "Bad request" : placeOrderRes
      } (400)`
    );
  }
  res.end();
});

app.get("/*", function (req, res) {
  res.status(404).json("404 Not Found!");
  console.log(`GET ${req.path} --> Non-existing path (404)`);
  res.end();
});

app.listen(3001, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server listening to port 3001 / Listening");
});
