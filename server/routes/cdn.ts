import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";

const cdnRouter = express.Router();

cdnRouter.get("/video/list", async (req: Request, res: Response) => {
  fs.readdir(path.join(__dirname, "..", "cdn", "video"), (err, files) => {
    if (err) {
      logger.error("Error while getting the video list");
      console.error(err);
      res.status(500).send({ success: false, error: err });
    } else {
      res.send({ success: true, files: files });
    }
  });
});

cdnRouter.get("/video/:filename", async (req: Request, res: Response) => {
  const filename = req.params.filename;

  //Allow only letters, numbers, hyphens and dots (to make it more secure)
  if (!/^[a-zA-Z0-9-.]+$/.test(filename)) {
    res.status(400).send({ success: false, message: "Forbidden filename" });
    return;
  }

  const filePath = path.join(__dirname, "..", "cdn", "video", filename);
  console.log(filePath);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send({ success: false, error: "Not found" });
  }
});

cdnRouter.get("/:filename", async (req: Request, res: Response) => {
  const filename = req.params.filename;

  //Allow only letters, numbers, hyphens and dots (to make it more secure)
  if (!/^[a-zA-Z0-9-.]+$/.test(filename)) {
    res.status(400).send({ success: false, message: "Forbidden filename" });
    return;
  }

  const filePath = path.join(__dirname, "..", "cdn", filename);
  console.log(filePath);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send({ success: false, error: "Not found" });
  }
});

export default cdnRouter;
