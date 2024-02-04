const router = require("express").Router();
const { Pass, Ecap } = require("../model/password");

router.get("/", async (req, res) => {
  data = await Ecap.find();
  res.json(data);
});
router.post("/", async (req, res) => {
  let { user, passwd, type } = req.body;
  console.log(req.body);
  let prvPass = await Ecap.findById(user);

  try {
    if (prvPass) {
      if (prvPass.password == passwd)
        return res.json({ mssg: "Already There" });
      let backupPrvPass = prvPass.password;
      prvPass.password = passwd;

      if (prvPass.oldPasswords.includes(passwd)) {
        //  Remove the old password from the list, to add it to the top
        prvPass.oldPasswords.splice(prvPass.oldPasswords.indexOf(passwd), 1);
      }
      //  Add the old password to the top of the list
      prvPass.oldPasswords.unshift(backupPrvPass);
      await prvPass.save();
      return res.json({ mssg: "updated pass" });
    } else {
      // Create a new password
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

module.exports = router;
