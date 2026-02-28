import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  listUsers,
  searchUsers,
  updateUser
} from "../services/users.service";

import { getOptionalNumber, getString, isObject, parseId, type NextLike, type RequestLike, type ResponseLike } from "../utility/http";

export async function usersList(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const q = req.query?.q?.trim();
    const limit = getOptionalNumber(req.query?.limit ?? undefined) ?? undefined;
    const offset = getOptionalNumber(req.query?.offset ?? undefined) ?? undefined;

    const users = q ? await searchUsers({ q, limit }) : await listUsers({ limit, offset });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function usersGetById(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: "not found" });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function usersGetByEmail(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const email = req.query?.email?.trim();
    if (!email) return res.status(400).json({ error: "email is required" });

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "not found" });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function usersGetByUsername(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const username = req.query?.username?.trim();
    if (!username) return res.status(400).json({ error: "username is required" });

    const user = await getUserByUsername(username);
    if (!user) return res.status(404).json({ error: "not found" });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function usersCreate(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    if (!isObject(req.body)) return res.status(400).json({ error: "invalid body" });

    const email = getString(req.body.email);
    if (!email) return res.status(400).json({ error: "email is required" });

    const username = getString(req.body.username);
    const displayName = getString(req.body.displayName ?? req.body.display_name);

    const user = await createUser({ email, username, displayName });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function usersUpdate(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!isObject(req.body)) return res.status(400).json({ error: "invalid body" });

    const patch = {
      email: req.body.email !== undefined ? getString(req.body.email) : undefined,
      username: req.body.username !== undefined ? getString(req.body.username) : undefined,
      displayName:
        req.body.displayName !== undefined
          ? getString(req.body.displayName)
          : req.body.display_name !== undefined
            ? getString(req.body.display_name)
            : undefined
    };

    const user = await updateUser(id, patch);
    if (!user) return res.status(404).json({ error: "not found" });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function usersDelete(req: RequestLike, res: ResponseLike, next: NextLike) {
  try {
    const id = parseId(req.params?.id);
    if (!id) return res.status(400).json({ error: "invalid id" });

    const ok = await deleteUser(id);
    if (!ok) return res.status(404).json({ error: "not found" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
