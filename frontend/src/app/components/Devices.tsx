import { useState } from "react";
import { 
  Lightbulb, 
  Wind, 
  Tv, 
  Coffee, 
  Wifi, 
  Speaker,
  Power,
  Search,
  Filter,
  Zap,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const initialDevices = [
  { id: 1, name: "Luces Salón", type: "light", icon: Lightbulb, isOn: true, power: "45W", location: "Salón", consumptionLimit: 50 },
  { id: 2, name: "Aire Acondicionado", type: "hvac", icon: Wind, isOn: false, power: "1.2kW", location: "Dormitorio", consumptionLimit: 1500 },
  { id: 3, name: "Smart TV", type: "media", icon: Tv, isOn: true, power: "120W", location: "Salón", consumptionLimit: 100 },
  { id: 4, name: "Cafetera", type: "appliance", icon: Coffee, isOn: false, power: "800W", location: "Cocina", consumptionLimit: 700 },
  { id: 5, name: "Router WiFi", type: "network", icon: Wifi, isOn: true, power: "15W", location: "Pasillo", consumptionLimit: 20 },
  { id: 6, name: "Altavoz Inteligente", type: "media", icon: Speaker, isOn: true, power: "5W", location: "Salón", consumptionLimit: 10 },
  { id: 7, name: "Luz Pasillo", type: "light", icon: Lightbulb, isOn: false, power: "15W", location: "Pasillo", consumptionLimit: 20 },
  { id: 8, name: "Luz Cocina", type: "light", icon: Lightbulb, isOn: true, power: "30W", location: "Cocina", consumptionLimit: 40 },
];

export function Devices() {
  const [devices, setDevices] = useState(initialDevices);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<typeof initialDevices[0] | null>(null);

  const toggleDevice = (id: number) => {
    setDevices(devices.map(dev => dev.id === id ? { ...dev, isOn: !dev.isOn } : dev));
  };

  const deleteDevice = (id: number) => {
    if (!window.confirm("¿Eliminar este dispositivo para siempre?")) {
      return;
    }
    setDevices(devices.filter(dev => dev.id !== id));
  };

  const parsePower = (power: string) => {
    const match = power.match(/(\d+(?:\.\d+)?)(k?)W/);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    return match[2] === 'k' ? value * 1000 : value;
  };

  const simulateAlert = (device: typeof initialDevices[0]) => {
    setSelectedDevice(device);
    setIsAlertOpen(true);
  };

  const filteredDevices = devices.filter(dev => 
    dev.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    dev.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tus Dispositivos</h2>
          <p className="text-slate-500 mt-1">Controla y monitorea tus sensores y enchufes IoT</p>
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
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">Filtrar</span>
          </button>
        </div>
      </div>

      {/* Global Action Banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
            <Power className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900">Control Maestro</h4>
            <p className="text-sm text-emerald-700">Apaga todos los dispositivos no esenciales</p>
          </div>
        </div>
        <button 
          onClick={() => setDevices(devices.map(d => ({ ...d, isOn: false })))}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap"
        >
          Apagar Todo
        </button>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredDevices.map(device => (
          <div 
            key={device.id} 
            className={cn(
              "p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col",
              device.isOn 
                ? "bg-white border-emerald-200 shadow-sm shadow-emerald-100/50" 
                : "bg-slate-50 border-slate-200"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                device.isOn ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
              )}>
                <device.icon className="w-6 h-6" />
              </div>
              
              {/* Custom Toggle Switch */}
              <button
                onClick={() => toggleDevice(device.id)}
                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors duration-300 ease-in-out cursor-pointer",
                  device.isOn ? "bg-emerald-500" : "bg-slate-300"
                )}
                role="switch"
                aria-checked={device.isOn}
              >
                <div 
                  className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-300 ease-in-out",
                    device.isOn ? "translate-x-[22px]" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            <div className="mt-auto">
              <h3 className={cn(
                "font-bold text-lg mb-1 truncate",
                device.isOn ? "text-slate-800" : "text-slate-500"
              )}>
                {device.name}
              </h3>
              <div className="flex items-center justify-between text-sm mt-3">
                <span className="text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded-md">
                  {device.location}
                </span>
                <span className={cn(
                  "font-semibold flex items-center gap-1",
                  device.isOn ? "text-emerald-600" : "text-slate-400"
                )}>
                  <Zap className="w-3.5 h-3.5" />
                  {device.isOn ? device.power : "0W"}
                </span>
              </div>
              <button
                onClick={() => deleteDevice(device.id)}
                className="mt-4 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-700 border border-rose-200 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
              <button
                onClick={() => simulateAlert(device)}
                className="mt-2 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 border border-amber-200 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Simular Alerta
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDevices.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-lg font-medium">No se encontraron dispositivos</p>
          <p className="text-sm">Intenta con otra búsqueda o filtro</p>
        </div>
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Simulador de Alerta de Consumo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vista previa de cómo se verá la alerta cuando un dispositivo exceda el consumo límite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedDevice && (
            <div className="space-y-6">
              <div className="text-sm text-slate-600">
                <strong>Dispositivo:</strong> {selectedDevice.name} | <strong>Límite:</strong> {selectedDevice.consumptionLimit}W | <strong>Consumo actual:</strong> {selectedDevice.power}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vista Web */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Vista Web</h4>
                  <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-900">¡Alerta de Consumo Excesivo!</h5>
                        <p className="text-sm text-slate-600 mt-1">
                          El dispositivo <strong>{selectedDevice.name}</strong> ha excedido el límite de consumo de {selectedDevice.consumptionLimit}W.
                          Consumo actual: <strong>{selectedDevice.power}</strong>.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700">
                            Ver Detalles
                          </button>
                          <button className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300">
                            Descartar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Vista Móvil */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Vista Móvil</h4>
                  <div className="border border-slate-200 rounded-lg p-2 bg-white shadow-sm max-w-sm mx-auto">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-amber-100 rounded-full text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-900 text-sm">¡Alerta de Consumo!</h5>
                        <p className="text-xs text-slate-600 mt-1">
                          {selectedDevice.name} excedió {selectedDevice.consumptionLimit}W. Actual: {selectedDevice.power}.
                        </p>
                        <div className="mt-2 flex gap-1">
                          <button className="px-2 py-1 bg-emerald-600 text-white text-xs rounded">
                            Ver
                          </button>
                          <button className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded">
                            OK
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction>Cerrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
