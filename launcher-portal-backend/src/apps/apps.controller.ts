import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';

import { AppsService } from './apps.service';
import { CreateAppDto } from './dto/create-app.dto';
import { AddVersionDto } from './dto/add-version.dto';

@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  create(@Body() dto: CreateAppDto) {
    return this.appsService.create(dto);
  }

  @Get()
  findAll() {
    return this.appsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appsService.findOne(id);
  }
  // -----------------------------
  // DELETE APP
  // -----------------------------
  @Delete(':id')
  deleteApp(@Param('id') id: string) {
    return this.appsService.deleteApp(id);
  }
  // -----------------------------
  // DELETE VERSION
  // -----------------------------
  @Delete(':id/versions/:index')
  deleteVersion(@Param('id') id: string, @Param('index') index: number) {
    return this.appsService.deleteVersion(id, Number(index));
  }

  // FIXED NAME (plural)
  @Post(':id/versions')
  addVersion(@Param('id') id: string, @Body() dto: AddVersionDto) {
    console.log('ID:', id);
    console.log('BODY:', dto);
    return this.appsService.addVersion(id, dto);
  }

  // ⭐ NEW: UPDATE VERSION (needed for your frontend edit UI)
  @Patch(':id/versions/:index')
  updateVersion(
    @Param('id') id: string,
    @Param('index') index: number,
    @Body() dto: AddVersionDto,
  ) {
    return this.appsService.updateVersion(id, Number(index), dto);
  }
}
