import * as express from "express";
import * as admin from "firebase-admin";
import * as joi from "joi";
import { v4 as uuidv4 } from "uuid";
import { foodsIndex, ordersIndex } from "../config/algolia";
import { transporter } from "../config/nodemailer";
import { orderType, foodType } from "../constants/types";
import { baseURL, phoneNumberPattern } from "../constants/utils";

const router = express.Router();

router.get("/getCategories", async (req, res) => {
  try {
    const g = await admin.firestore().collection("foodCategories").get();
    return res.json(
      g.docs.map((c) => ({
        id: c.data().id,
        name: c.data().name,
        imgURL: c.data().imgURL,
      }))
    );
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

router.get("/foodGlobals", async (req, res) => {
  try {
    const cRes = await admin
      .firestore()
      .collection("appGlobals")
      .doc("foods")
      .get();
    const data = cRes.data();
    console.log(data);
    return res.json({
      foodCategoriesLastUpdate: data?.foodCategoriesLastUpdate?._seconds || 0,
      foodsLastUpdate: data?.foodsLastUpdate?._seconds || 0,
    });
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

router.get("/orderGlobals", async (req, res) => {
  try {
    const cRes = await admin
      .firestore()
      .collection("appGlobals")
      .doc("orders")
      .get();
    const data = cRes.data();
    console.log(data?.ordersLastUpdate._nanoseconds);
    return res.json({
      ordersLastUpdate: data?.ordersLastUpdate._nanoseconds || 0,
    });
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

const numInPage = 9;
router.get("/foods", async (req, res) => {
  const lastDocId: string =
    (req.query.lastDocId && req.query.lastDocId.toString()) || "";
  const category = (req.query.category && req.query.category.toString()) || "";
  let isNewSet = false;
  try {
    let fRes: any;
    let lastDoc: any;
    if (lastDocId) {
      lastDoc = (
        await admin
          .firestore()
          .collection("foods")
          .where("id", "==", lastDocId)
          .get()
      ).docs[0];
    }
    if (category) {
      if (lastDoc && category) {
        fRes = await admin
          .firestore()
          .collection("foods")
          .where("category.id", "==", category)
          .orderBy("name")
          .startAfter(lastDoc)
          .limit(numInPage)
          .get();
      } else if (category && !lastDoc) {
        isNewSet = true;
        fRes = await admin
          .firestore()
          .collection("foods")
          .where("category.id", "==", category)
          .orderBy("name")
          .limit(numInPage)
          .get();
      }
    } else {
      if (lastDoc?.exists) {
        console.log("last doc no category");
        fRes = await admin
          .firestore()
          .collection("foods")
          .orderBy("name")
          .startAfter(lastDoc)
          .limit(numInPage)
          .get();
      } else {
        isNewSet = true;
        fRes = await admin
          .firestore()
          .collection("foods")
          .orderBy("name")
          .limit(numInPage)
          .get();
      }
    }
    console.log(isNewSet, fRes);
    return res.json({
      isNewSet,
      items: fRes.docs.map((d: any) => {
        const data = d.data();
        return {
          id: data.id,
          name: data.name,
          price: data.price,
          imgURL: data.imgURL,
          includes: data.includes,
          category: data.category.id,
          available: data.available,
        };
      }),
    });
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

const orderSchema = joi.object({
  token: joi.string().required(),
  foods: joi.array().items(
    joi.object({
      id: joi.string().required(),
      quantity: joi.number().required(),
    })
  ),
});
router.post("/orderAndPayManually", async (req, res) => {
  const data: { token: string; foods: { id: string; quantity: number }[] } =
    req.body;
  try {
    const tVer = await admin.auth().verifyIdToken(data.token);
    if (!tVer) return res.json({ error: "Unauthorized" });
    let hasRefCode = false;

    const isValid = await orderSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    const foods = await getFoodItemsWithIds(data.foods);
    const totalPrice = foods.reduce((p, c) => {
      return p + c.price * c.quantity;
    }, 0);
    const customer = (
      await admin
        .firestore()
        .collection("users")
        .where("uid", "==", tVer.uid)
        .get()
    ).docs[0].data();
    if (customer.refCode) {
      try {
        const agent = (
          await admin
            .firestore()
            .collection("agents")
            .where("refCode", "==", customer.refCode)
            .get()
        ).docs[0];
        agent.ref.set(
          {
            orders: admin.firestore.FieldValue.increment(1),
            profit: admin.firestore.FieldValue.increment(1),
          },
          { merge: true }
        );
        hasRefCode = true;
      } catch (err) {
        console.log(err);
      }
    }
    const newOrder: orderType = {
      items: foods,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: tVer.uid,
      hasRefCode,
      id: uuidv4(),
      totalPrice: hasRefCode ? totalPrice - 1 - 0.2 : totalPrice - 0.2,
      customerName: customer.username ? customer.username : "",
      customerPhone: customer.phoneNumber ? customer.phoneNumber : "",
    };
    await admin.firestore().collection("orders").add(newOrder);
    return res.json(newOrder);
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

const changeInfoSchema = joi.object({
  token: joi.string().required(),
  phoneNumber: joi.string().pattern(phoneNumberPattern).required(),
  email: joi.string().email().required(),
});

router.post("/changeDetails", async (req, res) => {
  const data: { token: string; phoneNumber: string; email: string } =
    await req.body;
  try {
    const tVer = await admin.auth().verifyIdToken(data.token);
    if (!tVer) return res.json({ error: "Not Authorized" });
    const isValid = await changeInfoSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    const userInfo = (
      await admin
        .firestore()
        .collection("users")
        .where("uid", "==", tVer.uid)
        .get()
    ).docs[0];
    if (!userInfo.exists)
      return res.json({ error: "User Data not in available" });
    const e = await admin
      .firestore()
      .collection("users")
      .where("email", "==", data.email)
      .get();
    const p = await admin
      .firestore()
      .collection("users")
      .where("phoneNumber", "==", "0" + data.phoneNumber.substring(0))
      .get();
    const emailDoesNotExist = e.empty || e.docs[0]?.data()?.uid === tVer.uid;
    const phoneDoesNotExist = p.empty || p.docs[0]?.data()?.uid === tVer.uid;
    console.log(emailDoesNotExist, phoneDoesNotExist);
    if (!emailDoesNotExist || !phoneDoesNotExist)
      return res.json({
        error: "Email Or Phone Number Already Exists for another account",
      });
    const vToken = uuidv4();
    const docInStore = await admin
      .firestore()
      .collection("detailsChangeTokens")
      .where("uid", "==", tVer.uid)
      .get();

    if (docInStore.empty) {
      await admin
        .firestore()
        .collection("detailsChangeTokens")
        .add({
          uid: tVer.uid,
          token: vToken,
          expiresAt: Date.now() + 10800000,
          newEmail: data.email,
          newPhoneNumber: data.phoneNumber,
        });
    } else {
      docInStore.docs[0].ref.update({
        token: vToken,
        expiresAt: Date.now() + 10800000,
        newEmail: data.email,
        newPhoneNumber: data.phoneNumber,
      });
    }

    await transporter.sendMail({
      subject: "Change Personal Info - HomiezFoods",
      from: `${process.env.EMAIL_PASSWORD}`,
      to: tVer.email,
      text: `Request to change your personal info, use this ${process.env.BASE_URL}/account/changeInfo/${vToken} to change your information. Link will expire in 3 hours`,
      html: `<h3>Request to change your personal info </h3> <br /> <a href="${baseURL}/account/changeInfo/${vToken}">Click here</a> to complete process<p>Link will expire in 3 hours</p>`,
    });
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

const changeDetailsVerifySchema = joi.object({
  utoken: joi.string().required(),
  token: joi.string().required(),
});
router.post("/changeDetails/verifyToken", async (req, res) => {
  const tokens = req.body;
  try {
    const tVer = await admin.auth().verifyIdToken(tokens.utoken);
    if (!tVer)
      return res.json({
        error: "Unauthorized, please login to your account first",
      });
    const isValid = await changeDetailsVerifySchema.validateAsync(tokens);
    if (isValid.error) return res.json({ error: isValid.error.message });
    const tokenInfo = (
      await admin
        .firestore()
        .collection("detailsChangeTokens")
        .where("token", "==", tokens.token)
        .get()
    ).docs[0];
    if (!tokenInfo.exists) return res.json({ error: "Invalid token" });
    if (tokenInfo.data().expiresAt < Date.now())
      return res.json({ error: "Token Expired" });
    const newData = tokenInfo.data();
    console.log(newData);
    await admin.auth().updateUser(tVer.uid, {
      email: newData.newEmail,
      phoneNumber: `+233${newData.newPhoneNumber.substring(1)}`,
    });
    const userInStore = (
      await admin
        .firestore()
        .collection("users")
        .where("uid", "==", tVer.uid)
        .get()
    ).docs[0];
    userInStore.ref.update({
      email: newData.newEmail,
      phoneNumber: `+233${newData.newPhoneNumber.substring(1)}`,
    });
    await tokenInfo.ref.delete();
    const loginToken = await admin.auth().createCustomToken(tVer.uid);
    return res.json({ loginToken });
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

const getFoodItemsWithIds = async (
  foods: { id: string; quantity: number }[]
) => {
  const items: {
    id: string;
    itemCategory: string;
    foodName: string;
    price: number;
    quantity: number;
  }[] = [];
  for (const f of foods) {
    const matches = await admin
      .firestore()
      .collection("foods")
      .where("id", "==", f.id)
      .get();
    const food = matches.docs[0];
    const fdata = food.data();
    items.push({
      id: fdata.id,
      foodName: fdata.name,
      itemCategory: fdata.category.id,
      price: fdata.price,
      quantity: f.quantity,
    });
  }
  return items;
};

router.get("/searchFood", async (req, res) => {
  const search = req.query.s?.toString() || "";
  const page = (req.query.page && parseInt(req.query.page.toString())) || 0;
  console.log(search);
  try {
    if (search) {
      const searchRes = await foodsIndex.search(search, {
        hitsPerPage: 9,
        page,
      });
      const { hits } = searchRes;

      const foods: foodType[] = [];
      for (const hit of hits) {
        const matches = await admin
          .firestore()
          .collection("foods")
          .where("id", "==", hit.objectID)
          .get();
        if (!matches.empty) {
          const foodData = matches.docs[0].data();
          foods.push({
            category: foodData.category,
            id: foodData.id,
            imgURL: foodData.imgURL,
            name: foodData.name,
            price: foodData.price,
            available: foodData.available,
            includes: foodData.includes,
          });
        }
      }
      return res.json(foods);
    }
    return res.json({ error: "No Search" });
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

router.get("/searchOrder", async (req, res) => {
  const token = req.query.token?.toString() || "";
  const search = req.query.s?.toString() || "";
  const page = (req.query.page && parseInt(req.query.page.toString())) || 0;
  try {
    if (search) {
      const tVer = await admin.auth().verifyIdToken(token);
      if (!tVer.uid) return res.json({ error: "Not Authorized" });
      const searchRes = await ordersIndex.search(search, {
        hitsPerPage: 9,
        page,
      });
      const { hits } = searchRes;

      const orders: orderType[] = [];
      console.log(hits);
      for (const hit of hits) {
        const matches = await admin
          .firestore()
          .collection("orders")
          .where("id", "==", hit.objectID)
          .get();
        if (!matches.empty) {
          const orderData = matches.docs[0].data() as orderType;
          if (orderData.createdBy === tVer.uid) {
            orders.push({
              createdAt: orderData.createdAt,
              createdBy: orderData.createdBy,
              id: orderData.id,
              items: orderData.items,
              totalPrice: orderData.totalPrice,
              completed: orderData.completed,
              customerName: orderData.customerName,
              customerPhone: orderData.customerPhone,
              failed: orderData.failed,
              hasRefCode: orderData.hasRefCode,
            });
          }
        }
      }
      console.log(orders);
      return res.json(orders);
    }
    return res.json({ error: "No Search" });
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

router.get("/getAgentInfo", async (req, res) => {
  const token = req.query.token?.toString() || "";
  try {
    console.log(token);
    if (!token) return res.json({ error: "Not An Agent" });
    const tVer = await admin.auth().verifyIdToken(token);
    if (!tVer.uid) return res.json({ error: "Not Authorized" });
    const agent = await admin
      .firestore()
      .collection("agents")
      .where("uid", "==", tVer.uid)
      .get();
    if (agent.empty) return res.json({ error: "User Is not an agent" });
    return res.json(agent);
  } catch (err) {
    console.log(err);
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

export default router;
