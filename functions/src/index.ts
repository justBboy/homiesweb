import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import routes from "./routes";
import { appGlobalId } from "./constants/utils";

admin.initializeApp();

const app = express();

//middleware
app.use(cors());
app.use(express.json());

// routes
routes(app);

exports.app = functions.https.onRequest(app);

exports.adminCreated = functions.firestore
  .document("/admins/{adminId}")
  .onCreate(async (snap, context) => {
    //const customer = snap.data()
    await admin
      .firestore()
      .collection("appGlobals")
      .doc(appGlobalId)
      .set(
        {
          adminsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          adminsCount: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
    return false;
  });

exports.onAdminDeleted = functions.firestore
  .document("/admins/{adminId}")
  .onDelete(async (snap, context) => {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc(appGlobalId)
      .set(
        {
          adminsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          adminsCount: admin.firestore.FieldValue.increment(-1),
        },
        { merge: true }
      );
    return true;
  });

exports.customerCreated = functions.firestore
  .document("/users/{userId}")
  .onCreate(async (snap, context) => {
    //const customer = snap.data()
    await admin
      .firestore()
      .collection("appGlobals")
      .doc(appGlobalId)
      .set(
        {
          customersLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          customersCount: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
    return false;
  });

exports.onCustomerDeleted = functions.firestore
  .document("/users/{userId}")
  .onDelete(async (snap, context) => {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc(appGlobalId)
      .set(
        {
          customersLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          customersCount: admin.firestore.FieldValue.increment(-1),
        },
        { merge: true }
      );
    return true;
  });
