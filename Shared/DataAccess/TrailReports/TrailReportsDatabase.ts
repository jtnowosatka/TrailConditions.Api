import { Container } from "@azure/cosmos"
import { ConditionsCombiner } from "../../Types/ConditionsUtilities";
import { TrailConditionsItem, TrailItemDefinition, TrailReportItem } from "../types";
import { Condition } from "../../Types/types"
import { CosmosContainerClient } from "../CosmosDb/CosmosContainerClient";

export class TrailReportsDatabase {

    constructor(private readonly client: CosmosContainerClient) { }

    async getConditionsAndReports(trailId: string): Promise<TrailItemDefinition[]> {
        let response = await this.client.readAll<TrailItemDefinition>({ partitionKey: trailId });
        return response.resources;
    }

    async addTrailReport(trailReport: TrailReportItem): Promise<TrailReportItem> {
        if (!trailReport) {
            throw new Error("Argument 'trailReport' is null or undefined");
        }

        trailReport.ttl = (60 * 60 * 24) * 30; // TTL of 30 days; (seconds in a day) * 30 

        let result = await this.getConditionsAndReports(trailReport.trailId);

        let trailReports = (result.filter(item => item.type === "TrailReport") as TrailReportItem[]).sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

        // Remove oldest report and update 
        if (trailReports.length === 5) {
            let oldest = trailReports[trailReports.length - 1];
            await this.client.deleteItem(oldest.id, oldest.trailId);
        }

        // Update the overall conditions
        let trailConditions = result.filter(item => item.type === "TrailConditions")[0] as TrailConditionsItem;

        if (!trailConditions) {
            trailConditions = {
                type: "TrailConditions",
                trailId: trailReport.trailId,
                lastUpdated: new Date().toISOString(),
                conditions: trailReport.conditions,
            }

            await this.client.createItem(trailConditions);
        } else {
            trailConditions.conditions = ConditionsCombiner(trailReports.reduce<Condition[]>((acc, item) => acc.concat(item.conditions), []).concat(trailReport.conditions));
            trailConditions.lastUpdated = new Date().toISOString();
            await this.client.updateItem(trailConditions.id, trailConditions.trailId, trailConditions);
        }
 
        // Create the new report
        let response = await this.client.createItem(trailReport);

        return response.resource;
    }
}