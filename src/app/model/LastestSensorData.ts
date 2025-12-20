export interface LastestSensorData {
  latestDate: string;
  latestValue: number;
}

export interface CurrentGraphPoint {
  M: string;
  R: number;
  Sp: number;
  MT: number;
  HMT: number;
  MNT: number;
  HMNT: number;
  A: number;
  MN: string;
  AC: number;
  HC: number;
}

export interface CurrentGraphResponse {
  lastUpdate: string;
  results: CurrentGraphPoint[];
}
