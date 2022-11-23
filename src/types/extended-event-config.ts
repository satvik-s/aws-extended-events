import { CompressionType } from './compression-type';

export interface ExtendedEventConfig {
    useCompression: boolean;
    compressionType?: CompressionType;
    useS3: boolean;
    s3Config?: {
        bucketName: string;
        region: string;
    };
}
