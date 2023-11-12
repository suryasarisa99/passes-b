const { model, Schema } = require("mongoose");

const passwordSchema = new Schema({
  _id: String,
  password: String,
  oldPasswords: [String],
  type: String,
  twoStepAuth: {
    type: Boolean,
    default: false,
  },
  temp: {
    type: String,
  },
});
const EcapPasSchema = new Schema({
  _id: String,
  password: String,
  oldPasswords: [String],
  type: String,
});

module.exports = {
  Pass: model("pass", passwordSchema),
  Ecap: model("Ecap", EcapPasSchema),
};
