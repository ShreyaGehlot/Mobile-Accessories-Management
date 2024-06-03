const mongoose = require("mongoose");
async function connect() {
  await mongoose.connect(
    "mongourl"
  );
}
connect();
const mobileSchema = new mongoose.Schema({
  mtype: String,
  mname: { type: String },
  mnumber: { type: String, unique: true },
  price: Number,
  launchdate: Date,
});
const Mob = mongoose.model("mobile", mobileSchema);
const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Brother" });
});

router.get("/add", function (req, res, next) {
  res.render("add", { action: null });
});

router.get("/emi", function (req, res, next) {
  res.render("emi", { err: null, data: {} });
});

router.post("/emi", async function (req, res, next) {
  console.log(req.body);
  let formatter;
  if (req.body.ctype == "Rupee") {
    formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    });
  } else {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
  }
  // formatter.format(2500)
  const response = await fetch(
    `http://${process.env.BASE_URL}/EMICalculator?` +
      //"http://localhost:5296/EMICalculator?" +
      new URLSearchParams({
        loanAmount: req.body.amount,
        interest: req.body.interest,
        tenure: req.body.tenure,
      })
  );
  const data = await response.json();
  console.log(data);
  if (data.success == "true") {
    console.log(data);
    data.loanAmountf = formatter.format(data.loanAmount);
    data.body.loanEmi = formatter.format(data.body.loanEmi);
    data.body.totalInterestPayable = formatter.format(
      data.body.totalInterestPayable
    );
    data.body.totalPayment = formatter.format(data.body.totalPayment);
    res.render("emi", {
      data: data,
    });
  } else {
    res.render("emi", {
      data: {},
      err: data.message,
    });
  }
});

router.get("/updateList", async function (req, res, next) {
  let perPage = 5;
  let page = req.query.page || 1;
  Mob.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, products) {
      Mob.count().exec(function (err, count) {
        console.log(count);
        if (err) return next(err);
        res.render("updateList", {
          data: products,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

router.get("/update", async function (req, res, next) {
  let id = req.query.id;
  let data = await Mob.findById(id);
  res.render("update", { data, something: null });
});

router.post("/update", async function (req, res, next) {
  try {
    await Mob.findByIdAndUpdate(req.body.id, {
      mtype: req.body.mtype,
      mname: req.body.mname,
      mnumber: req.body.mnumber,
      price: req.body.price,
      launchdate: req.body.launchdate,
    });
    res.redirect("/updateList");
  } catch (err) {
    let data = await Mob.findById(req.body.id);
    res.render("update", {
      something: req.body.mnumber,
      data,
    });
  }
});

router.get("/delete", async function (req, res, next) {
  console.log(req.body);
  await Mob.findByIdAndRemove(req.query.id);
  res.redirect("/deleteList");
});

router.get("/deleteList", async function (req, res, next) {
  let perPage = 5;
  let page = req.query.page || 1;
  Mob.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, products) {
      Mob.count().exec(function (err, count) {
        console.log(count);
        if (err) return next(err);
        res.render("deleteList", {
          data: products,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

router.post("/create", async (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Please fill all required field",
    });
  }

  const mobile = new Mob({
    // Create a new Accessories
    mtype: req.body.mtype,
    mname: req.body.mname,
    mnumber: req.body.mnumber,
    price: req.body.price,
    launchdate: req.body.launchdate,
  });

  mobile
    .save() // Save Accessories in the database
    .then((data) => {
      res.render("add", { action: "Added" });
    })
    .catch((err) => {
      res.render("add", { action: "Invalid" });
    });
});

router.delete("/delete/:id", async (req, res) => {
  MOB.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "Accessories not found with id " + req.params.id,
        });
      }
      res.send({ message: "Accessories deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Accessories not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete Accessories with id " + req.params.id,
      });
    });
});
// Validate request

router.get("/list", function (req, res, next) {
  let perPage = 5;
  let page = req.query.page || 1;
  Mob.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, products) {
      Mob.count().exec(function (err, count) {
        console.log(count);
        if (err) return next(err);
        res.render("list", {
          data: products,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

module.exports = router;
