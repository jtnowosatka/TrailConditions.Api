import { ConditionsCombiner } from "./ConditionsUtilities";
import { Condition } from "./types";

describe("ConditionsCombiner", () => {
    test("Null or undefined conditions results in empty list", () => {
        expect(ConditionsCombiner(null)).toEqual([]);
        expect(ConditionsCombiner(undefined)).toEqual([]);
    });

    test("Empty list results in empty list", () => {
        expect(ConditionsCombiner([])).toEqual([]);
    });

    test("List with single items remains unchanged", () => {
        let conditionsList : Condition[] = [{type: "Water", level: "Go"}];
        expect(ConditionsCombiner(conditionsList)).toEqual(conditionsList);
    });

    test("Higher level item overrides lower level item", () => {
        let conditionsList : Condition[] = [{type: "Water", level: "Go"}, {type: "Water", level: "Caution"}];
        expect(ConditionsCombiner(conditionsList)).toEqual([{type: "Water", level: "Caution"}]);
    });

    test("Separate conditions don't affect each other", () => {
        let conditionsList : Condition[] = [{type: "Water", level: "Go"}, {type: "Snow", level: "Caution"}];
        expect(ConditionsCombiner(conditionsList)).toEqual(conditionsList);
    });

    test("Separate conditions with overrides don't affect each other", () => {
        let conditionsList : Condition[] = [{type: "Water", level: "Go"}, {type: "Water", level: "Caution"}, {type: "Snow", level: "Caution"}, {type: "Snow", level: "Danger"}];
        expect(ConditionsCombiner(conditionsList)).toEqual([{type: "Water", level: "Caution"}, {type: "Snow", level: "Danger"}]);
    });
});