export class JobsByStatus {
  OPEN: number;
  DONE: number;
}

export class JobsByType {
  VISUAL_IDENTITY: number;
  BRAND_DESIGN: number;
  PACKAGING_DESIGN: number;
  NAMING: number;
  OTHERS: number;
}

class Jobs {
  byType: JobsByType;
  byStatus: JobsByStatus;
}

export class Period {
  month: number;
  year: number;
}

export class DashboardValuesData extends Period {
  expectedPaymentsAmount: number;
  expectedBillsAmount: number;
}

export class DashboardJobsData extends Period {
  jobs: Jobs;
}

export class DashboardChart {

}
