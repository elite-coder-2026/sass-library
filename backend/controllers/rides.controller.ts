import { createRide, deleteRide, getRideById, listRides, updateRide } from "../services/rides.service";
import { getOptionalNumber, getString, isObject, parseId, type NextLike, type RequestLike, type ResponseLike } from "../utility/http";

function parseOptionalId(raw: string | undefined): number | null {
  if (!raw) return null;
  return parseId(raw);
}

export async function ridesList(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const limit = getOptionalNumber(req.query?.limit ?? undefined) ?? undefined;
    const offset = getOptionalNumber(req.query?.offset ?? undefined) ?? undefined;
    const userId = parseOptionalId(req.query?.userId);
    const bookingId = parseOptionalId(req.query?.bookingId);
    const status = req.query?.status?.trim() || undefined;

    const rides = await listRides({ limit, offset, userId: userId ?? undefined, bookingId: bookingId ?? undefined, status });
    res.json({ rides });
  } catch (err) {
    next(err);
  }
}

export async function ridesGetById(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const ride = await getRideById(id);
    if (!ride) return res.status(404).json({ error: "not found" });

    res.json({ ride });
  } catch (err) {
    next(err);
  }
}

export async function ridesCreate(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    if (!isObject(req.body)) return res.status(400).json({ error: "invalid body" });

    const userIdRaw = req.body.userId ?? req.body.user_id;
    const bookingIdRaw = req.body.bookingId ?? req.body.booking_id;

    const userId = typeof userIdRaw === "number" ? userIdRaw : parseId(getString(userIdRaw) ?? undefined);
    const bookingId =
      bookingIdRaw === undefined || bookingIdRaw === null
        ? null
        : typeof bookingIdRaw === "number"
          ? bookingIdRaw
          : parseId(getString(bookingIdRaw) ?? undefined);

    if (!userId) return res.status(400).json({ error: "userId is required" });
    if (bookingIdRaw !== undefined && bookingIdRaw !== null && !bookingId) return res.status(400).json({ error: "invalid bookingId" });

    const pickupLabel = req.body.pickupLabel !== undefined || req.body.pickup_label !== undefined ? getString(req.body.pickupLabel ?? req.body.pickup_label) : undefined;
    const pickupAddr = req.body.pickupAddr !== undefined || req.body.pickup_addr !== undefined ? getString(req.body.pickupAddr ?? req.body.pickup_addr) : undefined;
    const dropoffLabel = req.body.dropoffLabel !== undefined || req.body.dropoff_label !== undefined ? getString(req.body.dropoffLabel ?? req.body.dropoff_label) : undefined;
    const dropoffAddr = req.body.dropoffAddr !== undefined || req.body.dropoff_addr !== undefined ? getString(req.body.dropoffAddr ?? req.body.dropoff_addr) : undefined;
    const pickupAt = req.body.pickupAt !== undefined || req.body.pickup_at !== undefined ? getString(req.body.pickupAt ?? req.body.pickup_at) : undefined;
    const status = getString(req.body.status) ?? undefined;

    const ride = await createRide({
      userId,
      bookingId,
      pickupLabel: pickupLabel ?? null,
      pickupAddr: pickupAddr ?? null,
      dropoffLabel: dropoffLabel ?? null,
      dropoffAddr: dropoffAddr ?? null,
      pickupAt: pickupAt ?? null,
      status
    });

    res.status(201).json({ ride });
  } catch (err) {
    next(err);
  }
}

export async function ridesUpdate(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!isObject(req.body)) return res.status(400).json({ error: "invalid body" });

    const userIdRaw = req.body.userId ?? req.body.user_id;
    const bookingIdRaw = req.body.bookingId ?? req.body.booking_id;

    const patch = {
      userId:
        userIdRaw !== undefined
          ? typeof userIdRaw === "number"
            ? userIdRaw
            : parseId(getString(userIdRaw) ?? undefined) ?? undefined
          : undefined,
      bookingId:
        bookingIdRaw !== undefined
          ? bookingIdRaw === null
            ? null
            : typeof bookingIdRaw === "number"
              ? bookingIdRaw
              : parseId(getString(bookingIdRaw) ?? undefined) ?? undefined
          : undefined,
      pickupLabel: req.body.pickupLabel !== undefined || req.body.pickup_label !== undefined ? getString(req.body.pickupLabel ?? req.body.pickup_label) : undefined,
      pickupAddr: req.body.pickupAddr !== undefined || req.body.pickup_addr !== undefined ? getString(req.body.pickupAddr ?? req.body.pickup_addr) : undefined,
      dropoffLabel: req.body.dropoffLabel !== undefined || req.body.dropoff_label !== undefined ? getString(req.body.dropoffLabel ?? req.body.dropoff_label) : undefined,
      dropoffAddr: req.body.dropoffAddr !== undefined || req.body.dropoff_addr !== undefined ? getString(req.body.dropoffAddr ?? req.body.dropoff_addr) : undefined,
      pickupAt: req.body.pickupAt !== undefined || req.body.pickup_at !== undefined ? getString(req.body.pickupAt ?? req.body.pickup_at) : undefined,
      status: req.body.status !== undefined ? getString(req.body.status) ?? undefined : undefined
    };

    const ride = await updateRide(id, patch);
    if (!ride) return res.status(404).json({ error: "not found" });

    res.json({ ride });
  } catch (err) {
    next(err);
  }
}

export async function ridesDelete(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const ok = await deleteRide(id);
    if (!ok) return res.status(404).json({ error: "not found" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

