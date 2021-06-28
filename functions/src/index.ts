
import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.deleteAdmin = functions.firestore.document('Admin/{messageId}').onDelete((snap, context) => {
    // return admin.auth().getUser(snap.id).then(function(userRecord: any) {
        return admin.auth().deleteUser(snap.id).then(function() {
            console.log('Successfully deleted user');
          })
          .catch(function(error: any) {
            console.log('Error deleting user:', error);
          });
    // }).catch(function(error: any) {
    //     console.log('Error fetching user data:', error);
    // });
});