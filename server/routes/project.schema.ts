import Joi from "joi";

const addProjectSchema = Joi.object({
  id: Joi.string(), //For update endpoints
  name: Joi.string().required(),
  media: Joi.array().items(
    Joi.object({
      color: Joi.string()
        .regex(/^#[A-Fa-f0-9]{6}/)
        .allow(null)
        .default("#808080"),
      name: Joi.string().allow(null),
      type: Joi.string()
        .regex(/LOCAL|DROIDCAM|CUSTOM|AUDIO/)
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

export { addProjectSchema, updateProjectSchema };
