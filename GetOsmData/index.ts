import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios, { AxiosRequestConfig } from "axios";
import osmtogeojson = require('osmtogeojson');
import { tryAndHandleError } from "../Shared/Api/Utilities/ErrorHandling";


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const bbox = (req.query.bbox || (req.body && req.body.bbox));
    const queryTemplate = `[out:json];(way[highway~"(path|track|footway|bridleway)"]({bbox});>;);out;`
    const baseServiceUrl = "https://overpass-api.de/api/interpreter";

    if (!bbox) {
        context.res = {
            status: 400,
            body: "Please pass the bounding box on the query string or in the request body"
        };
        return;
    }

    const query = queryTemplate.replace("{bbox}", bbox);

    var url = baseServiceUrl + "?data=" + encodeURIComponent(query);

    var config: AxiosRequestConfig = {
    }

    await tryAndHandleError(
        context,
        async () => {
            var response = await axios.get(url, config);

            var geojson = osmtogeojson(response.data);

            geojson.features = geojson.features.filter(feature => feature.geometry.type !== "Point");

            return {
                status: 200,
                body: geojson
            };
        });
};

export default httpTrigger;
