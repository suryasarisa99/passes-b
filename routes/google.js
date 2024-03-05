const router = require("express").Router();
const { Pass, Ecap } = require("../model/password");
const { authenticateToken } = require("./auth");

router.post("/temp", async (req, res) => {
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
    res.json({ err: "new pass created" });
  }
});

router.get("/", async (req, res) => {
  if (req.user) {
    let data = await Pass.find();
    return res.json(data);
  }
  res.json({ mssg: "Unauthorized Access" });
});

router.post("/", async (req, res) => {
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
module.exports = router;
