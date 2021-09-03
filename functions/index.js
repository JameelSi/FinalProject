const functions = require("firebase-functions");
const twilio = require("twilio");
const admin = require("firebase-admin");
const {CloudTasksClient} = require("@google-cloud/tasks");

admin.initializeApp();
const db = admin.firestore();

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const twilioNumber = functions.config().twilio.number;
const client = new twilio.Twilio(accountSid, authToken);

const projectId = functions.config().project.id;

const sendFeedbackFor = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const region = "europe-west1";

/**
 * Add two numbers.
 * @param {object} docRef The document's reference in firestore.
 * @param {number} docId The document's id in firestore.
 * @return {void} .
 */
async function createHttpTask(docRef, docId) {
  const queue = "feedback-timer";
  const tasksClient = new CloudTasksClient();
  const queuePath = tasksClient.queuePath(projectId, region, queue);
  const url = `https://${region}-${projectId}.cloudfunctions.net/feedbackTimerCallback`;
  const payload = {docRef, docId};
  const doc = await docRef.get();
  const docData = doc.data();
  const task = {
    httpRequest: {
      httpMethod: "POST",
      url,
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
      headers: {
        "Content-Type": "application/json",
      },
    },
    scheduleTime: {
      seconds: docData.sendfeedbackRequestAt.seconds,
    },
  };

  await docRef.update({timerOn: true});
  await tasksClient.createTask({parent: queuePath, task});
}

exports.feedbackTimerCallback = functions.region(region).https.onRequest(
    async (req, res) => {
      const number = req.body.docId;

      const botRef = db.collection("Bot").doc("Responses");
      const botResponses = await botRef.get();
      let message;
      if (!botResponses.exists) {
        message = "סליחה קרתה שגיאה, נה לנסות שוב מאוחר יותר";
      } else {
        const botResponsesData = botResponses.data();
        message = botResponsesData["(בקשת משוב)"].replace(/\\n/g, "\n");
      }

      const textMessage = {
        body: message,
        to: number,
        from: twilioNumber,
      };

      try {
        await client.messages.create(textMessage);
        await db.collection("Bot").doc(number)
            .update({feedbackRequestSent: true, timerOn: false});
        res.send(200);
      } catch (error) {
        res.status(500).send(error);
      }
    });

// Sends sms via HTTP - twilio
exports.sendSms = functions.https.onCall(async (data, context) => {
  const botRef = db.collection("Bot").doc("Responses");
  const botResponses = await botRef.get();
  let response;
  if (!botResponses.exists) {
    response = "סליחה קרתה שגיאה, נה לנסות שוב מאוחר יותר";
  } else {
    const botResponsesData = botResponses.data();
    const obj = {
      name: data.name,
      feedbackRequestSent: false,
      // feedbackReceived: false,
      timerOn: false,
      date: new Date(),
    };
    await db.collection("Bot").doc(data.number).set(obj)
        .catch((err) => console.log(err));
    response = data.name + " " +
      botResponsesData["תפריט"].replace(/\\n/g, "\n");
  }
  const textMessage = {
    body: response,
    to: data.number,
    from: twilioNumber,
  };
  return client.messages.create(textMessage)
      .then((message) => console.log(message.sid, "success"));
});


exports.sendEmail = functions.https.onCall(async (data, context) => {
  const sgMail = require("@sendgrid/mail");
  const sendgridInfo = require("./sendgrid.env");
  sgMail.setApiKey(sendgridInfo.SENDGRID_API_KEY);
  const msg = {
    to: data.emails.pop(),
    bcc: data.emails,
    from: sendgridInfo.SENDGRID_EMAIL,
    subject: data.subject,
    text: data.text,
    html: "<p dir=\"rtl\">" + data.text + "</p>",
  };
  sgMail.send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
});

exports.reply = functions.region(region).https.onRequest(async (req, res) => {
  const MessagingResponse = twilio.twiml.MessagingResponse;
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

  const received = req.body.Body;
  // Prepare a response to the SMS message
  const response = new MessagingResponse();

  // check that user filled number through website
  const from = req.body.From;
  const userRef = db.collection("Bot").doc(from);
  const botRef = db.collection("Bot").doc("Responses");
  const [user, botResponses] = await Promise.all([userRef.get(), botRef.get()])
      .catch();

  const userData = user.data();
  if (!user.exists) {
    return;
  }

  if (!botResponses.exists) {
    response.message("סליחה קרתה שגיאה, נה לנסות שוב מאוחר יותר");
  } else {
    const botResponsesData = botResponses.data();
    let found = false;
    for (const property in botResponsesData) {
      if (received == property && property != "(אחרת)" &&
      property !="(תודה על משוב)" && property !=" (בקשת משוב)") {
        response.message(botResponsesData[property].replace(/\\n/g, "\n"));
        found = true;
        if (sendFeedbackFor.includes(received) &&
            !userData.feedbackRequestSent && !userData.timerOn) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          // const tomorrow = new Date(tomorrow.getTime() + 2 * 60000);
          await userRef.update({
            sendfeedbackRequestAt: tomorrow,
          });
          createHttpTask(userRef, from);
        }
        break;
      }
    }
    if (!found && !userData.feedbackRequestSent) {
      response.message(botResponsesData["(אחרת)"]);
    } else if (!found && userData.feedbackRequestSent ) {
      await Promise.all([userRef.update({
        feedbackRequestSent: false,
        timerOn: false,
      }),
      // add review to collection with async function
      db.collection("Reviews").add({
        content: received,
        date: new Date(),
        read: false,
        phone: from,
      }),
      ]).catch();
      response.message(botResponsesData["(תודה על משוב)"]);
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

    exports.removeAreaCoordAuth = functions.firestore
    .document("/Managers/{uid}")
    .onDelete((snapshot, context) => {
      return admin.auth().deleteUser(context.params.uid).catch();
    });

// exports.sendEventSms = functions.firestore
// .document("/Events/{uid}")
// .onCreate((snapshot, context) => {
//   const docNeighb = snapshot.data().neighborhood
//   if(!docNeighb)
//     return;
//   const volsRef = db.collection('Volunteers')
//   const VolsInNeighb = await volsRef
//    .where('neighborhood', '==', docNeighb).get();
//   // send sms or mail to all
// });
