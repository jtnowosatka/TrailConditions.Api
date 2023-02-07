import { Condition, ConditionSeverityLevel, ConditionType } from "./types"

const ConditionSeverityMap: { [C in ConditionSeverityLevel]: number } = {
    "Go": 0,
    "Caution": 10,
    "Danger": 20,
}

interface ConditionCombination {
    condition: Condition,
    value: number
}

export const ConditionsCombiner = (allConditions: Condition[]): Condition[] => {
    if(!allConditions){
        return [];
    }

    let conditions: { [key: string]: ConditionCombination } = {};
    allConditions.forEach(condition => {
        let value = ConditionSeverityMap[condition.level];
        if (!conditions[condition.type] || conditions[condition.type].value < value) {
            conditions[condition.type] = {
                condition,
                value
            }
        }
    });

    return Object.keys(conditions).map<Condition>(key => conditions[key].condition);
}