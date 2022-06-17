import * as express from "express";
import * as admin from "firebase-admin";
import * as joi from "joi";
import { v4 as uuidv4 } from "uuid";
import { transporter } from "../config/nodemailer";
import { baseURL } from "../constants/utils";

const router = express.Router();

router.get("/test", async (req, res) => {
  res.send("testing");
});

const adminRegisterSchema = joi.object({
  name: joi.string().min(7).max(64).required(),
  phone: joi.string().length(10).required(),
  email: joi.string().email().required(),
});

router.post("/registerAdmin", async (req, res) => {
  const data: { name: string; phone: string; email: string } = req.body;
  try {
    const isValid = await adminRegisterSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    const user = await admin.auth().createUser({
      displayName: data.name,
      email: data.email,
      disabled: true,
      phoneNumber: `+233${data.phone.substring(1)}`,
    });
    const token = uuidv4();
    await admin
      .firestore()
      .collection("adminTokens")
      .add({
        uid: user.uid,
        token,
        expiresAt: Date.now() + 86400000,
      });
    await admin.auth().setCustomUserClaims(user.uid, { superadmin: true });
    const sent = await sendAdminRegistrationEmailLink(
      data.email,
      token,
      data.name
    );
    if (sent) return res.json({ success: true });
    else
      return res.json({
        error: "There was an error sending the email, please try again",
      });
  } catch (err) {
    console.log(err);
    return res.json({ error: err });
  }
});

router.get("/getUserWithToken", async (req, res) => {
  const token: any = req.query.token;
  try {
    if (!token) return res.json({ error: "No token was provided" });
    try {
      const matched = await admin
        .firestore()
        .collection("adminTokens")
        .where("token", "==", token)
        .get();
      const userToken = matched.docs[0].data();
      const user = await admin.auth().getUser(userToken.uid);
      return res.json(user);
    } catch (err) {
      console.log(err);
      return res.json({ error: "User not found" });
    }
  } catch (err) {
    console.log(err);
    return res.json({ error: err });
  }
});

const passwordSetSchema = joi.object({
  token: joi.string().required(),
  password: joi
    .string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .required(),
});

router.post("/setPassword", async (req, res) => {
  const data: { token: string; password: string } = req.body;
  try {
    const isValid = await passwordSetSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    const matched = await admin
      .firestore()
      .collection("adminTokens")
      .where("token", "==", data.token)
      .get();
    const userToken = matched.docs[0].data();
    const user = await admin.auth().updateUser(userToken.uid, {
      password: data.password,
      disabled: false,
    });

    for (const match of matched.docs) {
      await match.ref.delete();
    }

    return res.json({ disabled: user.disabled });
  } catch (err) {
    console.log(err);
    return res.json({ error: err });
  }
});

const sendAdminRegistrationEmailLink = async (
  email: string,
  token: string,
  name: string
) => {
  try {
    await transporter.sendMail({
      from: "testing@ynnez.com",
      to: email,
      subject: "Admin Registration",
      text: `Admin Registration process - Click on this link and enter password to become an admin ${baseURL}/register/${token}`,
      html: `<h2>Hi ${name}, </h2> <br />Admin Registration process - Click on this link and enter password to become an admin ${baseURL}/register/${token}`,
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default router;
