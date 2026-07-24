export async function promisedTimeout<T>(func: () => Promise<T>, timeout: number): Promise<T> {
    return await new Promise<T>((resolve, reject) => {
        setTimeout(async () => {
            try {
                const result = await func();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }, timeout);
    });
}
