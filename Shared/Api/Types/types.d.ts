import { Condition, User } from "../../Types/types"

export interface GetTrailConditionsResponse {
    trailConditions: TrailConditions
    trailReports: TrailReport[]
}

export interface TrailConditions {
    trailId: string
    conditions: Condition[]
    lastUpdated: string
}

export interface TrailReport {
    trailId: string
    user: User
    conditions: Condition[]
    report?: string
    reportDate: string,
    images?: string[]
}