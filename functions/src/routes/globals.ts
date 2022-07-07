import fetch from "cross-fetch";

import * as express from "express";
const router = express.Router();
router.get("/get_long_lat/:address", async (req, res) => {
  const address = req.params.address;
  try {
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )},+CA&key=${process.env.GOOGLE_API_KEY}`
    );
    const data = await r.json();
    if (!data.results.length)
      res.json({ error: "Couldn't get location on map" });
    const geoData = data.results[0];
    return res.json(geoData);
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
