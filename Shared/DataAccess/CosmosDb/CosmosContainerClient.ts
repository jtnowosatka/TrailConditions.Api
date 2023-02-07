import { Container, FeedOptions, FeedResponse, ItemResponse, RequestOptions } from "@azure/cosmos";

export class CosmosContainerClient {
    constructor(private readonly container: Container) {
    }

    async readAll<T>(options: FeedOptions): Promise<FeedResponse<T>> {
        return this.container.items.readAll<T>(options).fetchAll()
    }

    async createItem<T>(item: T, options?: RequestOptions): Promise<ItemResponse<T>> {
        return this.container.items.create<T>(item, options);
    }

    async readItem<T>(itemId: string, partitionKey: string, options?: RequestOptions): Promise<ItemResponse<T>> {
        return this.container.item(itemId, partitionKey).read(options);
    }

    async updateItem<T>(itemId: string, partitionKey: string, item: T, options?: RequestOptions): Promise<ItemResponse<T>> {
        return this.container.item(itemId, partitionKey).replace<T>(item, options);
    }

    async deleteItem<T>(itemId: string, partitionKey: string, options?: RequestOptions): Promise<ItemResponse<T>> {
        return this.container.item(itemId, partitionKey).delete<T>(options);
    }
}