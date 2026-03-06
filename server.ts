import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("solarpump.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    nombre TEXT,
    empresa TEXT,
    rol TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    clientId TEXT,
    status TEXT DEFAULT 'draft',
    data JSON,
    calculations JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS equipment_catalog (
    id TEXT PRIMARY KEY,
    category TEXT,
    marca TEXT,
    modelo TEXT,
    especificaciones JSON,
    costo REAL,
    precioVenta REAL,
    moneda TEXT,
    disponible INTEGER DEFAULT 1,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial equipment if empty
const equipmentCount = db.prepare("SELECT COUNT(*) as count FROM equipment_catalog").get() as { count: number };
if (equipmentCount.count === 0) {
  const insert = db.prepare(`
    INSERT INTO equipment_catalog (id, category, marca, modelo, especificaciones, costo, precioVenta, moneda)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insert.run("b1", "bomba", "Grundfos", "SQFlex 2.5-2", JSON.stringify({ potencia: 1.4, voltaje: "200V" }), 45000, 58000, "MXN");
  insert.run("i1", "inversor", "Lorentz", "PS2-1800", JSON.stringify({ potencia: 1.8, tipo: "MPPT" }), 25000, 32000, "MXN");
  insert.run("p1", "panel", "Jinko Solar", "550W Bifacial", JSON.stringify({ potencia: 550 }), 2800, 3800, "MXN");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY updatedAt DESC").all();
    res.json(projects.map((p: any) => ({ ...p, data: JSON.parse(p.data), calculations: JSON.parse(p.calculations) })));
  });

  app.get("/api/projects/:id", (req, res) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id) as any;
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ ...project, data: JSON.parse(project.data), calculations: JSON.parse(project.calculations) });
  });

  app.post("/api/projects", (req, res) => {
    const { id, clientId, status, data, calculations } = req.body;
    const stmt = db.prepare("INSERT INTO projects (id, clientId, status, data, calculations) VALUES (?, ?, ?, ?, ?)");
    stmt.run(id, clientId, status, JSON.stringify(data), JSON.stringify(calculations));
    res.status(201).json({ id });
  });

  app.put("/api/projects/:id", (req, res) => {
    const { status, data, calculations } = req.body;
    const stmt = db.prepare("UPDATE projects SET status = ?, data = ?, calculations = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(status, JSON.stringify(data), JSON.stringify(calculations), req.params.id);
    res.json({ success: true });
  });
  
  app.delete("/api/projects/:id", (req, res) => {
    const stmt = db.prepare("DELETE FROM projects WHERE id = ?");
    const info = stmt.run(req.params.id);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ success: true });
  });

  app.get("/api/equipment", (req, res) => {
    const equipment = db.prepare("SELECT * FROM equipment_catalog").all();
    res.json(equipment.map((e: any) => ({ ...e, especificaciones: JSON.parse(e.especificaciones) })));
  });
  
  app.post("/api/equipment", (req, res) => {
    const { id, category, marca, modelo, especificaciones, costo, precioVenta, moneda, disponible } = req.body;
    const eqId = id || `EQ-${Date.now()}`;
    const stmt = db.prepare("INSERT INTO equipment_catalog (id, category, marca, modelo, especificaciones, costo, precioVenta, moneda, disponible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(eqId, category, marca, modelo, JSON.stringify(especificaciones || {}), Number(costo), Number(precioVenta), moneda || "MXN", disponible ? 1 : 0);
    res.status(201).json({ id: eqId });
  });
  
  app.put("/api/equipment/:id", (req, res) => {
    const { category, marca, modelo, especificaciones, costo, precioVenta, moneda, disponible } = req.body;
    const stmt = db.prepare("UPDATE equipment_catalog SET category = ?, marca = ?, modelo = ?, especificaciones = ?, costo = ?, precioVenta = ?, moneda = ?, disponible = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?");
    const info = stmt.run(category, marca, modelo, JSON.stringify(especificaciones || {}), Number(costo), Number(precioVenta), moneda || "MXN", disponible ? 1 : 0, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: "Equipment not found" });
    res.json({ success: true });
  });
  
  app.delete("/api/equipment/:id", (req, res) => {
    const stmt = db.prepare("DELETE FROM equipment_catalog WHERE id = ?");
    const info = stmt.run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: "Equipment not found" });
    res.json({ success: true });
  });

  // Calculation Engine (Simplified for API)
  app.post("/api/calculate", (req, res) => {
    const data = req.body;
    
    // 1. HMT
    const factores: Record<string, number> = { '1': 0.08, '1.5': 0.04, '2': 0.025, '3': 0.01, '4': 0.005 };
    const f = factores[data.pumping.diametroTuberia] || 0.025;
    const perdidaFriccion = data.pumping.longitudTuberia * f * (data.well.caudalDisponible / 5);
    const HMT = data.well.nivelDinamico + data.pumping.desnivelTopografico + perdidaFriccion + (data.pumping.presionOperacion * 10);

    // 2. Potencia
    const Q_m3_h = data.well.caudalDisponible * 3.6;
    const PH = (1000 * 9.81 * Q_m3_h * HMT) / 3600000;
    const potenciaBomba = PH / 0.55;
    
    // 3. Solar
    const potenciaFV = potenciaBomba / 0.80;
    const numPaneles = Math.ceil((potenciaFV * 1000) / 550 * 1.15);
    const energiaDiaria = potenciaFV * 5;
    const aguaDiaria = data.well.caudalDisponible * 3.6 * data.irrigation.horasOperacion;

    // 4. Economic
    const inversionTotal = (potenciaFV * 1000 * 35) + 50000; // Rough estimate $35/W + fixed costs
    const ahorroAnual = aguaDiaria * 300 * 5; // Rough estimate $5/m3 saved
    const roi = inversionTotal / ahorroAnual;
    const co2Evitado = (energiaDiaria * 365 * 0.46) / 1000;

    res.json({
      HMT: Math.round(HMT * 100) / 100,
      potenciaHidraulica: Math.round(PH * 100) / 100,
      potenciaBomba: Math.round(potenciaBomba * 100) / 100,
      potenciaFV: Math.round(potenciaFV * 100) / 100,
      numPaneles,
      energiaDiaria: Math.round(energiaDiaria * 100) / 100,
      aguaDiaria: Math.round(aguaDiaria * 100) / 100,
      inversionTotal: Math.round(inversionTotal),
      roi: Math.round(roi * 10) / 10,
      co2Evitado: Math.round(co2Evitado * 100) / 100
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
