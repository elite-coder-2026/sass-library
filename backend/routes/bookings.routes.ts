import {
  bookingsCreate,
  bookingsDelete,
  bookingsGetById,
  bookingsList,
  bookingsUpdate
} from "../controllers/bookings.controller";
import type { RouterLike } from "./router.types";

export function registerBookingsRoutes(router: RouterLike) {
  router.get("/bookings", bookingsList);
  router.get("/bookings/:id", bookingsGetById);
  router.post("/bookings", bookingsCreate);
  router.patch("/bookings/:id", bookingsUpdate);
  router.delete("/bookings/:id", bookingsDelete);
}

