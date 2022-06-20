import * as express from "express";
import authRoutes from "./auth";

export default function routes(app: express.Application){
   app.use("/auth", authRoutes);
}
