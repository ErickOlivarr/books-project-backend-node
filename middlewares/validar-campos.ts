import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

const validarCampos = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({
            ok: false,
            error: errors.mapped()
        });
    }

    next();
};

export default validarCampos;