import { IsString, Matches, IsOptional } from 'class-validator';

const urlRegex = /^(www\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
const versionRegex = /^\d+(\.\d+)*$/;

export class CreateAppDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(urlRegex, { message: 'URL must be like www.google.com' })
  url: string;

  @IsOptional()
  @IsString()
  @Matches(versionRegex, {
    message: 'Version must be like 1 or 1.0.0',
  })
  version?: string;
}
