import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import routes from "./routes";
import {
  customSendPushNotification,
  onOrderAdded,
  onUpdateOrder,
} from "./constants/utils";
import { notificationTypes, orderType } from "./constants/types";
import {
  ordersIndex,
  foodsIndex,
  customersIndex,
  agentsIndex,
} from "./config/algolia";
import * as dotenv from "dotenv";

admin.initializeApp();

const app = express();

dotenv.config();

//middleware
app.use(cors());
app.use(express.json());

// routes
routes(app);

exports.app = functions.https.onRequest(app);

exports.adminCreated = functions.firestore
  .document("admins/{adminId}")
  .onCreate(async (snap, context) => {
    const admin = snap.data();
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
  .document("admins/{adminId}")
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
  .document("admins/{adminId}")
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
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const customer = snap.data();
    await customersIndex.saveObject({
      objectID: customer.uid,
      username: customer.username,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
    });
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
  .document("users/{userId}")
  .onDelete(async (snap, context) => {
    const customer = await snap.data();
    await customersIndex.deleteObject(customer.uid);
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
  .document("users/{userId}")
  .onUpdate(async (snap, context) => {
    const customer = snap.after.data();
    await customersIndex.partialUpdateObject({
      objectID: customer.uid,
      username: customer.username,
      phoneNumber: customer.phoneNumber,
    });
    await admin.firestore().collection("appGlobals").doc("customers").set(
      {
        customersLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  });

exports.agentRequestCreated = functions.firestore
  .document("agentRequests/{agentRequestId}")
  .onCreate(async (snap, context) => {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("agentRequests")
      .set(
        {
          agentRequestsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          agentRequestsCount: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
    return false;
  });

exports.onAgentRequestDeleted = functions.firestore
  .document("agentRequests/{agentRequestId}")
  .onDelete(async (snap, context) => {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("agentRequests")
      .set(
        {
          agentRequestsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          agentRequestsCount: admin.firestore.FieldValue.increment(-1),
        },
        { merge: true }
      );
    return true;
  });

exports.onAgentRequestUpdated = functions.firestore
  .document("agentRequests/{agentRequestId}")
  .onUpdate(async (snap, context) => {
    await admin.firestore().collection("appGlobals").doc("agentRequests").set(
      {
        agentRequestsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  });

exports.agentCreated = functions.firestore
  .document("agents/{agentId}")
  .onCreate(async (snap, context) => {
    const agent = snap.data();
    await agentsIndex.saveObject({
      objectID: agent.id,
      username: agent.firstName + agent.lastName,
      email: agent.email,
      phoneNumber: agent.phoneNumber,
    });
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("agents")
      .set(
        {
          agentsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          agentsCount: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
    return false;
  });

exports.onAgentDeleted = functions.firestore
  .document("agents/{agentId}")
  .onDelete(async (snap, context) => {
    const agent = snap.data();
    await agentsIndex.deleteObject(agent.id);
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("agents")
      .set(
        {
          agentsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
          agentsCount: admin.firestore.FieldValue.increment(-1),
        },
        { merge: true }
      );
    return true;
  });

exports.onAgentUpdated = functions.firestore
  .document("agents/{agentId}")
  .onUpdate(async (snap, context) => {
    const agent = snap.after.data();
    await agentsIndex.partialUpdateObject({
      objectID: agent.id,
      username: agent.firstName + agent.lastName,
      phoneNumber: agent.phoneNumber,
    });
    await admin.firestore().collection("appGlobals").doc("agents").set(
      {
        agentsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  });

exports.onFoodCreated = functions.firestore
  .document("foods/{foodId}")
  .onCreate(async (snap, context) => {
    const food = snap.data();
    (async () => {
      try {
        await foodsIndex.saveObject({
          objectID: food.id,
          name: food.name,
        });
      } catch (err) {
        console.log(err);
      }
    })();

    try {
      await admin
        .firestore()
        .collection("appGlobals")
        .doc("foods")
        .set(
          {
            foodsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
            foodsCount: admin.firestore.FieldValue.increment(1),
          },
          { merge: true }
        );
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
          .set(
            {
              numFoods: admin.firestore.FieldValue.increment(1),
            },
            { merge: true }
          );
    } catch (err) {
      console.log(err);
    }
  });

exports.onFoodDeleted = functions.firestore
  .document("foods/{foodId}")
  .onDelete(async (snap, context) => {
    try {
      const food = snap.data();
      await foodsIndex.deleteObject(food.id);

      await admin
        .firestore()
        .collection("appGlobals")
        .doc("foods")
        .set(
          {
            foodsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
            foodsCount: admin.firestore.FieldValue.increment(-1),
          },
          { merge: true }
        );
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
          .set(
            {
              numFoods: admin.firestore.FieldValue.increment(-1),
            },
            { merge: true }
          );
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
      await foodsIndex.partialUpdateObject({
        objectID: after.id,
        name: after.name,
      });
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
            .set(
              {
                numFoods: admin.firestore.FieldValue.increment(-1),
              },
              { merge: true }
            );

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
            .set(
              {
                numFoods: admin.firestore.FieldValue.increment(1),
              },
              { merge: true }
            );
      }
      await admin.firestore().collection("appGlobals").doc("foods").set(
        {
          foodsLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.log(err);
    }
  });

exports.onFoodCategoryCreated = functions.firestore
  .document("foodCategories/{categoryId}")
  .onCreate(async (snap, context) => {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("foods")
      .set(
        {
          foodCategoriesLastUpdate:
            admin.firestore.FieldValue.serverTimestamp(),
          foodCategoriesCount: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
  });

exports.onFoodCategoryDeleted = functions.firestore
  .document("foodCategories/{categoryId}")
  .onDelete(async (snap, context) => {
    await admin
      .firestore()
      .collection("appGlobals")
      .doc("foods")
      .set(
        {
          foodCategoriesLastUpdate:
            admin.firestore.FieldValue.serverTimestamp(),
          foodCategoriesCount: admin.firestore.FieldValue.increment(-1),
        },
        { merge: true }
      );
  });

exports.onFoodCategoryUpdated = functions.firestore
  .document("foodCategories/{categoryId}")
  .onUpdate(async (snap, context) => {
    await admin.firestore().collection("appGlobals").doc("foods").set(
      {
        foodCategoriesLastUpdate: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

// incrementing orders and sales in months and dates
// on created and updated

exports.onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    await ordersIndex.saveObject({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      id: order.id,
      objectID: order.id,
    });
    await onOrderAdded(snap.data() as orderType);
  });

exports.onOrderUpdated = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (snap, context) => {
    const after = snap.after.data();
    try {
      await ordersIndex.partialUpdateObject({
        objectID: after.id,
        customerName: after.customerName,
        customerPhone: after.customerPhone,
        id: after.id,
      });
    } catch {}
    await onUpdateOrder(snap);
    if (after.completed) {
      await customSendPushNotification(
        after.createdBy,
        `Order Id: ${after.id} has been marked as complete. If This is not the case, contact support from the app. Enjoy Your meal 😋`,
        "Order Complete",
        {
          orderId: after.id,
          type: notificationTypes.order,
        }
      );
    } else if (after.ongoing) {
      await customSendPushNotification(
        after.createdBy,
        `Order Id: ${after.id}, Rider On Its Way. Hang Tight and wait for your meal `,
        "Rider On Way",
        {
          orderId: after.id,
          type: notificationTypes.order,
        }
      );
    } else if (after.failed) {
      await customSendPushNotification(
        after.createdBy,
        `Order Id: ${after.id}, Order Couldn't be completed, If This is wrong, contact us`,
        "Order Failed",
        {
          orderId: after.id,
          type: notificationTypes.order,
        }
      );
    }
  });

//
exports.onOrderDeleted = functions.firestore
  .document("orders/{orderId}")
  .onDelete(async (snap, context) => {
    const order = snap.data();
    await ordersIndex.deleteObject(order.id);
    //await onOrderDeleted(snap.data() as orderType);
  });
