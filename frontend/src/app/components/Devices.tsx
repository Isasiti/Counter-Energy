import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Wind,
  Tv,
  Coffee,
  Wifi,
  Speaker,
  Power,
  Search,
  Trash2,
  Plus,
  Pencil,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { getDevices, createDevice, updateDevice, deleteDevice as apiDeleteDevice, updateConsumption } from "../../lib/devicesApi";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const API_BASE = "http://localhost:3000/api/dispositivos";
const POWER_MULTIPLIER = 1; // Multiplicador para convertir potencia a consumo
const UPDATE_INTERVAL = 5000; // 10 segundos

interface Dispositivo {
  id: number;
  usuario_cedula: string;
  nombre: string;
  modelo: string;
  device_id: string;
  consumo: number;
}

type DispositivoForm = {
  nombre: string;
  modelo: string;
  device_id: string;
};

const emptyForm: DispositivoForm = { nombre: "", modelo: "", device_id: "" };

const iconByModelo: Record<string, LucideIcon> = {
  light: Lightbulb,
  hvac: Wind,
  media: Tv,
  appliance: Coffee,
  network: Wifi,
  speaker: Speaker,
};

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

function getIcon(modelo: string): LucideIcon {
  const key = modelo.toLowerCase().trim();
  return iconByModelo[key] ?? Lightbulb;
}

