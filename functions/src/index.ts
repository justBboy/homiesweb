import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import routes from "./routes";

admin.initializeApp();

const app = express();

//middleware
app.use(cors())
app.use(express.json())

// routes
routes(app)

exports.app = functions.https.onRequest(app);