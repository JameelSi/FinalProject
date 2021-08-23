const functions = require("firebase-functions");
// const firebase = require("firebase/app");
const twilio = require("twilio");

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const twilioNumber = functions.config().twilio.number;
const client = new twilio.Twilio(accountSid, authToken);
// Sends sms via HTTP - twilio
exports.sendSms = functions.https.onCall(async (data, context) => {
  const textMessage = {
    body: data.msg,
    to: data.number,
    from: twilioNumber,
  };
  return client.messages.create(textMessage)
      .then((message) => console.log(message.sid, "success"))
      .catch((err) => console.log(err));
});


