const express = require("express");
const path = require("path");
const cron = require("node-cron");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=3600"); 
});

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

cron.schedule("0 0 * * *", async () => {
  try {
    const cache = await caches.open("dynamic-cache");
    await cache.keys().then(async (requests) => {
      for (const request of requests) {
        await cache.delete(request);
      }
      console.log("Cache cleaned at midnight");
    });
  } catch (error) {
    console.error("Cache cleanup error:", error);
  }
});
