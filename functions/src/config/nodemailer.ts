import * as nodemailer from "nodemailer";

export let transporter = nodemailer.createTransport({
  host: "mail.ynnez.com",
  port: 465,
  secure: true,
  auth: {
    user: "testing@ynnez.com",
    pass: "justBBoy1@nodejs",
  },
});
