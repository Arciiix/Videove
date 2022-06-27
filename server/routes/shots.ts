import express from "express";
import { prisma } from "../db";
import validate from "../utils/validate";
import { updateOneShotSchema, updateShotsSchema } from "./shots.schema";

const shotsRouter = express.Router();

shotsRouter.get("/:projectId", async (req, res) => {
  //Find the project and include the shots
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.projectId,
    },
    include: {
      shots: true,
    },
  });

  if (!project) {
    res.status(404).send({ success: false, error: "Project not found" });
    return;
  }

  res.send({ success: true, shots: project.shots.data });
});

shotsRouter.put("/:projectId", async (req, res) => {
  const data = await validate(updateShotsSchema, req.body, res);
  if (!data) return;

  //Check if the projects exists
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.projectId,
    },
  });

  if (!project) {
    res.status(404).send({ success: false, error: "Project not found" });
    return;
  }

  const newShots = await prisma.shots.update({
    where: {
      id: project.shotsId,
    },
    data: {
      data: data.shots,
    },
  });

  res.send({ success: true, shots: newShots });
});

//Edit shot with given index
shotsRouter.put("/:projectId/:shotIndex", async (req, res) => {
  const data = await validate(updateOneShotSchema, req.body, res);
  if (!data) return;

  if (
    isNaN(parseInt(req.params.shotIndex)) ||
    parseInt(req.params.shotIndex) < 0
  ) {
    res.status(400).send({ success: false, error: "Wrong shot index" });
    return;
  }

  //Check if the projects exists
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.projectId,
    },
    include: {
      shots: true,
    },
  });

  const shots = project.shots.data;

  let shot = shots[req.params.shotIndex];
  if (!shot) {
    res.status(404).send({ success: false, error: "Shot not found" });
    return;
  }

  shots[req.params.shotIndex] = data.shot;
  const updatedShot = await prisma.shots.update({
    where: {
      id: project.shotsId,
    },
    data: {
      data: shots,
    },
  });

  res.send({ success: true, shot: updatedShot });
});

shotsRouter.delete("/:projectId", async (req, res) => {
  //Check if the projects exists
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.projectId,
    },
    include: {
      shots: true,
    },
  });

  if (!project) {
    res.status(404).send({ success: false, error: "Project not found" });
    return;
  }

  await prisma.shots.update({
    where: {
      id: project.shotsId,
    },
    data: {
      data: [],
    },
  });

  res.send({ success: true });
});

shotsRouter.delete("/:projectId/:shotIndex", async (req, res) => {
  if (
    isNaN(parseInt(req.params.shotIndex)) ||
    parseInt(req.params.shotIndex) < 0
  ) {
    res.status(400).send({ success: false, error: "Wrong shot index" });
    return;
  }

  //Check if the projects exists
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.projectId,
    },
    include: {
      shots: true,
    },
  });

  if (!project) {
    res.status(404).send({ success: false, error: "Project not found" });
    return;
  }

  const shots = project.shots.data as [];

  let shot = shots[req.params.shotIndex];
  if (!shot) {
    res.status(404).send({ success: false, error: "Shot not found" });
    return;
  }

  //Remove the shot
  shots.splice(parseInt(req.params.shotIndex), 1);

  const updatedShots = await prisma.shots.update({
    where: {
      id: project.shotsId,
    },
    data: {
      data: shots,
    },
  });

  res.send({ success: true });
});

export default shotsRouter;
