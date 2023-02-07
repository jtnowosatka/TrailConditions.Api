import { TrailConditionsItem, TrailReportItem } from "../../DataAccess/types";
import { TrailConditions, TrailReport } from "./types";

export abstract class TypeConverter{

    public static convertToTrailConditions(trailConditionsItem: TrailConditionsItem) : TrailConditions {
        return {
            trailId: trailConditionsItem.trailId,
            conditions: trailConditionsItem.conditions,
            lastUpdated: trailConditionsItem.lastUpdated
        }
    }

    public static convertToTrailReport(trailReportItem: TrailReportItem): TrailReport {
        return {
            trailId: trailReportItem.trailId,
            conditions: trailReportItem.conditions,
            reportDate: trailReportItem.reportDate,
            user: trailReportItem.user,
            report: trailReportItem.report,
            images: trailReportItem.images
        }
    }

    public static convertToTrailConditionsItem(trailConditions: TrailConditions) : TrailConditionsItem {
        return {
            type: "TrailConditions",
            trailId: trailConditions.trailId,
            conditions: trailConditions.conditions,
            lastUpdated: trailConditions.lastUpdated
        }
    }

    public static convertToTrailReportItem(trailReport: TrailReport): TrailReportItem {
        return {
            type: "TrailReport",
            trailId: trailReport.trailId,
            conditions: trailReport.conditions,
            reportDate: trailReport.reportDate,
            user: trailReport.user,
            report: trailReport.report,
            images: trailReport.images
        }
    }
}