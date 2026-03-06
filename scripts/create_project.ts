const baseUrl = process.env.BASE_URL || 'http://localhost:4000';

async function main() {
  const data = {
    client: {
      nombre: 'Juan Pérez',
      contacto: '',
      email: 'juan@example.com',
      telefono: '555-123-4567',
      estado: 'Jalisco',
      municipio: 'Guadalajara',
    },
    well: {
      profundidadTotal: 120,
      nivelEstatico: 40,
      nivelDinamico: 75,
      caudalDisponible: 1.2,
      diametroPozo: 6,
      tipoAgua: 'dulce',
    },
    pumping: {
      longitudTuberia: 250,
      diametroTuberia: '2',
      materialTuberia: 'HDPE',
      accesorios: [] as any[],
      desnivelTopografico: 30,
      distanciaHorizontal: 250,
      presionOperacion: 2.5,
    },
    irrigation: {
      superficie: 5,
      tipoCultivo: 'Maíz',
      tipoRiego: 'aspersión',
      diasRiegoSemana: 6,
      horasOperacion: 8,
      requerimientoHidrico: 0,
    },
    solar: {
      irradiacionPromedio: 5.3,
      mesCritico: 'Diciembre',
      requiereTanque: false,
      requiereRespaldo: false,
    },
    commercial: {
      margenGanancia: 25,
      costoInstalacion: 15,
      costoIngenieria: 15000,
      tiempoEntrega: 6,
      condicionesPago: '50% anticipo, 50% contra entrega',
      vigenciaCotizacion: 30,
      notas: '',
    },
  };

  const calcRes = await fetch(`${baseUrl}/api/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!calcRes.ok) {
    const text = await calcRes.text();
    throw new Error(`Calculate failed: ${calcRes.status} ${text}`);
  }
  const calculations = await calcRes.json();

  const project = {
    id: `PRJ-${Date.now()}`,
    clientId: 'user-1',
    status: 'draft',
    data,
    calculations,
  };

  const createRes = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Create failed: ${createRes.status} ${text}`);
  }
  const created = await createRes.json();

  const getRes = await fetch(`${baseUrl}/api/projects/${project.id}`);
  if (!getRes.ok) {
    const text = await getRes.text();
    throw new Error(`Get by id failed: ${getRes.status} ${text}`);
  }
  const fetched = await getRes.json();

  console.log(`CREATED_ID=${created.id}`);
  console.log(
    `HMT=${calculations.HMT} POT_BOMBA=${calculations.potenciaBomba} POT_FV=${calculations.potenciaFV} PANEL=${calculations.numPaneles}`
  );
  console.log(`GET_STATUS=${fetched.status} ROI=${fetched.calculations.roi}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
