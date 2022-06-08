import Joi from "joi";

const addProjectSchema = Joi.object({
  name: Joi.string().required(),
  media: Joi.array().items(
    Joi.object({
      color: Joi.string()
        .regex(/^#[A-Fa-f0-9]{6}/)
        .default("#808080"),
      name: Joi.string(),
      type: Joi.string()
        .regex(/LOCAL|DROIDCAM|CUSTOM/)
        .required(),
      media: Joi.object(),
    })
  ),
});

export { addProjectSchema };
