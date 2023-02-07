import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios from "axios";
import { TrailFeature } from "../Shared/Types/types";
import { TrailsAccessor } from "../Shared/DataAccess/DataAccess";
import { tryAndHandleError } from "../Shared/Api/Utilities/ErrorHandling";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('AddTrails called.');
    const trailIds = req.body && req.body.trailIds as string[];
    const queryTemplate = `[out:json];(way(id:{ids});>;way(bn););out;`
    const baseServiceUrl = "https://overpass-api.de/api/interpreter";

    if (!trailIds || trailIds.length === 0) {
        context.res = {
            status: 400,
            body: "Please pass a list of trails ids in the body of the requests"
        };
        return;
    }

    await tryAndHandleError(
        context,
        async () => {
            let query = queryTemplate.replace("{ids}", trailIds.join(","));

            let url = baseServiceUrl + "?data=" + encodeURIComponent(query);

            let response = await axios.get(url);

            let features: TrailFeature[] = [];
            for (let i = 0; i < trailIds.length; i++) {
                features.push(...createTrailSegmentsFromOSM(trailIds[i], response.data))
            }

            await TrailsAccessor.addTrails(features);

            return {
                status: 200,
                body: { type: "FeatureCollection", features }
            };
        });
};

const AccessTypes = {
    Foot: 1,
    Bicycle: 2,
    Horse: 4
}

const getAccessTypeFlag = function (way: any) {
    let accessType = 0;
    let foot = way.tags.foot;
    if (foot === "designated" || foot === "yes") {
        accessType |= AccessTypes.Foot;
    }

    let bicycle = way.tags.bicycle;
    if (bicycle === "designated" || bicycle === "yes") {
        accessType |= AccessTypes.Bicycle;
    }

    let horse = way.tags.horse;
    if (horse === "designated" || horse === "yes") {
        accessType |= AccessTypes.Horse;
    }

    return accessType;
}

const createTrailSegmentsFromOSM = function (trailId: string, osm: any): TrailFeature[] {
    let elements = osm.elements;

    let targetId = parseInt(trailId);

    let targetWay = null;
    let nodes = {};
    let nodesToWays = {};

    elements.forEach(element => {
        switch (element.type) {
            case "node":
                nodesToWays[element.id] = 0;
                nodes[element.id] = element;
                break;
            case "way":
                if (element.id == targetId) targetWay = element;
                element.nodes.forEach(nodeId => {
                    nodesToWays[nodeId]++;
                });
        }
    });

    if (targetWay == null) {
        throw new Error(`Could not find target way with id '${trailId}' when parsing OSM data`);
    }

    let features: TrailFeature[] = [];
    let baseFeature: TrailFeature = {
        type: "Feature",
        id: trailId + "_",
        geometry: {
            type: "LineString",
            coordinates: []
        },
        properties: {
            name: targetWay.tags.name || `Trail (${trailId})`,
            surface: targetWay.tags.surface || "Unknown",
            accessType: getAccessTypeFlag(targetWay),
            condition: "Unknown"
        }
    };

    let newFeature = copyFeature(baseFeature);

    targetWay.nodes.forEach((nodeId: number) => {
        let node = nodes[nodeId];
        newFeature.geometry.coordinates.push([node.lon, node.lat]);
        if (newFeature.geometry.coordinates.length > 1 && nodesToWays[nodeId] > 1) {
            newFeature.id += features.length;
            features.push(copyFeature(newFeature));
            newFeature = copyFeature(baseFeature);
            newFeature.geometry.coordinates.push([node.lon, node.lat]);
        }
    });

    // If the last point didn't share a common node and thus wasn't added, add it
    if (newFeature.geometry.coordinates.length > 1) {
        newFeature.id += features.length;
        features.push(copyFeature(newFeature));
    }

    return features;
}

const copyFeature = function (feature: TrailFeature): TrailFeature {
    return JSON.parse(JSON.stringify(feature));
}



export default httpTrigger;
