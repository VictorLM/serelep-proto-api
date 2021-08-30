import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { NewJobDTO, UpdateJobDTO } from './dto/job.dto';
import { JobsService } from './jobs.service';
import { JobDocument } from './model/job.schema';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get('/')
  getJobs(): Promise<JobDocument[]> {
    return this.jobsService.getJobs();
  }

  @Get('/:id')
  getJobById(@Param() mongoIdDTO: MongoIdDTO): Promise<JobDocument> {
    return this.jobsService.getJobById(mongoIdDTO.id);
  }

  @Post('/')
  createJob(@Body() newJobDTO: NewJobDTO): Promise<JobDocument> {
    return this.jobsService.newJob(newJobDTO);
  }

  @Patch('/:id')
  updateJob(
    @Param() mongoIdDTO: MongoIdDTO,
    @Body() updateJobDTO: UpdateJobDTO,
  ): Promise<JobDocument> {
    return this.jobsService.updateJob(mongoIdDTO, updateJobDTO);
  }

  @Delete('/:id')
  deleteJob(@Param() mongoIdDTO: MongoIdDTO): Promise<void> {
    return this.jobsService.deleteJob(mongoIdDTO);
  }

}
