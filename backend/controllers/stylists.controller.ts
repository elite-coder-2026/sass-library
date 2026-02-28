import {
  createStylist,
  deleteStylist,
  getStylistByEmail,
  getStylistById,
  listStylists,
  searchStylists,
  updateStylist
} from "../services/stylists.service";
import { getOptionalNumber, getString, isObject, parseId, type NextLike, type RequestLike, type ResponseLike } from "../utility/http";

export async function stylistsList(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const q = req.query?.q?.trim();
    const limit = getOptionalNumber(req.query?.limit ?? undefined) ?? undefined;
    const offset = getOptionalNumber(req.query?.offset ?? undefined) ?? undefined;

    const stylists = q ? await searchStylists({ q, limit }) : await listStylists({ limit, offset });
    res.json({ stylists });
  } catch (err) {
    next(err);
  }
}

export async function stylistsGetById(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const stylist = await getStylistById(id);
    if (!stylist) return res.status(404).json({ error: "not found" });

    res.json({ stylist });
  } catch (err) {
    next(err);
  }
}

export async function stylistsGetByEmail(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const email = req.query?.email?.trim();
    if (!email) return res.status(400).json({ error: "email is required" });

    const stylist = await getStylistByEmail(email);
    if (!stylist) return res.status(404).json({ error: "not found" });

    res.json({ stylist });
  } catch (err) {
    next(err);
  }
}

export async function stylistsCreate(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    if (!isObject(req.body)) return res.status(400).json({ error: "invalid body" });

    const email = getString(req.body.email);
    const name = getString(req.body.name);
    if (!email) return res.status(400).json({ error: "email is required" });
    if (!name) return res.status(400).json({ error: "name is required" });

    const bio = getString(req.body.bio) ?? null;
    const stylist = await createStylist({ email, name, bio });
    res.status(201).json({ stylist });
  } catch (err) {
    next(err);
  }
}

export async function stylistsUpdate(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!isObject(req.body)) return res.status(400).json({ error: "invalid body" });

    const patch = {
      email: req.body.email !== undefined ? getString(req.body.email) : undefined,
      name: req.body.name !== undefined ? getString(req.body.name) : undefined,
      bio: req.body.bio !== undefined ? getString(req.body.bio) : undefined
    };

    const stylist = await updateStylist(id, patch);
    if (!stylist) return res.status(404).json({ error: "not found" });

    res.json({ stylist });
  } catch (err) {
    next(err);
  }
}

export async function stylistsDelete(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const ok = await deleteStylist(id);
    if (!ok) return res.status(404).json({ error: "not found" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

