// import Ajv, { JSONSchemaType } from 'ajv';
import Ajv from 'ajv';
import { RequestHandler } from 'express';

const ajv = new Ajv();

// export const validate: <T extends object>(schema: JSONSchemaType<T>) => RequestHandler = (schema) => {
export const validateBody: (schema: object) => RequestHandler = (schema) => {
    const validate = ajv.compile(schema);

    return (req, res, next) => {
        console.log(`${req.path} body:`, req.body);
        if(!validate(req.body)) {
            res.status(400).send({ error: 'Invalid payload.', errorData: validate.errors });
            return;
        }

        next();
    };
};
