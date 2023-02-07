import { CosmosClient } from "@azure/cosmos"
import { BlobServiceClient } from '@azure/storage-blob'
import { TrailsDatabase } from './Trails/TrailsDatabase'
import { TrailReportsDatabase } from './TrailReports/TrailReportsDatabase'
import { BlobStorage } from './AssetStorage/BlobStorage'
import 'knex';
import Knex = require("knex");
import { CosmosContainerClient } from "./CosmosDb/CosmosContainerClient"

/** Setup Trails Accessor */
const knex = Knex({
    client: "pg",
    connection: process.env.TRAILDATABASE_CONNECTION_STRING
});

export const TrailsAccessor = new TrailsDatabase(knex);

/** Setup trail reports accessor */
const cosmosClient = new CosmosClient(process.env.TRAILREPORTSDATABASE_CONNECTION_STRING);

const cosmosContainerClient = new CosmosContainerClient(cosmosClient.database("trailreports").container("trailreports"));

export const TrailReportsAccessor = new TrailReportsDatabase(cosmosContainerClient);

/** Setup asset storage accessor */
const blobClient = BlobServiceClient.fromConnectionString(process.env.REPORTIMAGESSTORAGE_CONNECTION_STRING);

const containerClient = blobClient.getContainerClient("trailconditions-images");

export const BlobStorageAccessor = new BlobStorage(containerClient);