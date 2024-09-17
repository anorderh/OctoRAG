import { BlobClient, BlobItem, BlobServiceClient, BlockBlobClient, ContainerClient, logger } from "@azure/storage-blob";
import { BlobActionResponse } from '../utils/interfaces/blob-action-response';
import { BlobActionResult } from '../utils/enums/blob-action-result.enum';
import { Readable } from "stream";
import { env } from '../env';
import { inject, injectable, singleton } from "tsyringe";
import { Logger } from "pino";
import { InstanceDeps } from '../utils/enums/instance-deps';
import { AsyncService } from '../utils/abstract/async-service';

@singleton()
export class AzureBlobService implements AsyncService {
    client: BlobServiceClient;

    constructor(
        @inject(InstanceDeps.Logger) private logger: Logger
    ) {}

    async initialize(): Promise<void> {
        this.client = BlobServiceClient.fromConnectionString(env.azure.connStr);
        this.logger.info("Azure File Storage connection established.")
    }
    async cleanup() {
        // No explicit handling needed.
        this.logger.info(`Azure File Storage cleaned up.`);
    }

    async _clear() {
        try {
            for await (const c of this.client.listContainers()) {
                const container = this.client.getContainerClient(c.name);
                await container.delete();
                console.log(`Container "${c.name}" has been deleted.`)
            }
            return { result: BlobActionResult.SUCCESS };
        } catch(err: any) {
            return { result: BlobActionResult.ERROR, content: err };
        }
    }

    async peek(containerName: string, prefix? : string) : Promise<BlobActionResponse> {
        try {
            let container : ContainerClient = this.client.getContainerClient(containerName);
            container.createIfNotExists();
            let output : BlobItem[] = [];
            let blobIterator = container.listBlobsFlat({ prefix });
            for await (const blob of blobIterator) {
              output.push(blob);
            }
            
            return { result: BlobActionResult.SUCCESS, content: output };
        } catch(err: any) {
            return { result: BlobActionResult.ERROR, content: err };
        }
    }

    async download(containerName : string, blobName: string) : Promise<BlobActionResponse>  {
        try {
            let container : ContainerClient = this.client.getContainerClient(containerName);
            container.createIfNotExists();
            let blob : BlobClient = container.getBlobClient(blobName);
            let res = await blob.download();
            
            return { result: BlobActionResult.SUCCESS, content: res };
        } catch(err: any) {
            return { result: BlobActionResult.ERROR, content: err };
        }
    }

    async upload(containerName : string, blobName: string, stream: Readable) : Promise<BlobActionResponse> {
        try {
            let container : ContainerClient = this.client.getContainerClient(containerName);
            container.createIfNotExists();
            let blockBlob: BlockBlobClient = container.getBlockBlobClient(blobName);
            let res = await blockBlob.uploadStream(stream);
            
            return { result: BlobActionResult.SUCCESS, content: res };
        } catch(err: any) {
            return { result: BlobActionResult.ERROR, content: err };
        }
    }
}