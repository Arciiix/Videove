import { Response } from "express";
import Joi from "joi";

async function validate(
  schema: Joi.ObjectSchema,
  body: any,
  res: Response
): Promise<any> {
  try {
    const validate = await schema.validateAsync(body);
    return validate;
  } catch (err) {
    if (err instanceof Joi.ValidationError) {
      res
        .status(400)
        .send({ success: false, error: err?.details?.[0]?.message });
    }
  }
}

export default validate;
