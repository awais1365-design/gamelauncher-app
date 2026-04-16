import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { App, AppDocument } from './schemas/app.schema';
import { CreateAppDto } from './dto/create-app.dto';
import { AddVersionDto } from './dto/add-version.dto';

@Injectable()
export class AppsService {
  constructor(
    @InjectModel(App.name)
    private readonly appModel: Model<AppDocument>,
  ) {}

  // -----------------------------
  // CREATE APP
  // -----------------------------
  async create(dto: CreateAppDto) {
    const name = dto.name.trim();

    try {
      return await this.appModel.create({
        name,
        url: dto.url,
        version: dto.version || '0.0.0',
        versions: [],
      });
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException(`App name "${name}" already exists`);
      }
      throw error;
    }
  }

  // -----------------------------
  // GET ALL APPS
  // -----------------------------
  async findAll() {
    return this.appModel.find().sort({ createdAt: -1 }).exec();
  }

  // -----------------------------
  // GET SINGLE APP
  // -----------------------------
  async findOne(id: string) {
    const app = await this.appModel.findById(id);

    if (!app) {
      throw new NotFoundException('App not found');
    }

    return app;
  }

  // -----------------------------
  // VERSION COMPARISON HELPERS
  // -----------------------------
  // Returns true if newV > oldV
  private isVersionGreater(newV: string, oldV: string): boolean {
    const newParts = newV.split('.').map(Number);
    const oldParts = oldV.split('.').map(Number);

    const len = Math.max(newParts.length, oldParts.length);

    for (let i = 0; i < len; i++) {
      const n = newParts[i] || 0;
      const o = oldParts[i] || 0;

      if (n > o) return true;
      if (n < o) return false;
    }

    return false;
  }

  // Sorter function (Descending order: 2.0.0, 1.5.0, 1.0.0)
  private compareVersionsDesc(a: any, b: any): number {
    if (this.isVersionGreater(a.version, b.version)) return -1;
    if (this.isVersionGreater(b.version, a.version)) return 1;
    return 0;
  }

  // -----------------------------
  // DELETE APP
  // -----------------------------
  async deleteApp(id: string) {
    const deletedApp = await this.appModel.findByIdAndDelete(id);

    if (!deletedApp) {
      throw new NotFoundException('App not found');
    }

    return {
      message: `App "${deletedApp.name}" deleted successfully`,
    };
  }

  // -----------------------------
  // ADD VERSION
  // -----------------------------
  async addVersion(id: string, dto: AddVersionDto) {
    const app = await this.appModel.findById(id);

    if (!app) {
      throw new NotFoundException('App not found');
    }

    const currentVersion =
      app.versions.length > 0
        ? app.versions[0].version
        : app.version || '0.0.0';

    // 🔥 MUST BE HIGHER THAN CURRENT
    if (!this.isVersionGreater(dto.version, currentVersion)) {
      throw new BadRequestException(
        `Version must be greater than ${currentVersion}`,
      );
    }

    // duplicate check
    const exists = app.versions.some((v) => v.version === dto.version);

    if (exists) {
      throw new BadRequestException('Version already exists');
    }

    app.versions.unshift({
      version: dto.version,
      url: dto.url,
      size: dto.size,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 🔒 Sort array to guarantee order
    app.versions.sort(this.compareVersionsDesc.bind(this));

    // sync latest
    app.version = app.versions[0].version;
    app.url = app.versions[0].url;

    await app.save();

    return app;
  }

  // -----------------------------
  // DELETE VERSION
  // -----------------------------
  async deleteVersion(id: string, index: number) {
    const app = await this.appModel.findById(id);

    if (!app) {
      throw new NotFoundException('App not found');
    }

    if (!app.versions || index < 0 || index >= app.versions.length) {
      throw new NotFoundException('Version not found');
    }

    app.versions.splice(index, 1);

    // 🔒 Ensure array is sorted
    app.versions.sort(this.compareVersionsDesc.bind(this));

    // sync latest
    if (app.versions.length > 0) {
      app.version = app.versions[0].version;
      app.url = app.versions[0].url;
    } else {
      app.version = '0.0.0';
      app.url = '';
    }

    await app.save();

    return {
      message: 'Version deleted successfully',
    };
  }

  // -----------------------------
  // UPDATE VERSION
  // -----------------------------
  async updateVersion(id: string, index: number, dto: AddVersionDto) {
    const app = await this.appModel.findById(id);

    if (!app) {
      throw new NotFoundException('App not found');
    }

    if (!app.versions || !app.versions[index]) {
      throw new NotFoundException('Version not found');
    }

    const existing = app.versions[index];

    // 🔥 BLOCK LOWER OR SAME VERSION (unless same value)
    if (
      dto.version !== existing.version &&
      !this.isVersionGreater(dto.version, existing.version)
    ) {
      throw new BadRequestException(
        `Version must be greater than ${existing.version}`,
      );
    }

    // duplicate check
    const duplicate = app.versions.find(
      (v, i) => v.version === dto.version && i !== index,
    );

    if (duplicate) {
      throw new BadRequestException('Version already exists in this app');
    }

    app.versions[index] = {
      version: dto.version,
      url: dto.url,
      size: dto.size,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    // ✅ FIX: RESORT ARRAY BEFORE SYNCING
    // If the version number changed significantly, it needs to move in the list
    app.versions.sort(this.compareVersionsDesc.bind(this));

    // sync latest safely (index 0 is now guaranteed to be the highest)
    app.version = app.versions[0].version;
    app.url = app.versions[0].url;

    await app.save();

    return app;
  }
}
