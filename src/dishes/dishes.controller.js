const dishes = require("../data/dishes-data");
const nextId = require("../utils/nextId");

function list(req, res, next) {
  res.json({ data: dishes });
}

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (!name) {
    return next({ status: 400, message: "Dish must include a name" });
  }

  if (!description) {
    return next({ status: 400, message: "Dish must include a description" });
  }

  if (!price) {
    return next({ status: 400, message: "Dish must include a price" });
  } else if (price <= 0) {
    return next({
      status: 400,
      message: "Dish price must be greater than zero",
    });
  }

  if (!image_url) {
    return next({ status: 400, message: "Dish must include an image_url" });
  }

  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  res.locals.newDish = newDish;

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.json({ data: foundDish });
  } else {
    next({ status: 404, message: `Dish does not exist: ${dishId}` });
  }
}

function update(req, res, next) {
  const { dishId } = req.params;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (!foundDish) {
    return next({ status: 404, message: `Dish does not exist: ${dishId}` });
  }

  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }

  if (!name) {
    return next({ status: 400, message: "Dish must include a name" });
  }

  if (!description) {
    return next({ status: 400, message: "Dish must include a description" });
  }

  if (typeof price === "string") {
    return next({ status: 400, message: "Dish price must be a valid number" });
  }

  if (isNaN(Number(price)) || Number(price) <= 0) {
    return next({
      status: 400,
      message: "Dish price must be a valid number greater than zero",
    });
  }

  if (!image_url) {
    return next({ status: 400, message: "Dish must include an image_url" });
  }

  res.locals.updatedDish = {
    ...foundDish,
    name: name || foundDish.name,
    description: description || foundDish.description,
    price: price || foundDish.price,
    image_url: image_url || foundDish.image_url,
  };

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = Number(price);
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

module.exports = {
  list,
  create,
  read,
  update,
};
