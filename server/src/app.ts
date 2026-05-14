import "dotenv/config";
import express from "express";
import cors from "cors";

import { ConsoleLoggerService } from "./Services/logger/ConsoleLoggerService";
import { DbManager } from "./Database/connection/DbConnectionPool";

import { UserRepository }   from "./Database/repositories/users/UserRepository";
import { EntityRepository } from "./Database/repositories/entity/EntityRepository";
import { CommunityRepository } from "./Database/repositories/communities/CommunityRepository";
import { TagRepository } from "./Database/repositories/Tag/TagRepository"; 
import { PostRepository } from "./Database/repositories/Post/PostRepository"; 

import { AuthService }   from "./Services/auth/AuthService";
import { UserService }   from "./Services/users/UserService";
import { EntityService } from "./Services/entity/EntityService";
import { CommunityService } from "./Services/communities/CommunityService";
import { TagService } from "./Services/Tag/TagServices"; 
import { PostService } from "./Services/Post/PostServices"; 

import { AuthController }   from "./WebAPI/controllers/AuthController";
import { UserController }   from "./WebAPI/controllers/UserController";
import { EntityController } from "./WebAPI/controllers/EntityController";
import { CommunityController } from "./WebAPI/controllers/CommunityController";
import { TagController } from "./WebAPI/controllers/TagController"; 
import { PostController } from "./WebAPI/controllers/PostController"; 

export const logger = new ConsoleLoggerService();
export const db     = new DbManager(logger);

// Repositories
const userRepo   = new UserRepository(db, logger);
const entityRepo = new EntityRepository(db, logger);
const communityRepo = new CommunityRepository(db, logger);
const tagRepo = new TagRepository(db, logger);  
const postRepo = new PostRepository(db, logger); 

// Services
const authService   = new AuthService(userRepo);
const userService   = new UserService(userRepo);
const entityService = new EntityService(entityRepo);
const communityService = new CommunityService(communityRepo);
const tagService = new TagService(tagRepo); 
const postService = new PostService(postRepo, communityRepo); 

// Express
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json());

app.use("/api/v1", new AuthController(authService).getRouter());
app.use("/api/v1", new UserController(userService).getRouter());
app.use("/api/v1", new EntityController(entityService).getRouter());
app.use("/api/v1", new CommunityController(communityService).getRouter());
app.use("/api/v1", new TagController(tagService).getRouter()); 
app.use("/api/v1", new PostController(postService).getRouter()); 

export default app;
