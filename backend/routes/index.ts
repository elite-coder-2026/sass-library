import type { RouterLike } from "./router.types";
import { registerBookingsRoutes } from "./bookings.routes";
import { registerRidesRoutes } from "./rides.routes";
import { registerStylistsRoutes } from "./stylists.routes";
import { registerUsersRoutes } from "./users.routes";

export function registerRoutes(router: RouterLike) {
  registerUsersRoutes(router);
  registerStylistsRoutes(router);
  registerBookingsRoutes(router);
  registerRidesRoutes(router);
}

// @ts-ignore