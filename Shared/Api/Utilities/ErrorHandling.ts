import { Context } from "@azure/functions"

export const tryAndHandleError = async (context: Context, action: () => Promise<{[key: string] : any}>) : Promise<void> => {
    try{
        let response = await action();
        context.res = response;
    }catch(ex){
        context.res = {
            status: 500,
            body: {
                message: ex.message,
                stack: ex.stack
            }
        }
    }
}