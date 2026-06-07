import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import { IAuditService } from "../../Domain/services/Audit/IAuditService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { ValidationResult } from "../../Domain/types/ValidationResult";
import { validateLogin } from "../validators/auth/validateLogin";
import { validateRegister } from "../validators/auth/validateRegister";

export class AuthController {
  private readonly router = Router();

  public constructor(
    private readonly authService: IAuthService,
    private readonly auditService: IAuditService,
  ) {
    this.router.post("/auth/login",    this.login.bind(this));
    this.router.post("/auth/register", this.register.bind(this));
    this.router.post("/auth/logout",   authenticate, this.logout.bind(this));
  }

  private async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body as { username?: string; password?: string };
    const v: ValidationResult = validateLogin(username ?? "", password ?? "");
    if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
    const result = await this.authService.login(username!, password!);
    if (result.id === 0) { res.status(401).json({ success: false, message: "Invalid username or password" }); return; }
    const token = jwt.sign(
      { id: result.id, username: result.username, role: result.role },
      process.env.JWT_SECRET ?? "",
      { expiresIn: "24h" }
    );
    await this.auditService.log("LOGIN", result.id, "user", result.id, null, req.ip ?? null);
    res.status(200).json({ success: true, message: "Login successful", data: token });
  }

  private async register(req: Request, res: Response): Promise<void> {
    const body = req.body as {
      username?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      role?: string;
      bio?: string | null;
      profileImage?: string | null;
    };
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = typeof body.role === "string" ? body.role : "user";
    const bio = typeof body.bio === "string" && body.bio.trim() !== "" ? body.bio.trim() : null;
    const profileImage = typeof body.profileImage === "string" && body.profileImage.trim() !== "" ? body.profileImage : null;
    const v: ValidationResult = validateRegister(username, firstName, lastName, email, password, bio, profileImage);
    if (!v.valid) { res.status(400).json({ success: false, message: v.message }); return; }
    const result = await this.authService.register({ username, firstName, lastName, email, password, role, bio, profileImage });
    if (result.id === 0) { res.status(409).json({ success: false, message: "Username or email already taken" }); return; }
    const token = jwt.sign(
      { id: result.id, username: result.username, role: result.role },
      process.env.JWT_SECRET ?? "",
      { expiresIn: "24h" }
    );
    await this.auditService.log("REGISTER", result.id, "user", result.id, null, req.ip ?? null);
    res.status(201).json({ success: true, message: "Registration successful", data: token });
  }

  private async logout(req: Request, res: Response): Promise<void> {
    await this.auditService.log("LOGOUT", req.user?.id ?? null, "user", req.user?.id ?? null, null, req.ip ?? null);
    res.status(200).json({ success: true, message: "Logged out" });
  }

  public getRouter(): Router { return this.router; }
}
