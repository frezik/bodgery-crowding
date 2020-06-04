import * as Express from 'express';

const PORT = 3000;


export async function run( args?: {
    port?: number
}): Promise<void>
{
    if(! args ) args = {
        port: PORT
    };
    if(! args.port ) args.port = PORT;

    const app = Express();
    await initRoutes( app );
    console.log( "Listening on port " + args.port );
    app.listen( args.port );

    return new Promise( (resolve, reject) => {
        resolve();
    });
}


async function initRoutes(
    app
): Promise<void>
{
    return new Promise( (resolve, reject) => {
        resolve();
    });
}
