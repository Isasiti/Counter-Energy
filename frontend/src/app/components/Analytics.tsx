import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { Download, Share2, Calendar, FileText } from "lucide-react";

const monthlyData = [
  { name: "Ene", energia: 420, costo: 65 },
  { name: "Feb", energia: 380, costo: 58 },
  { name: "Mar", energia: 450, costo: 70 },
  { name: "Abr", energia: 390, costo: 60 },
  { name: "May", energia: 410, costo: 63 },
  { name: "Jun", energia: 480, costo: 75 },
];

const breakdownData = [
  { name: "Climatización", value: 45 },
  { name: "Iluminación", value: 15 },
  { name: "Electrodomésticos", value: 25 },
  { name: "Electrónica", value: 10 },
  { name: "Otros", value: 5 },
];

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export function Analytics() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Analíticas de Consumo</h2>
          <p className="text-slate-500 mt-1">Reportes detallados y tendencias históricas</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium">Últimos 6 Meses</span>
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors tooltip-trigger" aria-label="Exportar Informe">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2.5 bg-emerald-600 border border-emerald-600 rounded-xl text-white hover:bg-emerald-700 transition-colors tooltip-trigger" aria-label="Compartir">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Consumo Mensual</h3>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-500">Energía (kWh)</span>
              </div>
            </div>
          </div>
          
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Bar dataKey="energia" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-slate-800">Distribución de Carga</h3>
            <p className="text-sm text-slate-500 mt-1">Categorías de mayor consumo este mes</p>
          </div>
          
          <div className="w-full h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 space-y-3">
            {breakdownData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Informes Generados</h3>
          <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700">Ver historial</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Nombre del Informe</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Tamaño</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: "Resumen Energético Q1", date: "01 Abr, 2026", size: "2.4 MB" },
                { name: "Análisis de Dispositivos Mar", date: "31 Mar, 2026", size: "1.8 MB" },
                { name: "Auditoría de Eficiencia", date: "15 Feb, 2026", size: "4.1 MB" },
              ].map((report, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-800">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{report.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{report.size}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 justify-end ml-auto">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Descargar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