export function Devices() {
  const usuarioCedula = localStorage.getItem("usuarioCedula") || "";
  const [devices, setDevices] = useState<Dispositivo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceStatuses, setDeviceStatuses] = useState<Record<number, boolean | null>>({});
  const [deviceConsumptions, setDeviceConsumptions] = useState<Record<number, number>>({});
  const [totalConsumption, setTotalConsumption] = useState<number>(0);
  const [controllingId, setControllingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DispositivoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [co2Message, setCo2Message] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  // Actualizar consumo cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllConsumptions();
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [devices]);

  const fetchDeviceStatus = async (dbId: number) => {
    try {
      const response = await fetch(`${API_BASE}/${dbId}/status`);
      if (!response.ok) return;
      const data = await response.json();
      setDeviceStatuses((prev) => ({ ...prev, [dbId]: data.status }));
      
      // Calcular consumo = potencia * POWER_MULTIPLIER
      if (data.potencia !== undefined && data.potencia !== null) {
        const consumo = data.potencia * POWER_MULTIPLIER;
        setDeviceConsumptions((prev) => ({ ...prev, [dbId]: consumo }));
        
        // Guardar en BD
        try {
          await updateConsumption(dbId, consumo);
        } catch (err) {
          console.error(`Error guardando consumo para dispositivo ${dbId}:`, err);
        }
      }
    } catch {
      setDeviceStatuses((prev) => ({ ...prev, [dbId]: null }));
    }
  };

  const fetchAllConsumptions = async () => {
    try {
      if (devices.length === 0) return;
      
      devices.forEach((device) => {
        fetchDeviceStatus(device.id);
      });
      
      // Calcular total
      const total = devices.reduce((sum, device) => {
        return sum + (deviceConsumptions[device.id] || 0);
      }, 0);
      setTotalConsumption(total);
    } catch (err) {
      console.error("Error actualizando consumos:", err);
    }
  };

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: Dispositivo[] = await getDevices(usuarioCedula);
      setDevices(data);
      
      // Cargar consumos iniciales
      data.forEach((d) => {
        fetchDeviceStatus(d.id);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const controlDevice = async (dbId: number, action: boolean) => {
    setControllingId(dbId);
    try {
      const response = await fetch(`${API_BASE}/${dbId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (result.success) {
        setDeviceStatuses((prev) => ({ ...prev, [dbId]: action }));
        if (!action && result.saved) {
          setCo2Message(
            `Ahorro CO₂: ${result.saved.co2Kg.toFixed(3)} kg · Equivale a ${result.saved.trees} árboles/año`
          );
        } else {
          setCo2Message(null);
        }
      } else {
        alert(result.error || "Error al controlar el dispositivo");
      }
    } catch (err) {
      console.error("Error controlling device:", err);
      alert("Error al controlar el dispositivo");
    } finally {
      setControllingId(null);
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (device: Dispositivo) => {
    setEditingId(device.id);
    setForm({
      nombre: device.nombre,
      modelo: device.modelo,
      device_id: device.device_id,
    });
    setDialogOpen(true);
  };

  const saveDevice = async () => {
    if (!form.nombre.trim() || !form.modelo.trim() || !form.device_id.trim()) {
      alert("Completa nombre, modelo e ID del dispositivo");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateDevice(editingId, form);
      } else {
        await createDevice({ ...form, usuario_cedula: usuarioCedula });
      }
      setDialogOpen(false);
      await fetchDevices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const deleteDevice = async (id: number) => {
    if (!window.confirm("¿Eliminar este dispositivo para siempre?")) {
      return;
    }
    try {
      await apiDeleteDevice(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
      setCo2Message(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const filteredDevices = devices.filter(
    (dev) =>
      dev.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.device_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tus Dispositivos</h2>
          <p className="text-slate-500 mt-1">
            Usuario: {usuarioCedula || "—"} · Control vía Tuya OpenAPI
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
            <span>⚡</span>
            <span>Consumo Total: <strong>{totalConsumption.toFixed(2)}</strong> (actualizado cada 10s)</span>
          </div>
          {co2Message ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 ml-3">
              <span>🌿</span>
              <span>{co2Message}</span>
            </div>
          ) : null}
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full md:w-64 transition-all"
            />
          </div>
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDevices.map((device) => {
            const Icon = getIcon(device.modelo);
            const status = deviceStatuses[device.id];
            const isControlling = controllingId === device.id;
            return (
              <div
                key={device.id}
                className={cn(
                  "p-5 rounded-2xl border flex flex-col transition-all",
                  status
                    ? "bg-white border-emerald-200 shadow-sm shadow-emerald-100/50"
                    : "bg-slate-50 border-slate-200"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      status ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-md",
                      status === null
                        ? "text-slate-400 bg-slate-100"
                        : status
                          ? "text-emerald-700 bg-emerald-100"
                          : "text-slate-500 bg-slate-200"
                    )}
                  >
                    {status === null ? "..." : status ? "Encendido" : "Apagado"}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-800 truncate">{device.nombre}</h3>
                <p className="text-sm text-slate-500 mt-1">Modelo: {device.modelo}</p>
                <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold">Consumo Actual</p>
                  <p className="text-lg font-bold text-blue-800">{(deviceConsumptions[device.id] || 0).toFixed(2)}</p>
                  <p className="text-xs text-blue-600">Potencia </p>
                </div>
                <p className="text-xs text-slate-400 mt-2 truncate" title={device.device_id}>
                  ID: {device.device_id}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => controlDevice(device.id, true)}
                    disabled={isControlling || status === true}
                    className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isControlling ? "..." : "Encender"}
                  </button>
                  <button
                    onClick={() => controlDevice(device.id, false)}
                    disabled={isControlling || status === false}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isControlling ? "..." : "Apagar"}
                  </button>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={() => openEditDialog(device)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => deleteDevice(device.id)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-700 border border-rose-200 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredDevices.length === 0 && !error && (
        <div className="text-center py-12 text-slate-500">
          <Power className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-lg font-medium">No hay dispositivos</p>
          <p className="text-sm">Agrega uno con nombre e ID</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar dispositivo" : "Nuevo dispositivo"}
            </DialogTitle>
            <DialogDescription>
              Registra el nombre, modelo e ID del dispositivo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Ej. Luces Salón"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Modelo
              </label>
              <input
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Ej. light, network, hvac"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ID del dispositivo
              </label>
              <input
                value={form.device_id}
                onChange={(e) => setForm({ ...form, device_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Ej. eb75ec2d3c87628087qmaa"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={saveDevice}
              disabled={saving}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Guardar cambios" : "Crear"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
