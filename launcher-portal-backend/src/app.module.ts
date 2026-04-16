import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // ✅ import this
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppsModule } from './apps/apps.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/gamelauncher'),
    AppsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
