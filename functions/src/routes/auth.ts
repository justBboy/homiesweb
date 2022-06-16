import * as express from "express";
import * as admin from "firebase-admin";
import * as joi from "joi";

const router = express.Router();

router.get("/test", async (req, res) => {
  res.send("testing");
});

export default router;
