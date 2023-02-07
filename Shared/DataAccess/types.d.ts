import { ItemDefinition, Resource } from "@azure/cosmos"
import { Condition, User } from "../Types/types"

export type TrailResource = TrailItemDefinition & Resource; 

export interface TrailItemDefinition extends ItemDefinition {
    type: "TrailConditions" | "TrailReport"
    trailId: string
}

export interface TrailConditionsItem extends TrailItemDefinition {
    type: "TrailConditions"
    conditions: Condition[]
    lastUpdated: string
}

export interface TrailReportItem extends TrailItemDefinition {
    type: "TrailReport"
    user: User
    conditions: Condition[]
    report?: string
    reportDate: string,
    images?: string[]
}

