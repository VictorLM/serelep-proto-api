import { Injectable } from '@nestjs/common';
import { BillsService } from './bills/bills.service';
import { DashboardQueryDTO } from './globals/dto/dashboard.dto';
import { DashboardJobsData, DashboardValuesData } from './globals/interfaces/dashboard-data.interface';
import { JobsService } from './jobs/jobs.service';
import { PaymentsService } from './payments/payments.service';

@Injectable()
export class AppService {
  constructor(
    private paymentsService: PaymentsService,
    private billsService: BillsService,
    private jobsService: JobsService,
  ) {}

  getPeriodByQuery(
    dashboardQueryDTO: DashboardQueryDTO
    ): { month: number, year: number } {
    const { month, year } = dashboardQueryDTO || {};

    const period = {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    }

    if(month && year) {
      period.month = Number(month);
      period.year = Number(year);
    }

    return period;
  }

  async getDashboardValuesData(dashboardQueryDTO: DashboardQueryDTO): Promise<DashboardValuesData> {
    const period = this.getPeriodByQuery(dashboardQueryDTO);

    const expectedPaymentsAmount = await this.paymentsService.getExpectedPaymentsAmount(period.month, period.year);
    const expectedBillsAmount = await this.billsService.getExpectedBillsAmount(period.month, period.year);

    const dashboardValuesData: DashboardValuesData = {
      month: period.month,
      year: period.year,
      expectedPaymentsAmount,
      expectedBillsAmount
    };

    return dashboardValuesData;
  }

  async getDashboardJobsData(dashboardQueryDTO: DashboardQueryDTO): Promise<DashboardJobsData> {
    const period = this.getPeriodByQuery(dashboardQueryDTO);
    return await this.jobsService.getJobsByPeriodCounts(period.month, period.year);
  }

  async getDashboardChartData(dashboardQueryDTO: DashboardQueryDTO): Promise<DashboardValuesData[]> {
    const period = this.getPeriodByQuery(dashboardQueryDTO);
    // Pegando mes com +1 p/ subtrair no loop
    const dateMonth = new Date(period.year, period.month);
    const dateYear = new Date(period.year, period.month);
    const dashboardChartData: DashboardValuesData[] = [];

    for(let i = 0; i < 12; i = i + 1) { // 12 meses
      // Adicionando +1 ao mês porque os meses começam no 0, mas não para a função que está sendo chamada
      dashboardChartData.push(await this.getDashboardValuesData({
        month: new Date(dateMonth.setMonth(dateMonth.getMonth() - 1)).getMonth() + 1,
        year: new Date(dateYear.setMonth(dateYear.getMonth() - 1)).getFullYear(),
      }))
    }

    return dashboardChartData
  }

}
