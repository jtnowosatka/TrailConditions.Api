import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { TypeConverter } from "../Shared/Api/Types/TypeConverter";
import { TrailReport } from "../Shared/Api/Types/types";
import { tryAndHandleError } from "../Shared/Api/Utilities/ErrorHandling";
import { TrailReportsAccessor, BlobStorageAccessor } from "../Shared/DataAccess/DataAccess";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const trailReport = (req.query.trailReport || (req.body && req.body.trailReport)) as TrailReport;

    if (!trailReport) {
        context.res = {
            status: 400,
            body: "Please pass the trail report on the query string or in the request body"
        };
        return;
    }

    // console.log(JSON.stringify(trailReport));

    await tryAndHandleError(
        context,
        async () => {

            //Push images to blob storage
            if(trailReport.images){
                trailReport.images = await Promise.all(trailReport.images.map(img => BlobStorageAccessor.addImage(img)));
            }

            await TrailReportsAccessor.addTrailReport(TypeConverter.convertToTrailReportItem(trailReport));

            return {
                status: 201,
            };
        });
};

export default httpTrigger;