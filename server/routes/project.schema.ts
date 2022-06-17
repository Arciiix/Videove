import Joi, { string } from "joi";

const layoutSchema = Joi.object({
  i: Joi.string(),
  x: Joi.number(),
  y: Joi.number(),
  w: Joi.number(),
  h: Joi.number(),
  moved: Joi.boolean(),
  static: Joi.boolean(),
});
const addProjectSchema = Joi.object({
  id: Joi.string(), //For update endpoints
  name: Joi.string().required(),
  layout: Joi.array().items(layoutSchema),
  media: Joi.array().items(
    Joi.object({
      color: Joi.string()
        .regex(/^#[A-Fa-f0-9]{6}/)
        .allow(null)
        .default("#808080"),
      name: Joi.string().allow(null),
      number: Joi.number(),
      type: Joi.string()
        .regex(/LOCAL|DROIDCAM|CUSTOM|AUDIO|COLOR/)
        .required(),
      media: Joi.object().allow(null),
      projectId: Joi.string(), //For update endpoints
    })
  ),
});

const updateProjectSchema = Joi.object({
  id: Joi.string().required(),
  project: addProjectSchema,
});

const projectsWithoutMediaSchema = Joi.object({
  id: Joi.string(),
  name: Joi.string(),
  layout: Joi.array().items(layoutSchema),
});

const patchProjectSchema = Joi.object({
  projectId: Joi.string(),
  project: projectsWithoutMediaSchema.required(),
});

export { addProjectSchema, updateProjectSchema, patchProjectSchema };
