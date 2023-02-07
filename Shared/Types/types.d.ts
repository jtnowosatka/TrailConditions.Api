import { Feature, LineString } from "geojson";

export interface TrailFeature extends Feature {
    /**
     * The feature's geometry
     */
    geometry: LineString;
    /**
     * A value that uniquely identifies this feature
     */
    id: string;

    properties: TrailFeatureProperties;
}

export interface TrailFeatureProperties {
    name: string;

    accessType: number;

    surface: string;

    condition: string;
}

export interface User {
    id: string
}

export interface Condition {
    type: ConditionType
    level: ConditionSeverityLevel
}

export type ConditionSeverityLevel = "Go" | "Caution" | "Danger"

export type ConditionType = "Blowdowns" | "Water" | "Mud" | "Snow" | "Ice" 