import { Project, Equipment, ProjectData, ProjectCalculations } from "../types";
import { initFirebase } from "./firebase";
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";

const fb = initFirebase();

export async function listProjects(): Promise<Project[]> {
  if (!fb) {
    const res = await fetch("/api/projects");
    return res.json();
  }
  const snap = await getDocs(collection(fb.db, "projects"));
  return snap.docs.map(d => d.data() as Project).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export async function getProject(id: string): Promise<Project> {
  if (!fb) {
    const res = await fetch(`/api/projects/${id}`);
    return res.json();
  }
  const ref = doc(fb.db, "projects", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Project not found");
  return snap.data() as Project;
}

export async function saveProject(payload: { id?: string; clientId: string; status: Project["status"]; data: ProjectData; calculations: ProjectCalculations | null; }): Promise<string> {
  const id = payload.id || `PRJ-${Date.now()}`;
  const record: Project = {
    id,
    clientId: payload.clientId,
    status: payload.status,
    data: payload.data,
    calculations: payload.calculations as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (!fb) {
    await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
    return id;
  }
  await setDoc(doc(fb.db, "projects", id), { ...record, updatedAt: serverTimestamp() } as any);
  return id;
}

export async function updateProject(id: string, changes: Partial<Project>): Promise<void> {
  if (!fb) {
    await fetch(`/api/projects/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
    return;
  }
  await updateDoc(doc(fb.db, "projects", id), { ...changes, updatedAt: serverTimestamp() } as any);
}

export async function deleteProject(id: string): Promise<void> {
  if (!fb) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    return;
  }
  await deleteDoc(doc(fb.db, "projects", id));
}

export async function listEquipment(): Promise<Equipment[]> {
  if (!fb) {
    const res = await fetch("/api/equipment");
    return res.json();
  }
  const snap = await getDocs(collection(fb.db, "equipment_catalog"));
  return snap.docs.map(d => d.data() as Equipment);
}

export async function saveEquipment(item: Omit<Equipment, "id"> & { id?: string }): Promise<string> {
  const id = item.id || `EQ-${Date.now()}`;
  const record: Equipment = { ...item, id, updatedAt: new Date().toISOString() } as any;
  if (!fb) {
    const res = await fetch("/api/equipment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
    const data = await res.json();
    return data.id || id;
  }
  await setDoc(doc(fb.db, "equipment_catalog", id), { ...record, updatedAt: serverTimestamp() } as any);
  return id;
}

export async function updateEquipment(id: string, changes: Partial<Equipment>): Promise<void> {
  if (!fb) {
    await fetch(`/api/equipment/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
    return;
  }
  await updateDoc(doc(fb.db, "equipment_catalog", id), { ...changes, updatedAt: serverTimestamp() } as any);
}

export async function deleteEquipment(id: string): Promise<void> {
  if (!fb) {
    await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    return;
  }
  await deleteDoc(doc(fb.db, "equipment_catalog", id));
}
