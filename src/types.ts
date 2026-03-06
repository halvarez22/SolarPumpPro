export interface Project {
  id: string;
  clientId: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  data: ProjectData;
  calculations: ProjectCalculations;
}

export interface ProjectData {
  client: {
    nombre: string;
    contacto: string;
    email: string;
    telefono: string;
    estado: string;
    municipio: string;
  };
  well: {
    profundidadTotal: number;
    nivelEstatico: number;
    nivelDinamico: number;
    caudalDisponible: number;
    diametroPozo: number;
    tipoAgua: 'dulce' | 'salobre' | 'salada';
  };
  pumping: {
    longitudTuberia: number;
    diametroTuberia: string;
    materialTuberia: 'PVC' | 'HDPE' | 'ACERO';
    accesorios: string[];
    desnivelTopografico: number;
    distanciaHorizontal: number;
    presionOperacion: number;
  };
  irrigation: {
    superficie: number;
    tipoCultivo: string;
    tipoRiego: 'goteo' | 'aspersión' | 'gravedad' | 'tanque';
    diasRiegoSemana: number;
    horasOperacion: number;
    requerimientoHidrico: number;
  };
  solar: {
    irradiacionPromedio: number;
    mesCritico: string;
    requiereTanque: boolean;
    capacidadTanque?: number;
    requiereRespaldo: boolean;
  };
  commercial: {
    margenGanancia: number;
    costoInstalacion: number;
    costoIngenieria: number;
    tiempoEntrega: number;
    condicionesPago: string;
    vigenciaCotizacion: number;
    notas: string;
  };
}

export interface ProjectCalculations {
  HMT: number;
  potenciaHidraulica: number;
  potenciaBomba: number;
  potenciaFV: number;
  numPaneles: number;
  energiaDiaria: number;
  aguaDiaria: number;
  inversionTotal: number;
  roi: number;
  co2Evitado: number;
}

export interface Equipment {
  id: string;
  category: 'bomba' | 'inversor' | 'panel' | 'estructura' | 'accesorio';
  marca: string;
  modelo: string;
  especificaciones: any;
  costo: number;
  precioVenta: number;
  moneda: string;
  disponible: boolean;
}
