// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
const cors = require('cors')({origin: true});
// Put this line to your function
// Automatically allow cross-origin requests

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://kr-foodmenu.firebaseio.com",
});

listAllUsers = (nextPageToken) => {
    // List batch of users, 1000 at a time.
    return admin.auth().listUsers(1000, nextPageToken)
        .then(async listUsersResult => {
            await listUsersResult.users.forEach(async userRecord => {
                //console.log("user", userRecord.toJSON());
                // console.log(userRecord.toJSON().uid);
                await deleteAllUsers(userRecord.toJSON().uid);
            });
            if (listUsersResult.pageToken) {
                // List next batch of users.
                return listAllUsers(listUsersResult.pageToken)
            } return;
        })
        .catch(error => {
            console.log("Error listing users:", error);
        });
}

deleteAllUsers = async (uid) => {
    console.log('here');
    return await admin.auth().deleteUser(uid)
        .then(() => {
            console.log("Successfully deleted user");
            return;
        })
        .catch(error => {
            console.log("Error deleting user:", error);
        });
}
// Start listing users from the beginning, 1000 at a time.
exports.printUsers = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        await listAllUsers();
        res.send('ok');
    });
});