import { ContainerClient } from '@azure/storage-blob'

export class BlobStorage {
    constructor(private client: ContainerClient) {
    }

    async addImage(imgData: string) {
        let matches = imgData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let type = matches[1];
        let buffer = Buffer.from(matches[2], 'base64');

        let name = `tcimg_${Math.random().toString().replace(/0\./, '')}_${Date.now()}`;
        let blobClient = this.client.getBlockBlobClient(name);

        try{
            await blobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: type } });
        }
        catch(ex){
            console.log(ex);
            throw ex;
        }

        return blobClient.url;
    }

    async addImageFile(file: File) {
        let name = `tcimg_${Math.random().toString().replace(/0\./, '')}_${Date.now()}`;
        let blobClient = this.client.getBlockBlobClient(name);

        try{
            await blobClient.uploadData(file);
        }
        catch(ex){
            console.log(ex);
            throw ex;
        }

        return blobClient.url;
    }
}