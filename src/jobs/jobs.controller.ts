import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MongoIdDTO } from '../globals/dto/mongoId.dto';
import { CreateJobNoteDTO } from './dto/create-job-notes.dto';
import { NewJobDTO, UpdateJobDTO } from './dto/job.dto';
import { JobsQueryDTO } from './dto/jobs-query.dto';
import { JobNote } from './interface/job-note.interface';
import { JobsService } from './jobs.service';
import { JobDocument } from './model/job.schema';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get('/')
  getJobs(
    @Query(new ValidationPipe({ transform: true })) jobsQueryDTO: JobsQueryDTO,
  ): Promise<JobDocument[]> {
    return this.jobsService.getJobs(jobsQueryDTO);
  }

  @Get('/:id')
  getJobById(@Param() mongoIdDTO: MongoIdDTO): Promise<JobDocument> {
    return this.jobsService.getJobById(mongoIdDTO.id);
  }

  @Post('/')
  createJob(@Body() newJobDTO: NewJobDTO): Promise<JobDocument> {
    return this.jobsService.newJob(newJobDTO);
  }

  @Post('/:id/notes')
  createJobNote(
    @Param() mongoIdDTO: MongoIdDTO,
    @Body() createJobNoteDTO: CreateJobNoteDTO,
  ): Promise<JobNote> {
    return this.jobsService.createJobNote(mongoIdDTO, createJobNoteDTO);
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
