import Joi from "joi";

const shotSchema = Joi.object({
  mediaNumber: Joi.number().required(),
  color: Joi.string(),
  name: Joi.string().allow(null, ""),
  delaySeconds: Joi.number().required(),
  durationSeconds: Joi.number().required(),
});
const shotsSchema = Joi.array().items(shotSchema);

const updateShotsSchema = Joi.object({
  shots: shotsSchema.required(),
});

const updateOneShotSchema = Joi.object({
  shot: shotSchema.required(),
});

export { shotSchema, shotsSchema, updateShotsSchema, updateOneShotSchema };
