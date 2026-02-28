import {
  createBooking,
  deleteBooking,
  getBookingById,
  listBookings,
  updateBooking
} from "../services/bookings.service";
import { getOptionalNumber, getString, isObject, parseId, type NextLike, type RequestLike, type ResponseLike } from "../utility/http";

function parseOptionalId(raw: string | undefined): number | null {
  if (!raw) return null;
  return parseId(raw);
}

export async function bookingsList(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const limit = getOptionalNumber(req.query?.limit ?? undefined) ?? undefined;
    const offset = getOptionalNumber(req.query?.offset ?? undefined) ?? undefined;
    const userId = parseOptionalId(req.query?.userId);
    const stylistId = parseOptionalId(req.query?.stylistId);
    const status = req.query?.status?.trim() || undefined;

    const bookings = await listBookings({ limit, offset, userId: userId ?? undefined, stylistId: stylistId ?? undefined, status });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

export async function bookingsGetById(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const booking = await getBookingById(id);
    if (!booking) return res.status(404).json({ error: "not found" });

    res.json({ booking });
  } catch (err) {
    next(err);
  }
}

export async function bookingsCreate(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    if (!isObject(req.body)) return res.status(400).json({ error: "invalid body" });

    const userIdRaw = req.body.userId ?? req.body.user_id;
    const stylistIdRaw = req.body.stylistId ?? req.body.stylist_id;

    const userId = typeof userIdRaw === "number" ? userIdRaw : parseId(getString(userIdRaw) ?? undefined);
    const stylistId = typeof stylistIdRaw === "number" ? stylistIdRaw : parseId(getString(stylistIdRaw) ?? undefined);

    const startsAt = getString(req.body.startsAt ?? req.body.starts_at);
    const endsAt = getString(req.body.endsAt ?? req.body.ends_at);
    const status = getString(req.body.status) ?? undefined;
    const notes = req.body.notes !== undefined ? getString(req.body.notes) : undefined;

    if (!userId) return res.status(400).json({ error: "userId is required" });
    if (!stylistId) return res.status(400).json({ error: "stylistId is required" });
    if (!startsAt) return res.status(400).json({ error: "startsAt is required" });
    if (!endsAt) return res.status(400).json({ error: "endsAt is required" });

    const booking = await createBooking({ userId, stylistId, startsAt, endsAt, status, notes: notes ?? null });
    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
}

export async function bookingsUpdate(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!isObject(req.body)) return res.status(400).json({ error: "invalid body" });

    const userIdRaw = req.body.userId ?? req.body.user_id;
    const stylistIdRaw = req.body.stylistId ?? req.body.stylist_id;

    const patch = {
      userId:
        userIdRaw !== undefined
          ? typeof userIdRaw === "number"
            ? userIdRaw
            : parseId(getString(userIdRaw) ?? undefined) ?? undefined
          : undefined,
      stylistId:
        stylistIdRaw !== undefined
          ? typeof stylistIdRaw === "number"
            ? stylistIdRaw
            : parseId(getString(stylistIdRaw) ?? undefined) ?? undefined
          : undefined,
      startsAt: req.body.startsAt !== undefined || req.body.starts_at !== undefined ? getString(req.body.startsAt ?? req.body.starts_at) ?? undefined : undefined,
      endsAt: req.body.endsAt !== undefined || req.body.ends_at !== undefined ? getString(req.body.endsAt ?? req.body.ends_at) ?? undefined : undefined,
      status: req.body.status !== undefined ? getString(req.body.status) ?? undefined : undefined,
      notes: req.body.notes !== undefined ? getString(req.body.notes) : undefined
    };

    const booking = await updateBooking(id, patch);
    if (!booking) return res.status(404).json({ error: "not found" });

    res.json({ booking });
  } catch (err) {
    next(err);
  }
}

export async function bookingsDelete(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const ok = await deleteBooking(id);
    if (!ok) return res.status(404).json({ error: "not found" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

