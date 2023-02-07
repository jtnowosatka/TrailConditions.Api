import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { tryAndHandleError } from "../Shared/Api/Utilities/ErrorHandling";
import { TrailsAccessor } from '../Shared/DataAccess/DataAccess';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    await tryAndHandleError(
        context,
        async () => {
            const bbox = (req.query.bbox || (req.body && req.body.bbox)) as string;

            if (!bbox) {
                return {
                    status: 400,
                    body: "Please pass the bounding box on the query string or in the request body"
                };
            }

            let bboxCoords = bbox.split(",").map(value => parseFloat(value));

            if (bboxCoords.length !== 4) {
                return {
                    status: 400,
                    body: `Invalid bounding box: ${bbox}`
                };
            }

            let result = await TrailsAccessor.getAllTrails([bboxCoords[1], bboxCoords[0]], [bboxCoords[3], bboxCoords[2]]);

            if (result.features === null) {
                result.features = [];
            }

            return {
                status: 200,
                body: result
            };
        });
};

export default httpTrigger;