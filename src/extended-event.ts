import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { brotliCompressSync, gzipSync } from 'zlib';

import {
    CompressionType,
    ExtendedEventConfig,
    GenerateEventInput,
    GenerateEventOutput,
    GenerateEventOutputType,
} from './types';

const DEFAULT_MAX_SIZE_BYTES = 256_000;
const DEFAULT_ENCODING = 'base64';

export class ExtendedEvent {
    private readonly config: ExtendedEventConfig;
    private readonly s3Client?: S3Client;

    constructor(config: ExtendedEventConfig) {
        this.config = config;
        if (config.useS3 && config.s3Config !== undefined) {
            this.s3Client = new S3Client({ region: config.s3Config.region });
        }
    }

    async generateEvent(
        input: GenerateEventInput,
    ): Promise<GenerateEventOutput> {
        if (input.body === undefined) {
            return { type: GenerateEventOutputType.BASE, data: undefined };
        }

        const dataSize = this.getStringSizeInBytes(input.body);

        if (
            this.config.useCompression &&
            this.config.compressionType === CompressionType.BROTLI
        ) {
            return {
                type: GenerateEventOutputType.GZIP,
                data: brotliCompressSync(input.body).toString(DEFAULT_ENCODING),
            };
        }

        if (
            this.config.useCompression &&
            this.config.compressionType === CompressionType.GZIP
        ) {
            return {
                type: GenerateEventOutputType.GZIP,
                data: gzipSync(input.body).toString(DEFAULT_ENCODING),
            };
        }

        if (
            this.config.useS3 &&
            this.config.s3Config !== undefined &&
            dataSize > DEFAULT_MAX_SIZE_BYTES
        ) {
            const key = input.s3Key ?? randomUUID();
            const putObjectCommand = new PutObjectCommand({
                Bucket: this.config.s3Config.bucketName,
                Key: key,
                Body: input.body,
                ContentType: 'text/plain; charset=utf-8',
            });

            await this.s3Client!.send(putObjectCommand);
            return {
                type: GenerateEventOutputType.S3,
                data: { bucketName: this.config.s3Config.bucketName, key },
            };
        }

        return { type: GenerateEventOutputType.BASE, data: input.body };
    }

    private getStringSizeInBytes(input: string): number {
        return Buffer.byteLength(input);
    }
}
