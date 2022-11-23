// eslint-disable-next-line node/no-unpublished-import
import { MessageAttributeValue } from '@aws-sdk/client-sns';

export interface GenerateEventInput {
    body: string | undefined;
    snsMessageAttributes?: Record<string, MessageAttributeValue>;
    s3Key?: string;
}
