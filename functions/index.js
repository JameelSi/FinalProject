const functions = require("firebase-functions");
const twilio = require("twilio");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const twilioNumber = functions.config().twilio.number;
const client = new twilio.Twilio(accountSid, authToken);


// Sends sms via HTTP - twilio
exports.sendSms = functions.https.onCall(async (data, context) => {
  const textMessage = {
    body: " שלום" + data.name +
     ",אני בוטבוט, התשאטבוט של הגיל השלישי זה אנחנו! 😄\n" +
            "שמעתי שאתם צריכים מידע על המענים הקיימים, \n" +
            "ורציתי לעזור לכם ולתת לכם את כל המידע שאתם צריכים🥳 \n" +
            "‼️ תכתבו לי את מספר המענה שאתם רוצים מהרשימה: \n" +
            "1. דמנציה \n" +
            "2. חבר טלפוני \n" +
            "3. לחצן מצוקה \n" +
            "4. מיצוי זכויות \n" +
            "5. עזרה בנושאים טבנולוגיים \n" +
            "6. עזרה בקניות \n" +
            "7. פעילות חברתית \n" +
            "8. שינוע תרופות \n" +
            "9. תמיכה נפשית",
    to: data.number,
    from: twilioNumber,
  };
  return client.messages.create(textMessage)
      .then((message) => console.log(message.sid, "success"))
      .catch((err) => console.log(err));
});


exports.sendEmail = functions.https.onCall(async (data, context) => {
  const sgMail = require("@sendgrid/mail");
  const sendgridInfo = require("./sendgrid.env");
  sgMail.setApiKey(sendgridInfo.SENDGRID_API_KEY);
  const msg = {
    to: data.emails,
    from: sendgridInfo.SENDGRID_EMAIL,
    subject: data.subject,
    text: data.text,
    html: "<strong>" + data.text + "</strong>",
  };
  sgMail.send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
});


exports.reply = functions.https.onRequest(async (req, res) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
  const projectId = functions.config().project.id;
  const region = "us-central1";
  let isValid = true;
  // Only validate that requests came from Twilio when the function has been
  // deployed to production.
  if (process.env.NODE_ENV === "production") {
    isValid = twilio.validateExpressRequest(req, authToken, {
      url: `https://${region}-${projectId}.cloudfunctions.net/reply`,
    });
  }

  // Halt early if the request was not sent from Twilio
  if (!isValid) {
    res
        .type("text/plain")
        .status(403)
        .send("Twilio Request Validation Failed.")
        .end();
    return;
  }

  // Prepare a response to the SMS message
  const response = new MessagingResponse();

  const botRef = db.collection("Bot").doc("Responses");
  const botResponses = await botRef.get();
  if (!botResponses.exists) {
    response.message("סליחה קרתה שגיאה, נה לנסות שוב מאוחר יותר");
  } else {
    let found = false;
    const botResponsesData = botResponses.data();
    for (const property in botResponsesData) {
      if (req.body.Body == property) {
        response.message(botResponsesData[property].replace(/\\n/g, "\n"));
        found = true;
        break;
      }
    }
    if (!found) {
      response.message("אני לא מבין😔 "+
      "האם אתם רוצים לראות את התפריט שוב?🤔 אם כן תכתבו ״תפריט״");
    }
  }

  // Send the response
  res
      .status(200)
      .type("text/xml")
      .end(response.toString());
});


exports.removeVolAuth = functions.firestore.document("/Volunteers/{uid}")
    .onDelete((snapshot, context) => {
      return admin.auth().deleteUser(context.params.uid);
    });

exports.removeAreaCoordAuth = functions.firestore
    .document("/AreaCoordinators/{uid}")
    .onDelete((snapshot, context) => {
      return admin.auth().deleteUser(context.params.uid);
    });
