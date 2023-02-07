declare namespace jest {
    interface Matchers<R> {
        toContainArray(value: any[]): CustomMatcherResult;
    }
}