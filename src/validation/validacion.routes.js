import { check } from 'express-validator';
import empty from 'is-empty';
import { validateResult } from '../helper/validateHelper';



/**
 * EJEMPLO
 */

 export const save_user = [
    check("user_id").exists().not().isEmpty().isString(),
    check("id_conversacion").exists().not().isEmpty().isString(),
    check("estado").exists().not().isEmpty().isString(),
    check("channelInfo").isObject()
    .custom((value, {req})=>{
        const { path } = value;
        if (!empty(path)){
            return true
        }else{
            throw new Error("la peticion no cumple los requisitos en el value channelInfo:{path:'http://conecto:port/ruta'}")
        }
    }),
    (req, res, next) => {
        validateResult(req, res, next);
    },
]

export const login = [
    check("usuario").exists().not().isEmpty().isString(),
    check("password").exists().not().isEmpty().isString(),
    (req, res, next) => {
        validateResult(req, res, next);
    },
]