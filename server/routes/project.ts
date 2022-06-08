import express from "express";
import Joi from "joi";
import { prisma } from "../db";
import validate from "../utils/validate";
import { addProjectSchema } from "./project.schema";

const projectRouter = express.Router();

projectRouter.get(
  "/all",
  async (req: express.Request, res: express.Response) => {
    const allProjects = await prisma.project.findMany({});
    res.send({ success: true, projects: allProjects });
  }
);

projectRouter.post(
  "/create",
  async (req: express.Request, res: express.Response) => {
    const data = await validate(addProjectSchema, req.body, res);
    if (!data) return;

    //Check if a project with the given name already exists
    const previousProject = await prisma.project.findFirst({
      where: {
        name: data.name,
      },
    });
    if (previousProject) {
      res.status(409).send({
        success: false,
        error: "Project with the given name already exists",
      });
      return;
    }

    const createdMedia = await prisma.project.create({
      data: {
        name: data.name,
        media: {
          create: data.media.map((e) => {
            return {
              color: e.color,
              name: e.name,
              type: e.type,
              media: e.media,
            };
          }),
        },
      },
    });
    res.send({ success: true, media: createdMedia });
  }
);

export default projectRouter;
