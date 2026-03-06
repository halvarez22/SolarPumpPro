import React from 'react';
import { 
  BookOpen, 
  User, 
  Droplets, 
  Waves, 
  Sun, 
  DollarSign, 
  FileText, 
  CheckCircle2,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function UserManual() {
  const sections = [
    {
      title: "1. ¿Qué es SolarPump Pro?",
      icon: BookOpen,
      content: "SolarPump Pro es una herramienta diseñada para que cualquier vendedor o asesor comercial pueda calcular y cotizar sistemas de bombeo solar de forma profesional, sin necesidad de ser un ingeniero experto. La app hace los cálculos complejos por ti.",
      color: "blue"
    },
    {
      title: "2. Información que debes solicitar al cliente",
      icon: User,
      content: "Para obtener una cotización precisa, necesitas recopilar estos datos clave:",
      items: [
        { label: "Datos del Cliente", desc: "Nombre, ubicación exacta (Estado/Municipio) y contacto." },
        { label: "Datos del Pozo", desc: "Profundidad total y Nivel Dinámico (a qué profundidad baja el agua cuando la bomba está encendida)." },
        { label: "Requerimientos de Agua", desc: "Cuánta agua necesita por día (m³) o cuántas hectáreas desea regar." },
        { label: "Distancias", desc: "Longitud de la tubería desde el pozo hasta el punto de entrega." }
      ],
      color: "indigo"
    },
    {
      title: "3. Cómo usar el Asistente (Wizard)",
      icon: CheckCircle2,
      content: "El proceso se divide en 7 pasos sencillos:",
      steps: [
        "Cliente: Ingresa quién es el interesado.",
        "Pozo: Define las características físicas de la fuente de agua.",
        "Bombeo: Indica las distancias y diámetros de tubería.",
        "Riego: Selecciona el tipo de cultivo y sistema de riego.",
        "Solar: La app sugiere la irradiación según la zona.",
        "Comercial: Define tus márgenes y costos de instalación.",
        "Resultados: Revisa el sistema propuesto antes de guardar."
      ],
      color: "emerald"
    },
    {
      title: "4. ¿Qué resultados obtendrás?",
      icon: FileText,
      content: "Una vez completado el asistente, la aplicación genera automáticamente:",
      items: [
        { label: "HMT (Altura Manométrica)", desc: "La fuerza total que la bomba debe vencer para entregar el agua." },
        { label: "Dimensionamiento Solar", desc: "Cuántos paneles y de qué potencia se necesitan exactamente." },
        { label: "Análisis Económico", desc: "Inversión total, tiempo de recuperación (ROI) y ahorro de CO2." },
        { label: "Documentación", desc: "Un PDF profesional listo para imprimir o enviar por WhatsApp/Email." }
      ],
      color: "orange"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Manual de Usuario</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Guía rápida para personal comercial y administrativo sobre cómo dominar SolarPump Pro y cerrar más ventas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${section.color}-500/10 text-${section.color}-400`}>
                <section.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">{section.title}</h3>
            </div>
            
            <p className="text-slate-400 mb-6 leading-relaxed">
              {section.content}
            </p>

            {section.items && (
              <div className="space-y-4 mt-auto">
                {section.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <span className="text-slate-200 font-bold text-sm block">{item.label}</span>
                      <span className="text-slate-500 text-xs">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.steps && (
              <div className="space-y-3 mt-auto">
                {section.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-400 shrink-0 border border-slate-700">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pro Tips */}
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
          <Info size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-xl font-bold text-white mb-2">Consejo de Oro para Ventas</h4>
          <p className="text-blue-200/70 text-sm leading-relaxed">
            Siempre pregunta al cliente si tiene planeado ampliar su cultivo en el futuro. SolarPump Pro permite ajustar la potencia fotovoltaica para dejar el sistema preparado para futuras expansiones, lo cual es un gran argumento de venta.
          </p>
        </div>
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all whitespace-nowrap">
          Empezar ahora
        </button>
      </div>
    </div>
  );
}
