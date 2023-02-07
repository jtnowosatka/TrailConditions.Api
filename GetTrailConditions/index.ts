import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { TypeConverter } from "../Shared/Api/Types/TypeConverter";
import { GetTrailConditionsResponse } from "../Shared/Api/Types/types";
import { tryAndHandleError } from "../Shared/Api/Utilities/ErrorHandling";
import { TrailReportsAccessor } from "../Shared/DataAccess/DataAccess";
import { TrailConditionsItem, TrailReportItem } from "../Shared/DataAccess/types";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const trailId = (req.query.trailId || (req.body && req.body.trailId)) as string;

    if (!trailId) {
        context.res = {
            status: 400,
            body: "Please pass the trail id on the query string or in the request body"
        };
        return;
    }

    await tryAndHandleError(
        context,
        async () => {
            let reportItems = await TrailReportsAccessor.getConditionsAndReports(trailId);

            let response: GetTrailConditionsResponse = {
                trailConditions: reportItems.filter(item => item.type === "TrailConditions").map(tc => TypeConverter.convertToTrailConditions(tc as TrailConditionsItem))[0],
                trailReports: reportItems.filter(item => item.type === "TrailReport").map(tr => TypeConverter.convertToTrailReport(tr as TrailReportItem))
            }

            return {
                status: 200,
                body: response
            }
        });
};

export default httpTrigger;