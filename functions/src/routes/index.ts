import * as express from "express";
import authRoutes from "./auth";
import customersRoutes from "./customers";
import usersRoutes from "./users";
import globalRoutes from "./globals";

export default function routes(app: express.Application) {
  app.use("/auth", authRoutes);
  app.use("/customers", customersRoutes);
  app.use("/users", usersRoutes);
  app.use("/globals", globalRoutes);
}
