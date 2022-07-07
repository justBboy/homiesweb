import * as express from "express";
import * as admin from "firebase-admin";
import * as joi from "joi";
import { v4 as uuidv4 } from "uuid";
import { transporter } from "../config/nodemailer";

const router = express.Router();

const adminRegisterSchema = joi.object({
  name: joi.string().min(7).max(64).required(),
  phoneNumber: joi.string().length(10).required(),
  email: joi.string().email().required(),
  utoken: joi.string().required(),
});

/*
router.post("/createSuperAdmin", async (req, res) => {
  const data = req.body;
  const user = await admin.auth().createUser({
    displayName: data.name,
    email: data.email,
    disabled: false,
    password: "kkJJ2022@admin@homiez",
    phoneNumber: `+233${data.phoneNumber.substring(1)}`,
  });
  await admin.auth().setCustomUserClaims(user.uid, { superadmin: true });
  await admin.firestore().collection("admins").add({
    uid: user.uid,
    username: user.displayName,
    email: user.email,
    disabled: user.disabled,
    phoneNumber: user.phoneNumber,
  });
  res.send({ success: true });
});
*/

router.post("/registerAdmin", async (req, res) => {
  const data: {
    name: string;
    phoneNumber: string;
    email: string;
    utoken: string;
  } = req.body;
  try {
    try {
      const tVer = await admin.auth().verifyIdToken(data.utoken);
      if (!tVer.superadmin) return res.json({ error: "Not Authorized" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Not Authorized" });
    }

    const isValid = await adminRegisterSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    const user = await admin.auth().createUser({
      displayName: data.name,
      email: data.email,
      disabled: true,
      phoneNumber: `+233${data.phoneNumber.substring(1)}`,
    });
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    const token = uuidv4();
    await admin
      .firestore()
      .collection("admins")
      .add({
        uid: user.uid,
        username: user.displayName,
        email: user.email,
        disabled: user.disabled,
        phoneNumber: user.phoneNumber,
        token,
        expiresAt: Date.now() + 86400000,
      });
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
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

const passwordVerificationSchema = joi.object({
  token: joi.string().required(),
});
router.post("/sendPasswordVerification", async (req, res) => {
  const data: { token: string } = req.body;
  try {
    const tokenRes = await admin.auth().verifyIdToken(data.token);
    if (tokenRes.superadmin || tokenRes.admin) {
      const isValid = await passwordVerificationSchema.validateAsync(data);
      if (isValid.error) return res.json({ error: isValid.error.message });
      const token = await uuidv4();

      const matches = await admin
        .firestore()
        .collection("admins")
        .where("uid", "==", tokenRes.uid)
        .get();

      for (const adm of matches.docs) {
        await adm.ref.update({
          token,
          expiresAt: Date.now() + 10800000,
        });
      }
      try {
        await transporter.sendMail({
          subject: "Reset Password - Homies Admin",
          from: `Homiezfoods Admin ${process.env.EMAIL_USER}`,
          to: tokenRes.email,
          text: `Password Reset Verification, use this ${process.env.ADMIN_BASE_URL}/changePassword/${token} link to reset password`,
          html: `<h3>Password Reset Verification </h3> <br /> <a href="${process.env.ADMIN_BASE_URL}/changePassword/${token}">Click here</a> to reset password`,
        });
        return res.json({ success: true });
      } catch (err) {
        console.log(err);
        return res.json({ error: "Could Not Send Email, please try again" });
      }
    }
    return res.json({ error: "Not Authorized" });
  } catch (err) {
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    return res.json({ error: err });
  }
});

const changePasswordAdminSchema = joi.object({
  token: joi.string().required(),
  uid: joi.string().required(),
  password: joi
    .string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .required(),
});

router.post("/changePasswordAdmin", async (req, res) => {
  const data: { password: string; token: string; uid: string } = req.body;
  try {
    try {
      const tokenRes = await admin.auth().verifyIdToken(data.token);
      if (!tokenRes.admin && !tokenRes.superadmin)
        return res.json({ error: "Not Authorized" });
      if (tokenRes.uid !== data.uid)
        return res.json({ error: "Not Authorized" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Not Authorized" });
    }
    const isValid = await changePasswordAdminSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    await admin.auth().updateUser(data.uid, {
      password: data.password,
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

const changePhoneAdminSchema = joi.object({
  phoneNumber: joi.string().required().length(10),
  token: joi.string().required(),
  uid: joi.string().required(),
});

router.post("/changePhoneAdmin", async (req, res) => {
  const data: { phoneNumber: string; token: string; uid: string } = req.body;
  try {
    try {
      const tokenRes = await admin.auth().verifyIdToken(data.token);
      if (!tokenRes.admin && !tokenRes.superadmin)
        return res.json({ error: "Not Authorized" });
      if (tokenRes.uid !== data.uid)
        return res.json({ error: "Not Authorized" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Not Authorized" });
    }
    const isValid = await changePhoneAdminSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    await admin.auth().updateUser(data.uid, {
      phoneNumber: `+233${data.phoneNumber.substring(1)}`,
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

const updateAdminSchema = joi.object({
  token: joi.string().required(),
  uid: joi.string().required(),
  username: joi.string().required(),
  phoneNumber: joi.string().required().length(10),
  email: joi.string().email().required(),
});

router.post("/updateAdmin", async (req, res) => {
  const data: {
    uid: string;
    username: string;
    phoneNumber: string;
    email: string;
    token: string;
  } = req.body;

  try {
    try {
      const reqUser = await admin.auth().verifyIdToken(data.token);
      if (!reqUser.superadmin) return res.json({ error: "Not Authorized" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Not Authorized" });
    }
    const isValid = await updateAdminSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    await admin.auth().updateUser(data.uid, {
      displayName: data.username,
      phoneNumber: `+233${data.phoneNumber.substring(1)}`,
      email: data.email,
    });
    const matches = await admin
      .firestore()
      .collection("admins")
      .where("uid", "==", data.uid)
      .get();
    for (const user of matches.docs)
      await user.ref.update({
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
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

const deleteAdminsSchema = joi.array().items(joi.string());
router.post("/deleteAdmins", async (req, res) => {
  const data: string[] = req.body;
  try {
    const isValid = await deleteAdminsSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    await admin.auth().deleteUsers(data);
    for (const uid of data) {
      const matched = await admin
        .firestore()
        .collection("admins")
        .where("uid", "==", uid)
        .get();
      for (const u of matched.docs) await u.ref.delete();
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

const resendVerificationSchema = joi.object({
  email: joi.string().email().required(),
  utoken: joi.string().required(),
});
router.post("/resendVerification", async (req, res) => {
  const data: { email: string; utoken: string } = req.body;
  try {
    const isValid = await resendVerificationSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    try {
      const user = await admin.auth().getUserByEmail(data.email);
      if (user) {
        const token = uuidv4();
        try {
          const matched = await admin
            .firestore()
            .collection("admins")
            .where("uid", "==", user.uid)
            .get();
          for (const userToken of matched.docs) {
            await userToken.ref.set(
              {
                token,
                expiresAt: Date.now() + 86400000,
              },
              { merge: true }
            );
          }
        } catch (err) {
          console.log(err);
          await admin
            .firestore()
            .collection("admins")
            .add({
              uid: user.uid,
              username: user.displayName,
              phoneNumber: user.phoneNumber,
              email: user.email,
              disabled: user.disabled,
              token,
              expiresAt: Date.now() + 86400000,
            });
        } finally {
          const isSuccess = await sendAdminRegistrationEmailLink(
            user.email ? user.email : "",
            token,
            user.displayName ? user.displayName : ""
          );
          if (isSuccess) return res.json({ success: true });
          return res.json({ error: "Could not send email, please try again" });
        }
      } else {
        return res.json({ error: "User isn't recorded in the database yet" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: "User isn't recorded in the database yet" });
    }
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

router.get("/getUserWithToken", async (req, res) => {
  const token: any = req.query.token;
  try {
    if (!token) return res.json({ error: "No token was provided" });
    try {
      const matched = await admin
        .firestore()
        .collection("admins")
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
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
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
      .collection("admins")
      .where("token", "==", data.token)
      .get();
    const userToken = matched.docs[0].data();
    const user = await admin.auth().updateUser(userToken.uid, {
      password: data.password,
      disabled: false,
    });

    for (const match of matched.docs) {
      await match.ref.update({
        disabled: user.disabled,
        token: "",
        expiresAt: 0,
      });
    }

    return res.json({ disabled: user.disabled });
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

const sendAdminRegistrationEmailLink = async (
  email: string,
  token: string,
  name: string
) => {
  try {
    await transporter.sendMail({
      from: `Homiezfoods Admin <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Admin Registration",
      text: `Admin Registration process - Click on this link and set password to become an admin ${process.env.ADMIN_BASE_URL}/register/${token}`,
      html: `<h2>Hi ${name}, </h2> <br />Admin Registration process - Click on this link and set password to become an admin ${process.env.ADMIN_BASE_URL}/register/${token}`,
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

// customers

const registerCustomerSchema = joi.object({
  uid: joi.string().required(),
  token: joi.string().required(),
  refCode: joi.string().optional().allow(null, ""),
  email: joi.string().email().required(),
});
router.post("/registerCustomer", async (req, res) => {
  const data: { uid: string; token: string; email: string; refCode?: string } =
    req.body;
  try {
    console.log("here");
    try {
      var tokenRes = await admin.auth().verifyIdToken(data.token);
      if (tokenRes.admin || tokenRes.superadmin || tokenRes.uid !== data.uid)
        return res.json({ error: "Not Authorized" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Not Authorized" });
    }
    console.log(tokenRes);
    const isValid = await registerCustomerSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    try {
      const user = await admin.auth().updateUser(tokenRes.uid, {
        email: data.email,
      });
      const check = await admin
        .firestore()
        .collection("users")
        .where("uid", "==", tokenRes.uid)
        .get();
      if (check.size > 0) {
        const customToken = await admin.auth().createCustomToken(tokenRes.uid);
        for (const adm of check.docs) {
          adm.ref.update({
            uid: user.uid,
            username: user.displayName,
            email: user.email,
            disabled: user.disabled,
            phoneNumber: user.phoneNumber,
          });
        }
        return res.json({ success: true, customToken });
      }
      await admin
        .firestore()
        .collection("users")
        .add({
          uid: user.uid,
          username: user.displayName,
          email: user.email,
          disabled: user.disabled,
          phoneNumber: user.phoneNumber,
          ...(data.refCode && { refCode: data.refCode }),
        });
      const customToken = await admin.auth().createCustomToken(user.uid);
      return res.json({ success: true, customToken });
    } catch (err) {
      console.log(err);
      return res.json({ error: "User not found" });
    }
  } catch (err) {
    if (typeof err === "object") {
      if ((err as any).details) {
        return res.json({ error: (err as any).details[0].message });
      }
    }
    console.log(err);
    return res.json({ error: "Error, registering as customer" });
  }
});

const deleteCustomersSchema = joi.array().items(joi.string());
router.post("/deleteCustomers", async (req, res) => {
  const data: string[] = req.body;
  try {
    const isValid = await deleteCustomersSchema.validateAsync(data);
    if (isValid.error) return res.json({ error: isValid.error.message });
    await admin.auth().deleteUsers(data);
    for (const uid of data) {
      const matched = await admin
        .firestore()
        .collection("users")
        .where("uid", "==", uid)
        .get();
      for (const u of matched.docs) await u.ref.delete();
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

const adminAddCustomerSchema = joi.object({
  token: joi.string().required(),
  data: joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    phoneNumber: joi
      .string()
      .pattern(/^[0]?\d{9}$/)
      .required(),
  }),
});
router.post("/adminAddCustomer", async (req, res) => {
  const b: {
    token: string;
    data: { username: string; email: string; phoneNumber: string };
  } = req.body;
  try {
    try {
      var tokenRes = await admin.auth().verifyIdToken(b.token);
      if (tokenRes.superadmin != true && tokenRes.admin != true)
        return res.json({ error: "Unauthorized" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Not Authorized" });
    }
    const isValid = await adminAddCustomerSchema.validateAsync(b);
    if (isValid.error) return res.json({ error: isValid.error.message });
    const user = await admin.auth().createUser({
      displayName: b.data.username,
      phoneNumber: `+233${b.data.phoneNumber.substring(1)}`,
      email: b.data.email,
    });
    await admin.firestore().collection("users").add({
      uid: user.uid,
      username: user.displayName,
      email: user.email,
      disabled: user.disabled,
      phoneNumber: user.phoneNumber,
    });
    return res.json({ success: true, uid: user.uid });
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
