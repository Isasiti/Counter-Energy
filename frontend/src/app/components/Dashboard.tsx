import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Zap, DollarSign, TrendingDown, Thermometer, BatteryFull } from "lucide-react";

const data = [
  { name: "Lun", hw: 14.5 },
  { name: "Mar", hw: 13.2 },
  { name: "Mié", hw: 16.0 },
  { name: "Jue", hw: 12.8 },
  { name: "Vie", hw: 15.4 },
  { name: "Sáb", hw: 18.2 },
  { name: "Dom", hw: 17.5 },
];

export function Dashboard() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Card */}
      <div className="relative rounded-3xl overflow-hidden bg-emerald-600 text-white shadow-xl">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1717323454555-f053c31ff4b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzbWFydCUyMGhvbWUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzQ0NTIzNjF8MA&ixlib=rb-4.1.0&q=80&w=1080" 
            alt="Smart Home Interior" 
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">¡Hola, Juan!</h2>
            <p className="text-emerald-100 max-w-md">Tu hogar inteligente está funcionando eficientemente hoy. Has ahorrado un 12% de energía esta semana.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center min-w-24 border border-white/30 shadow-sm">
              <Thermometer className="w-6 h-6 mb-1" />
              <span className="text-2xl font-bold">22°C</span>
              <span className="text-xs text-emerald-100 uppercase tracking-wider mt-1">Interior</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center min-w-24 border border-white/30 shadow-sm">
              <BatteryFull className="w-6 h-6 mb-1" />
              <span className="text-2xl font-bold">85%</span>
              <span className="text-xs text-emerald-100 uppercase tracking-wider mt-1">Batería</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-medium">Consumo Hoy</span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <span className="text-4xl font-bold text-slate-800">14.2</span>
              <span className="text-slate-500 ml-1">kWh</span>
            </div>
            <div className="flex items-center text-rose-500 text-sm font-medium bg-rose-50 px-2 py-1 rounded-lg">
              <TrendingDown className="w-4 h-4 mr-1 rotate-180" />
              <span>+2.4%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="font-medium">Gasto Estimado</span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <span className="text-4xl font-bold text-slate-800">$42</span>
              <span className="text-slate-500 ml-1">.50</span>
            </div>
            <div className="flex items-center text-emerald-500 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span>-5.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-medium">Dispositivos Activos</span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <span className="text-4xl font-bold text-slate-800">8</span>
              <span className="text-slate-500 ml-1">/ 12</span>
            </div>
            <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
              Ver todos →
            </button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Uso de Energía Semanal</h3>
            <p className="text-sm text-slate-500 mt-1">Consumo en kWh durante los últimos 7 días</p>
          </div>
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none font-medium transition-colors hover:border-slate-300">
            <option>Esta Semana</option>
            <option>Semana Pasada</option>
            <option>Este Mes</option>
          </select>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="hw" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHw)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
