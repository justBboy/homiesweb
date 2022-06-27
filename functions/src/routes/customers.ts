import * as express from "express";
import * as joi from "joi";
import * as admin from "firebase-admin";
import { phoneNumberPattern } from "../constants/utils";
const router = express.Router();

const reqSchema = joi.object({
  token: joi.string().required(),
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  phoneNumber: joi.string().pattern(phoneNumberPattern).required(),
  email: joi.string().email().required(),
});
router.post("/agentRequest", async (req, res) => {
  const data: {
    token: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  } = req.body;
  try {
    let tVer = await admin.auth().verifyIdToken(data.token);
    if (tVer.superadmin || tVer.admin || tVer.agent)
      return res.json({
        error: "Cannot send agent form, you're already an admin or an agent",
      });

    const isValid = await reqSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    const existsMatches = await admin
      .firestore()
      .collection("agentRequests")
      .where("uid", "==", tVer.uid)
      .get();
    if (!existsMatches.empty)
      return res.json({ error: "Already have a request pending" });
    await admin
      .firestore()
      .collection("agentRequests")
      .doc(tVer.phone_number || data.phoneNumber)
      .set({
        uid: tVer.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        viewed: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
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

const acceptRequestSchema = joi.object({
  token: joi.string().required(),
  uid: joi.string().required(),
});
router.post("/acceptRequest", async (req, res) => {
  const data: { token: string; uid: string } = req.body;
  try {
    const tVer = await admin.auth().verifyIdToken(data.token);
    if (!tVer.admin && !tVer.superadmin)
      return res.json({ error: "Not Authorized" });
    const isValid = await acceptRequestSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    const matches = await admin
      .firestore()
      .collection("agentRequests")
      .where("uid", "==", data.uid)
      .get();
    const request = matches.docs[0].data();
    await admin.auth().setCustomUserClaims(data.uid, {
      agent: true,
    });
    await admin.firestore().collection("agents").add({
      uid: request.uid,
      firstName: request.firstName,
      lastName: request.lastName,
      phoneNumber: request.phoneNumber,
      email: request.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    for (const req of matches.docs) await req.ref.delete();
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

const deleteAgentsSchema = joi.object({
  uids: joi.array().items(joi.string()).required(),
  token: joi.string().required(),
});

router.post("/deleteAgents", async (req, res) => {
  const data: { uids: string[]; token: string } = req.body;
  try {
    const tVer = await admin.auth().verifyIdToken(data.token);
    if (!tVer.admin && !tVer.superadmin)
      return res.json({ error: "Not Authorized" });
    const isValid = await deleteAgentsSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    for (const uid of data.uids) {
      await admin.auth().setCustomUserClaims(uid, { agent: false });
      const matches = await admin
        .firestore()
        .collection("agents")
        .where("uid", "==", uid)
        .get();
      for (const agent of matches.docs) agent.ref.delete();
    }
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

export default router;
