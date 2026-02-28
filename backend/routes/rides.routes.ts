import { ridesCreate, ridesDelete, ridesGetById, ridesList, ridesUpdate } from "../controllers/rides.controller";
import type { RouterLike } from "./router.types";

export function registerRidesRoutes(router: RouterLike) {
  router.get("/rides", ridesList);
  router.get("/rides/:id", ridesGetById);
  router.post("/rides", ridesCreate);
  router.patch("/rides/:id", ridesUpdate);
  router.delete("/rides/:id", ridesDelete);
}

