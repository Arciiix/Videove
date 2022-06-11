import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const cdnRouter = express.Router();

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
