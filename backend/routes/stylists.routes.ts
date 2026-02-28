import {
  stylistsCreate,
  stylistsDelete,
  stylistsGetByEmail,
  stylistsGetById,
  stylistsList,
  stylistsUpdate
} from "../controllers/stylists.controller";
import type { RouterLike } from "./router.types";

export function registerStylistsRoutes(router: RouterLike) {
  router.get("/stylists", stylistsList);
  router.get("/stylists/by-email", stylistsGetByEmail);
  router.get("/stylists/:id", stylistsGetById);
  router.post("/stylists", stylistsCreate);
  router.patch("/stylists/:id", stylistsUpdate);
  router.delete("/stylists/:id", stylistsDelete);
}

