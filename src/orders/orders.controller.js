const orders = require("../data/orders-data");
const nextId = require("../utils/nextId");

function list(req, res, next) {
  res.json({ data: orders });
}

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  if (!deliverTo) {
    return next({ status: 400, message: "Order must include a deliverTo field" });
  }

  if (!mobileNumber) {
    return next({ status: 400, message: "Order must include a mobileNumber field" });
  }

  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return next({ status: 400, message: "Order must include at least one dish" });
  }

  for (const [index, dish] of dishes.entries()) {
    if (!dish.quantity || !Number.isInteger(dish.quantity)) {
      return next({ status: 400, message: `Dish at index ${index} must have a valid integer quantity` });
    }
  }

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}


function read(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.json({ data: foundOrder });
  } else {
    next({ status: 404, message: `Order does not exist: ${orderId}` });
  }
}

function update(req, res, next) {
  const { orderId } = req.params;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  const foundOrder = orders.find((order) => order.id === orderId);

  if (!foundOrder) {
    return next({ status: 404, message: `Order does not exist: ${orderId}` });
  }

  if (id && id !== orderId) {
    return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}` });
  }

  if (!deliverTo) {
    return next({ status: 400, message: "Order must include a deliverTo field" });
  }

  if (!mobileNumber) {
    return next({ status: 400, message: "Order must include a mobileNumber field" });
  }

  if (!status || !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)) {
    return next({ status: 400, message: "Order must include a valid status (pending, preparing, out-for-delivery, delivered)" });
  }

  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return next({ status: 400, message: "Order must include at least one dish" });
  }

  for (const [index, dish] of dishes.entries()) {
    if (!dish.quantity || !Number.isInteger(dish.quantity)) {
      return next({ status: 400, message: `Dish at index ${index} must have a valid integer quantity` });
    }
  }

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;

  res.json({ data: foundOrder });
}


function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);

  if (index > -1) {
    if (orders[index].status !== "pending") {
      return next({ status: 400, message: "An order cannot be deleted unless it is pending." });
    }
    orders.splice(index, 1);
    res.sendStatus(204);
  } else {
    next({ status: 404, message: `Order does not exist: ${orderId}` });
  }
}

module.exports = {
  list,
  create,
  read,
  update,
  delete: destroy,
};
