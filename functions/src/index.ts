import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import routes from "./routes";
import { appGlobalId, onOrderAdded, onUpdateOrder } from "./constants/utils";
import { orderType } from "./constants/types";

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
      .doc("admins")
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
      .doc("admins")
      .set(
        {
          adminsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          adminsCount: admin.firestore.FieldValue.increment(-1),
        },
        { merge: true }
      );
    return true;
  });

exports.onAdminUpdated = functions.firestore
  .document("/admins/{adminId}")
  .onUpdate(async (snap, context) => {
    await admin.firestore().collection("appGlobals").doc("admins").set(
      {
        adminsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
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
      .doc("customers")
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
      .doc("customers")
      .set(
        {
          customersLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          customersCount: admin.firestore.FieldValue.increment(-1),
        },
        { merge: true }
      );
    return true;
  });

exports.onCustomerUpdated = functions.firestore
  .document("/users/{userId}")
  .onUpdate(async (snap, context) => {
    await admin.firestore().collection("appGlobals").doc("customers").set(
      {
        customersLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  });

exports.onFoodCreated = functions.firestore
  .document("/foods/{foodId}")
  .onCreate(async (snap, context) => {
    const food = snap.data();
    try {
      await admin
        .firestore()
        .collection("appGlobals")
        .doc("foods")
        .set({
          foodsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          foodsCount: admin.firestore.FieldValue.increment(1),
        });
      const matches = await admin
        .firestore()
        .collection("foodCategories")
        .where("id", "==", food.category.id)
        .get();
      for (const foodCategory of matches.docs)
        await admin
          .firestore()
          .collection("foodCategories")
          .doc(foodCategory.id)
          .update({
            numFoods: admin.firestore.FieldValue.increment(1),
          });
    } catch (err) {
      console.log(err);
    }
  });

exports.onFoodDeleted = functions.firestore
  .document("foods/{foodId}")
  .onDelete(async (snap, context) => {
    try {
      const food = snap.data();
      await admin
        .firestore()
        .collection("appGlobals")
        .doc("foods")
        .set({
          foodsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          foodsCount: admin.firestore.FieldValue.increment(-1),
        });
      const matches = await admin
        .firestore()
        .collection("foodCategories")
        .where("id", "==", food.category.id)
        .get();
      for (const foodCategory of matches.docs)
        await admin
          .firestore()
          .collection("foodCategories")
          .doc(foodCategory.id)
          .update({
            numFoods: admin.firestore.FieldValue.increment(-1),
          });
    } catch (err) {
      console.log(err);
    }
  });

exports.onFoodUpdated = functions.firestore
  .document("foods/{foodId}")
  .onUpdate(async (snap, context) => {
    const before = snap.before.data();
    const after = snap.after.data();
    try {
      if (before.category !== after.category) {
        // decrement before category number of foods
        const bmatches = await admin
          .firestore()
          .collection("foodCategories")
          .where("id", "==", before.category.id)
          .get();
        for (const foodCategory of bmatches.docs)
          admin
            .firestore()
            .collection("foodCategories")
            .doc(foodCategory.id)
            .update({
              numFoods: admin.firestore.FieldValue.increment(-1),
            });

        // increment after category number of foods
        const amatches = await admin
          .firestore()
          .collection("foodCategories")
          .where("id", "==", after.category.id)
          .get();
        for (const foodCategory of amatches.docs)
          admin
            .firestore()
            .collection("foodCategories")
            .doc(foodCategory.id)
            .update({
              numFoods: admin.firestore.FieldValue.increment(1),
            });
      }
      await admin.firestore().collection("appGlobals").doc("foods").set({
        foodsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    }
  });

exports.onFoodCategoryCreated = functions.firestore
  .document("/foodCategories/{categoryId}")
  .onCreate(async (snap, context) => {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("foods")
      .set({
        foodCategoriesLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
        foodCategoriesCount: admin.firestore.FieldValue.increment(1),
      });
  });

exports.onFoodCategoryDeleted = functions.firestore
  .document("foods/{categoryId}")
  .onDelete(async (snap, context) => {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("foods")
      .set({
        foodCategoriesLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
        foodCategoriesCount: admin.firestore.FieldValue.increment(-1),
      });
  });

exports.onFoodCategoryUpdated = functions.firestore
  .document("foods/{categoryId}")
  .onUpdate(async (snap, context) => {
    await admin.firestore().collection("appGlobals").doc("foods").set({
      foodCategoriesLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

// incrementing orders and sales in months and dates
// on created and updated

exports.onOrderCreated = functions.firestore
  .document("order/{orderId}")
  .onCreate(async (snap, context) => {
    onOrderAdded(snap.data() as orderType);
  });

exports.onOrderUpdated = functions.firestore
  .document("order/{orderId}")
  .onUpdate(async (snap, context) => {
    await onUpdateOrder(snap);
  });
