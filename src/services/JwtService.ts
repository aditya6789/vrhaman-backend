import { JWT_SECERT } from "../config/index";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

class JwtService {
  static sign(
    payload: string | object | Buffer,
    expiry: string = "30d",
    secret: string = JWT_SECERT ?? "thisismysecert"
  ): string {
    const options: SignOptions = { expiresIn: expiry };
    return jwt.sign(payload, secret, options);
  }

  static verify<T extends JwtPayload | string>(
    token: string,
    secret: string = JWT_SECERT ?? "thisismysecert"
  ): T {
    return jwt.verify(token, secret) as T;
  }
}

export default JwtService;
