import {
  usersCreate,
  usersDelete,
  usersGetByEmail,
  usersGetById,
  usersGetByUsername,
  usersList,
  usersUpdate
} from "../controllers/users.controller";
import type { RouterLike } from "./router.types";

export function registerUsersRoutes(router: RouterLike) {
  router.get("/users", usersList);
  router.get("/users/by-email", usersGetByEmail);
  router.get("/users/by-username", usersGetByUsername);
  router.get("/users/:id", usersGetById);
  router.post("/users", usersCreate);
  router.patch("/users/:id", usersUpdate);
  router.delete("/users/:id", usersDelete);
}

