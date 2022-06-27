import * as express from "express";
import * as admin from "firebase-admin";

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
    return res.json({
      foodCategoriesLastUpdate: data?.foodCategoriesLastUpdate || 0,
      foodsLastUpdate: data?.foodsLastUpdate || 0,
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

const numInPage = 20;
router.get("/foods", async (req, res) => {
  const lastDocId: string =
    (req.query.lastDocId && req.query.lastDocId.toString()) || "";
  try {
    let fRes: any;
    if (lastDocId) {
      const lastDoc = (
        await admin
          .firestore()
          .collection("foods")
          .where("id", "==", lastDocId)
          .get()
      ).docs[0];
      fRes = await admin
        .firestore()
        .collection("foods")
        .orderBy("name")
        .startAfter(lastDoc)
        .limit(numInPage)
        .get();
    } else {
      fRes = await admin
        .firestore()
        .collection("foods")
        .orderBy("name")
        .limit(numInPage)
        .get();
    }
    return res.json(
      fRes.docs.map((d: any) => {
        const data = d.data();
        return {
          id: data.id,
          name: data.name,
          price: data.price,
          imgURL: data.imgURL,
          available: data.available,
        };
      })
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

export default router;
