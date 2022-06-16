import { Media } from "@prisma/client";
import express from "express";
import { prisma } from "../db";
import logger from "../utils/logger";
import validate from "../utils/validate";
import {
  addProjectSchema,
  patchProjectSchema,
  updateProjectSchema,
} from "./project.schema";

const projectRouter = express.Router();

projectRouter.get(
  "/all",
  async (req: express.Request, res: express.Response) => {
    const allProjects = await prisma.project.findMany({
      include: {
        media: !!req.query.includeMedia,
      },
    });
    logger.info("Got all projects");
    res.send({ success: true, projects: allProjects });
  }
);

projectRouter.get(
  "/:id",
  async (req: express.Request, res: express.Response) => {
    if (!req.params.id) {
      res.status(400).send({ success: false, message: "Invalid project id" });
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        media: true,
      },
    });

    if (!project) {
      res.status(404).send({ success: false, message: "Not found" });
      return;
    }

    logger.info(`Got project ${project.id}`);
    res.send({ success: true, project });
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

    const createdProject = await prisma.project.create({
      include: {
        media: true,
      },
      data: {
        name: data.name,
        layout: data.layout,
        media: {
          create: data.media.map((e) => {
            return {
              color: e.color,
              name: e.name,
              type: e.type,
              number: e.number,
              media: e.media,
            };
          }),
        },
      },
    });

    logger.info(`Created a new project with id ${createdProject.id}`);
    res.send({ success: true, project: createdProject });
  }
);

projectRouter.put(
  "/update",
  async (req: express.Request, res: express.Response) => {
    const data = await validate(updateProjectSchema, req.body, res);
    if (!data) return;

    const updatedProject = await prisma.project.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.project.name,
        layout: data.layout,
      },
    });

    //Delete all the media
    await prisma.media.deleteMany({
      where: {
        projectId: updatedProject.id,
      },
    });

    //Replace all nulls, serialize the object
    const media: Media[] = data.project.media.map((e) => {
      return {
        color: e.color ?? "#808080",
        name: e.name ?? "",
        number: e.number,
        type: e.type,
        media: e.media ?? undefined,
        projectId: updatedProject.id,
      };
    });

    //Create the media once again
    await prisma.media.createMany({
      data: media,
    });

    const newProject = await prisma.project.findFirst({
      where: {
        id: updatedProject.id,
      },
      include: {
        media: true,
      },
    });

    logger.info(`Project ${newProject.id} has been updated!`);
    res.send({ success: true, project: newProject });
  }
);

projectRouter.patch(
  "/update",
  async (req: express.Request, res: express.Response) => {
    const data = await validate(patchProjectSchema, req.body, res);
    if (!data) return;

    // Check if the project exists
    const project = await prisma.project.findFirst({
      where: {
        id: data.id,
      },
    });

    if (!project) {
      res.status(404).send({ success: false, message: "Not found" });
      return;
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: project.id,
      },
      data: data.project,
    });

    res.send({ success: true, project: updatedProject });
  }
);

projectRouter.delete(
  "/delete",
  async (req: express.Request, res: express.Response) => {
    if (!req.body.id) {
      res.status(404).send({ success: false, error: "Not found" });
      return;
    }

    //Check if the project even exists
    const project = await prisma.project.findFirst({
      where: {
        id: req.body.id,
      },
    });

    if (!project) {
      res.status(404).send({ success: false, error: "Not found" });
      return;
    }

    await prisma.project.delete({
      where: {
        id: project.id,
      },
    });

    logger.info(`Project ${project.id} has been deleted!`);
    res.send({ success: true });
  }
);

export default projectRouter;
