import { CosmosContainerClient, } from "../CosmosDb/CosmosContainerClient";
import { TrailReportsDatabase } from "./TrailReportsDatabase";
import { mocked } from 'ts-jest/utils';
import { MockedFunction, MockedObject, MockedObjectDeep } from "ts-jest/dist/utils/testing";
import { FeedResponse, ItemDefinition, ItemResponse } from "@azure/cosmos";
import { TrailItemDefinition, TrailReportItem } from "../types";
import { ConditionsCombiner } from "../../Types/ConditionsUtilities";
import { Condition } from "../../Types/types";
// import { TrailConditionsItem, TrailItemDefinition, TrailReportItem } from "./types";
// import { Condition } from "../Types/types"

jest.mock("../CosmosDb/CosmosContainerClient");
jest.mock("../../Types/ConditionsUtilities");


let clientMock: MockedObjectDeep<CosmosContainerClient>
let mockCombiner: MockedFunction<(allConditions: Condition[]) => Condition[]>
let accessor: TrailReportsDatabase;

beforeEach(() => {
    clientMock = mocked(new CosmosContainerClient(null), true);
    accessor = new TrailReportsDatabase(clientMock);
    mockCombiner = mocked(ConditionsCombiner);
})

describe("getConditionsAndReports", () => {
    beforeEach(() => {
        let testData: TrailItemDefinition[] = [
            {
                type: "TrailConditions",
                trailId: "id"
            }
        ]

        clientMock.readAll.mockResolvedValue(new FeedResponse(testData, null, false));
    });

    test("List of reports returned", async () => {
        let resources = await accessor.getConditionsAndReports("testId");
        expect(resources).not.toBeNull();
    })
})

describe("addTrailReport", () => {
    beforeEach(() => {
        clientMock.createItem.mockImplementation((item: TrailReportItem, options) => {
            let resource = {
                ...item,
                id: item.id,
                _rid: null,
                _ts: 1,
                _self: null,
                _etag: ""
            }

            return Promise.resolve(new ItemResponse(resource, null, 201, 201, null))
        });

        mockCombiner.mockReturnValue([]);
    })

    test("Null report throw error", async () => {
        await expect(() => accessor.addTrailReport(null))
            .rejects
            .toThrowError();
    })

    test("Add new trail report to new document", async () => {
        // Arrange
        let newTrailReport = {
            conditions: [],
            trailId: "trailId",
            type: "TrailReport",
            user: {
                id: "userId"
            },
        } as TrailReportItem;

        let expectedTrailConditions = {
            type: "TrailConditions",
            trailId: newTrailReport.trailId,
            conditions: newTrailReport.conditions,
        }

        clientMock.readAll.mockResolvedValue(new FeedResponse([], null, false));

        // Act
        let createdTrailReport = await accessor.addTrailReport(newTrailReport);

        // Assert
        expect(clientMock.createItem.mock.calls.length).toBe(2);
        expect(clientMock.createItem.mock.calls[0][0]).toMatchObject(expectedTrailConditions);
        expect(clientMock.createItem.mock.calls[1][0]).toMatchObject(newTrailReport);
        expect(createdTrailReport).toMatchObject(newTrailReport);

        expect(clientMock.deleteItem).not.toHaveBeenCalled();
        expect(clientMock.updateItem).not.toHaveBeenCalled();
    });

    test("Add new report to trail with less than 5 existing reports", async () => {
        // Arrange
        let newTrailReport = {
            conditions: [],
            trailId: "trailId",
            type: "TrailReport",
            user: {
                id: "userId"
            },
        } as TrailReportItem;

        let expectedTrailConditions = {
            id: "docId",
            type: "TrailConditions",
            trailId: "trailId",
            conditions: [],
        };

        let expectedConditions : Condition[] = [{type: "Snow", level: "Go"}];

        let existingReports: Partial<TrailReportItem>[] = [];
        for (let i = 0; i < 4; i++) {
            existingReports.push({
                id: i.toString(),
                conditions: [],
                trailId: "trailId",
                type: "TrailReport",
                ttl: (60 * 60 * 24) * 30,
                reportDate: new Date(2020, 1, i, 0, 0, 0, 0).toISOString(),
                user: {
                    id: "userId" + i
                },
            });
        }

        clientMock.readAll.mockResolvedValue(new FeedResponse([expectedTrailConditions, ...existingReports], null, false));
        mockCombiner.mockReturnValue(expectedConditions);

        // Act
        let createdTrailReport = await accessor.addTrailReport(newTrailReport);

        // Assert
        expect(clientMock.updateItem.mock.calls.length).toBe(1);
        expect(clientMock.updateItem.mock.calls[0][0]).toBe(expectedTrailConditions.id);
        expect(clientMock.updateItem.mock.calls[0][1]).toMatchObject({...expectedTrailConditions, conditions: expectedConditions});

        expect(clientMock.createItem.mock.calls.length).toBe(1);
        expect(clientMock.createItem.mock.calls[0][0]).toMatchObject(newTrailReport);
        expect(createdTrailReport).toMatchObject(newTrailReport);

        expect(clientMock.deleteItem).not.toHaveBeenCalled();
    });

    test("Add new report to trail with 5 existing reports", async () => {
        // Arrange
        let newTrailReport = {
            conditions: [],
            trailId: "trailId",
            type: "TrailReport",
            user: {
                id: "userId"
            },
        } as TrailReportItem;

        let expectedTrailConditions = {
            id: "docId",
            type: "TrailConditions",
            trailId: "trailId",
            conditions: [],
        };

        let expectedConditions : Condition[] = [{type: "Snow", level: "Go"}];

        let existingReports: Partial<TrailReportItem>[] = [];
        for (let i = 0; i < 5; i++) {
            existingReports.push({
                id: i.toString(),
                conditions: [],
                trailId: "trailId",
                type: "TrailReport",
                ttl: (60 * 60 * 24) * 30,
                reportDate: new Date(2020, 1, i, 0, 0, 0, 0).toISOString(),
                user: {
                    id: "userId" + i
                },
            });
        }

        clientMock.readAll.mockResolvedValue(new FeedResponse([expectedTrailConditions, ...existingReports], null, false));
        mockCombiner.mockReturnValue(expectedConditions);

        // Act
        let createdTrailReport = await accessor.addTrailReport(newTrailReport);

        // Assert
        expect(clientMock.deleteItem.mock.calls.length).toBe(1);
        expect(clientMock.deleteItem.mock.calls[0][0]).toBe(existingReports[0].id);

        expect(clientMock.updateItem.mock.calls.length).toBe(1);
        expect(clientMock.updateItem.mock.calls[0][0]).toBe(expectedTrailConditions.id);
        expect(clientMock.updateItem.mock.calls[0][1]).toMatchObject({...expectedTrailConditions, conditions: expectedConditions});

        expect(clientMock.createItem.mock.calls.length).toBe(1);
        expect(clientMock.createItem.mock.calls[0][0]).toMatchObject(newTrailReport);
        expect(createdTrailReport).toMatchObject(newTrailReport);
    });
})
