import { GenerateEventOutputType } from './generate-event-output-type';

export type GenerateEventOutput =
    | { type: GenerateEventOutputType.BASE; data: string | undefined }
    | { type: GenerateEventOutputType.BROTLI; data: string }
    | { type: GenerateEventOutputType.GZIP; data: string }
    | { type: GenerateEventOutputType.S3; data: GenerateEventOutputS3Data };

interface GenerateEventOutputS3Data {
    bucketName: string;
    key: string;
}
