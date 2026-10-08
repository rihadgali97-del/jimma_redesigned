export interface WoredaGisData {
  id: string;
  name: string;
  oromoName: string;
  arabicName: string;
  zone: string | null;
  centerCoordinates: { lat: number | null; lng: number | null };
  svgPath: string | null;
  labelPos: { x: number | null; y: number | null };
  areaKm2: number | null;
  elevationMeters: number | null;
  population: number | null;
  muslimPercentage: number | null;
  totalMosques: number;
  jummahMosques: number;
  totalMadrasas: number;
  tahfeezStudents: number;
  annualZakatETB: number;
  councilBranchHead: string | null;
  headContact: string | null;
  climateZone: 'Highland (Dega)' | 'Midland (Weyna Dega)' | 'Lowland (Kolla)' | null;
  notableFeatures: string[];
}

export interface GisPoi {
  id: string;
  name: string;
  arabicName?: string;
  type: 'mosque' | 'madrasa' | 'council_office' | 'zakat_center' | 'historic_site' | 'janazah_center';
  woredaId: string;
  woredaName: string;
  coordinates: { lat: number; lng: number };
  mapPos: { x: number; y: number };
  address: string;
  leadPerson: string;
  leadRole: string;
  phone: string;
  capacityOrStudents: number;
  establishedYear: number;
  status: 'Active' | 'Under Expansion' | 'Historical Heritage';
  hasSolarSystem: boolean;
  hasWaterWell: boolean;
  linkedEntityId?: string;
  description: string;
  image: string;
}
