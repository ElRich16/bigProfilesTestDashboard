export interface PageModel {
  totalErrors: number;
  totalRequests: number;
  averageResponseTime: number;
  timeDistribution: TimeDistribution;
  ketyDistribution: KeyDistribution;
  logs: Log[];
}
export interface KeyDistribution {
  [key: number]: number;
}

export interface TimeDistribution {
  [key: string]: number;
}
export interface AggregatedValue {
  key: number;
  creation_datetime: string;
  total_errors: number;
  total_requests: number;
  total_response_time_ms: number;
}

export interface ValueResponse {
  logs: Log[];
  values: AggregatedValue[];
}
export interface Log {
  creation_datetime: string;
  key: number;
  payload: string;
  response_code: number;
  response_time: number;
}
