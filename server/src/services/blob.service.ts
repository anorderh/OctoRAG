import { BlobClient, BlobItem, BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import { BlobActionResponse, BlobActionResult } from "../utils/models/blob-action.model";
import { Readable } from "stream";
import { env } from "../env";
import { Service } from "../utils/interfaces/service.interface";
import { injectable } from "tsyringe";

@injectable()
export class BlobService extends Service {
    loaded: Boolean = false;
    client: BlobServiceClient;

    initialize() {
        if (this.loaded) {
            throw new Error("Azure Blob Service Client already loaded.");
        }

        return new Promise<void>((resolve, reject) => {
            try {
                this.client = BlobServiceClient.fromConnectionString(env.azure.connStr);
                this.loaded = true;
                console.log("Azure Blob Service successfully setup.");

                resolve();
            } catch(err) {
                reject();
            }
        })
    }

    async _clear() {
        try {
            if (!this.loaded) {
                throw new Error("Azure Blob Service Client has not been loaded.");
            }
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
            if (!this.loaded) {
                throw new Error("Azure Blob Service Client has not been loaded.");
            }
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
            if (!this.loaded) {
                throw new Error("Azure Blob Service Client has not been loaded.");
            }
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
            if (!this.loaded) {
                throw new Error("Azure Blob Service Client has not been loaded.");
            }
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