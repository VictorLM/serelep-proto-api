import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { DashboardQueryDTO } from './globals/dto/dashboard.dto';
import { DashboardJobsData, DashboardValuesData } from './globals/interfaces/dashboard-data.interface';

@Controller()
@UseGuards(JwtAuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/dashboard/values')
  getDashboardValuesData(@Query() dashboardQueryDTO: DashboardQueryDTO): Promise<DashboardValuesData> {
    return this.appService.getDashboardValuesData(dashboardQueryDTO);
  }

  @Get('/dashboard/jobs')
  getDashboardJobsData(@Query() dashboardQueryDTO: DashboardQueryDTO): Promise<DashboardJobsData> {
    return this.appService.getDashboardJobsData(dashboardQueryDTO);
  }

  @Get('/dashboard/chart')
  getDashboardChartData(@Query() dashboardQueryDTO: DashboardQueryDTO): Promise<DashboardValuesData[]> {
    return this.appService.getDashboardChartData(dashboardQueryDTO);
  }

}
