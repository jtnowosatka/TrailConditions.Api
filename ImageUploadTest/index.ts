import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { BlobStorageAccessor } from '../Shared/DataAccess/DataAccess';
import multipart from 'parse-multipart';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    let parts = multipart.Parse(req.body, req.headers['content-type']);

    if (!parts) {
        context.res = {
            status: 400,
            body: "Parameter 'images' not found on body"
        }

        return;
    }

    let urls = await Promise.all(parts.map(part => BlobStorageAccessor.addImageFile(part.data)));

    context.res = {
        status: 200,
        body: { urls }
    };

};

export default httpTrigger;