import { FeatureCollection, Position } from 'geojson';
import 'knex';
import Knex = require("knex");
import { TrailFeature } from '../../Types/types';

export class TrailsDatabase {
    constructor(private knex: Knex<any, unknown[]>) {
    }

    async getAllTrails(lowerLeft : Position, topRight: Position): Promise<FeatureCollection> {
        let query = `
            SELECT jsonb_build_object(
            'type',     'FeatureCollection',
            'features', jsonb_agg(feature)
            )
            FROM (
                SELECT jsonb_build_object(
                    'type',       'Feature',
                    'id',         gid,
                    'geometry',   ST_AsGeoJSON(geom)::jsonb,
                    'properties', to_jsonb(inputs) - 'gid' - 'geom'
                ) AS feature
                FROM (
                    SELECT * FROM trails
                    WHERE ST_Intersects(geom, ST_SetSRID(ST_MakeBox2d(ST_MakePoint(${lowerLeft[0]},${lowerLeft[1]}),ST_MakePoint(${topRight[0]},${topRight[1]})), 0))
                ) inputs
            ) features;
        `;

        try {
            let result = await this.knex.raw(query);
            return result.rows[0]["jsonb_build_object"] as FeatureCollection;
        } catch (error) {
            console.log(JSON.stringify("Error: " + error));
            throw error;
        }
    }

    async getTrails(trailIds: string[]): Promise<FeatureCollection> {
        let query = `
            SELECT jsonb_build_object(
            'type',     'FeatureCollection',
            'features', jsonb_agg(feature)
            )
            FROM (
                SELECT jsonb_build_object(
                    'type',       'Feature',
                    'id',         gid,
                    'geometry',   ST_AsGeoJSON(geom)::jsonb,
                    'properties', to_jsonb(inputs) - 'gid' - 'geom'
                ) AS feature
                FROM (
                    SELECT * FROM trails
                    WHERE gid in (${trailIds.join(",")})
                ) inputs
            ) features;
        `;

        try {
            let result = await this.knex.raw(query);
            return result.rows[0]["jsonb_build_object"] as FeatureCollection;
        } catch (error) {
            console.log(JSON.stringify("Error: " + error));
            throw error;
        }
    }

    async addTrails(features: TrailFeature[]) {
        await this.knex.transaction(async (trx: Knex.Transaction) => {

            let promises = [];
            features.forEach(async (trail: TrailFeature) => {
                promises.push(trx.raw(`
                    INSERT INTO trails (gid, name, accesstype, surface, condition, geom)
                    VALUES (
                        '${trail.id}',
                        '${escape(trail.properties.name)}',
                        '${trail.properties.accessType}',
                        '${trail.properties.surface}',
                        '${trail.properties.condition}',
                        ST_GeomFromGeoJSON(
                            '${JSON.stringify(trail.geometry)}'
                        )
                    )
                `));
            });

            await Promise.all(promises);
        });
    }

    async addFeatures(features: TrailFeature[]) {
        await this.knex.transaction(async (trx: Knex.Transaction) => {

            let promises = [];
            features.forEach(async (trail: TrailFeature) => {
                promises.push(trx.raw(`
                    INSERT INTO trails (gid, name, accesstype, surface, condition, geom)
                    VALUES (
                        '${trail.id}',
                        '${escape(trail.properties.name)}',
                        '${trail.properties.accessType}',
                        '${trail.properties.surface}',
                        '${trail.properties.condition}',
                        ST_GeomFromGeoJSON(
                            '${JSON.stringify(trail.geometry)}'
                        )
                    )
                `));
            });

            await Promise.all(promises);
        });
    }
}