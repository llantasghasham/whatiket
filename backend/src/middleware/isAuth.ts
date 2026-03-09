import { verify, sign } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";

import { getIO } from "../libs/socket";
import ShowUserService from "../services/UserServices/ShowUserService";
import { updateUser } from "../helpers/updateUser";
// import { moment} from "moment-timezone"

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("HIT isAuth | ORIGINAL URL:", req.originalUrl, "| req.query:", JSON.stringify(req.query), "| req.headers.authorization:", req.headers.authorization ?? "MISSING");
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("ERR_SESSION_EXPIRED THROWN FROM isAuth.ts LINE", 26);
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  // const check = await verifyHelper();

  // if (!check) {
  //   throw new AppError("ERR_SYSTEM_INVALID", 401);
  // }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId } = decoded as TokenPayload;

    updateUser(id, companyId);

    req.user = {
      id,
      profile,
      companyId
    };
  } catch (err: any) {
    // Log do erro para debug
    console.error("Auth error:", err.name, err.message);
    
    if (err.name === "TokenExpiredError") {
      // Token expirado, tentar renovar
      try {
        const decoded = verify(token, authConfig.secret, { ignoreExpiration: true });
        const { id, profile, companyId } = decoded as TokenPayload;
        
        // Gerar novo token
        const newToken = sign({ id, profile, companyId }, authConfig.secret, {
          expiresIn: authConfig.expiresIn
        });
        
        // Adicionar novo token no header da resposta
        res.setHeader('x-new-token', newToken);
        
        updateUser(id, companyId);
        
        req.user = {
          id,
          profile,
          companyId
        };
        
        console.log("Token renovado automaticamente");
      } catch (renewError) {
        console.error("Erro ao renovar token:", renewError);
        console.log("ERR_SESSION_EXPIRED THROWN FROM isAuth.ts LINE", 78, "(renewError)");
        throw new AppError("ERR_SESSION_EXPIRED", 401);
      }
    } else if (err.name === "JsonWebTokenError") {
      throw new AppError("ERR_INVALID_TOKEN", 401);
    } else {
      throw new AppError(
        "Invalid token. We'll try to assign a new one on next request",
        403
      );
    }
  }

  return next();
};

export default isAuth;