import * as DB from './src/db';
import * as Express from 'express';
import * as Joi from '@hapi/joi';

const PORT = 3000;


export async function run( args?: {
    port?: number
}): Promise<void>
{
    if(! args ) args = {
        port: PORT
    };
    if(! args.port ) args.port = PORT;
    const app = await makeApp( args );

    console.log( "Listening on port " + args.port );
    app.listen( args.port );

    return new Promise( (resolve, reject) => {
        resolve();
    });
}

export async function makeApp( args?: {
    port?: number
}): Promise<any> // Express doesn't have typescript mapping
{
    if(! args ) args = {
        port: PORT
    };
    if(! args.port ) args.port = PORT;

    const app = Express();
    await initRoutes( app );

    return new Promise( (resolve, reject) => {
        resolve( app );
    });
}


async function initRoutes(
    app
): Promise<void>
{
    app.post( '/v1/event/entry/:location/:direction', handleSetEntry );
    return new Promise( (resolve, reject) => {
        resolve();
    });
}


async function handleSetEntry( req, res ): Promise<void>
{
    const schema = Joi.object({
        location: Joi.string().alphanum()
        ,direction: Joi.any().allow(
            DB.Direction.IN
            ,DB.Direction.OUT
        )
    });

    const { error, params } = await schema.validate({
        location: req.params[ 'location' ]
        ,direction: req.params[ 'direction' ]
    });
    if( error ) {
        res
            .status( 400 )
            .send( error.details.map( (_) => {
                return `Key ${_.context.key} is not valid`
            } ) );
    }
    else {
        const dir: DB.Direction = 
            (req.params[ 'direction' ] == "in") ? DB.Direction.IN :
            (req.params[ 'direction' ] == "out") ? DB.Direction.OUT :
            DB.Direction.OUT;
        // TODO set location
        await DB.addEntry( dir, req.params[ 'location' ] );
        res.sendStatus( 201 );
    }

    return new Promise( (resolve, reject) => {
        resolve();
    });
}
