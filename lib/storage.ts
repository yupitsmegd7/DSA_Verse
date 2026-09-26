"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { initialStudio, studioSchema, applyAction } from "./state";
import type { Studio } from "./curriculum";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
let supabase: SupabaseClient | null = null;
export const cloudConfigured = !!(url && key);
export function cloud() {
  if (!cloudConfigured) return null;
  return (supabase ??= createClient(url!, key!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }));
}
function db() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("dsa-verse", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("workspace");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () =>
      reject(
        new Error(
          "Device storage is unavailable. Try a regular browser window.",
        ),
      );
  });
}
async function localRead(): Promise<Studio> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const tx = d.transaction("workspace");
    const r = tx.objectStore("workspace").get("studio");
    r.onsuccess = () => {
      try {
        resolve(r.result ? studioSchema.parse(r.result) : initialStudio());
      } catch {
        reject(
          new Error(
            "This saved workspace could not be read. Restore a valid backup.",
          ),
        );
      }
    };
    r.onerror = () => reject(r.error);
    tx.oncomplete = () => d.close();
  });
}
async function localWrite(data: Studio) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction("workspace", "readwrite");
    tx.objectStore("workspace").put(data, "studio");
    tx.oncomplete = () => {
      d.close();
      resolve();
    };
    tx.onerror = () => {
      d.close();
      reject(
        new Error(
          "Could not save to this device. Export a backup and try again.",
        ),
      );
    };
  });
}
export type StorageMode = "choose" | "device" | "cloud";
export async function loadWorkspace(): Promise<{
  data: Studio;
  mode: StorageMode;
  email?: string;
}> {
  const c = cloud();
  if (c) {
    const {
      data: { session },
      error,
    } = await c.auth.getSession();
    if (error) throw error;
    if (session) {
      const { data, error } = await c
        .from("learning_workspaces")
        .select("data")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (error)
        throw new Error(
          "Cloud progress could not be loaded. Check the database setup; your device copy is untouched.",
        );
      return {
        data: data ? studioSchema.parse(data.data) : initialStudio(),
        mode: "cloud",
        email: session.user.email,
      };
    }
  }
  const selected = localStorage.getItem("dsa-workspace-mode");
  if (selected !== "device") return { data: initialStudio(), mode: "choose" };
  return { data: await localRead(), mode: "device" };
}
export async function chooseDevice() {
  localStorage.setItem("dsa-workspace-mode", "device");
  return await loadWorkspace();
}
export async function saveWorkspace(
  action: Record<string, unknown>,
  mode: StorageMode,
) {
  if (mode === "choose")
    throw new Error("Choose where to save your progress first.");
  if (mode === "device") {
    const run = async () => {
      const { data, result } = applyAction(await localRead(), action);
      await localWrite(data);
      return { ...data, result };
    };
    if (navigator.locks)
      return navigator.locks.request("dsa-workspace-write", run);
    return run();
  }
  const c = cloud();
  if (!c) throw new Error("Cloud sync is not configured.");
  const {
    data: { user },
    error: authError,
  } = await c.auth.getUser();
  if (authError || !user)
    throw new Error("Sign in again to save your cloud progress.");
  for (let tries = 0; tries < 3; tries++) {
    const { data: row, error } = await c
      .from("learning_workspaces")
      .select("data,version")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    const { data, result } = applyAction(
      row ? studioSchema.parse(row.data) : initialStudio(),
      action,
    );
    if (!row) {
      const { error: e } = await c
        .from("learning_workspaces")
        .insert({ user_id: user.id, data, version: 1 });
      if (!e) return { ...data, result };
      if (e.code === "23505") continue;
      throw e;
    }
    const { data: updated, error: e } = await c
      .from("learning_workspaces")
      .update({
        data,
        version: row.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("version", row.version)
      .select("version");
    if (e) throw e;
    if (updated?.length) return { ...data, result };
  }
  throw new Error("Another tab updated your progress. Reload and try again.");
}
export function downloadText(
  filename: string,
  text: string,
  type = "text/plain",
) {
  const object = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = object;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(object), 1000);
}
