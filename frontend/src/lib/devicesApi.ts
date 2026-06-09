export interface Dispositivo {
  id: number;
  usuario_cedula: string;
  nombre: string;
  modelo: string;
  device_id: string;
  consumo: number;
}

const API_BASE = "http://localhost:3000/api/dispositivos";

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw data && data.error ? new Error(data.error) : new Error(res.statusText);
    return data as T;
  } catch (err) {
    if (err instanceof SyntaxError) {
      // non-JSON response
      if (!res.ok) throw new Error(res.statusText || "Error en la respuesta del servidor");
      // @ts-ignore
      return text as T;
    }
    throw err;
  }
}

/** Obtener dispositivos de un usuario */
export async function getDevices(usuarioCedula: string): Promise<Dispositivo[]> {
  const url = `${API_BASE}?usuario=${encodeURIComponent(usuarioCedula)}`;
  const res = await fetch(url, { method: "GET" });
  return handleResponse<Dispositivo[]>(res);
}

/** Crear un nuevo dispositivo para el usuario */
export async function createDevice(payload: { nombre: string; modelo: string; device_id: string; usuario_cedula?: string; }): Promise<Dispositivo> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Dispositivo>(res);
}

/** Actualizar dispositivo existente */
export async function updateDevice(id: number, payload: { nombre?: string; modelo?: string; device_id?: string; }): Promise<Dispositivo> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Dispositivo>(res);
}

/** Eliminar dispositivo por id */
export async function deleteDevice(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  await handleResponse<any>(res);
}

/** Actualizar consumo del dispositivo */
export async function updateConsumption(id: number, consumo: number): Promise<{ success: boolean; consumo: number }> {
  const res = await fetch(`${API_BASE}/${id}/consumo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consumo }),
  });
  return handleResponse<{ success: boolean; consumo: number }>(res);
}

/** Obtener consumo actual total de todos los dispositivos del usuario */
export async function getCurrentConsumption(usuarioCedula: string): Promise<{ total_consumo: number }> {
  const url = `${API_BASE}/consumo-actual?usuario=${encodeURIComponent(usuarioCedula)}`;
  const res = await fetch(url, { method: "GET" });
  return handleResponse<{ total_consumo: number }>(res);
}

export default {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  updateConsumption,
  getCurrentConsumption,
};
