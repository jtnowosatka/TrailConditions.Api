import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('CombineTrails called.');
    const trailIds = req.body && req.body.trailIds as string[];



    context.res = {
        status: 200,
        body: "Success"
    };

};

export default httpTrigger;