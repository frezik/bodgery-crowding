import * as DB from './src/db';
import * as Express from 'express';
import * as Handlebars from 'express-handlebars';
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
    app.engine( '.hbs', Handlebars({
        extname: '.hbs'
    }) );
    app.set( 'view engine', '.hbs' );
    app.use( Express.static( 'static' ) );
    await initRoutes( app );

    return new Promise( (resolve, reject) => {
        resolve( app );
    });
}


async function initRoutes(
    app
): Promise<void>
{
    app.get( '/', view( 'home' ) );
    app.post( '/v1/event/entry/:location/:direction', handleSetEntry );
    app.get( '/v1/event/entry/:location/:direction/:time', handleFetchEntry );

    return new Promise( (resolve, reject) => {
        resolve();
    });
}


export function view(
    name: string
    ,params?: object
): (req, res) => void
{
    if(! params) params = {};

    return async (req, res) => {
        res.render( name, params );
    };
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
        await DB.addEntry( dir, req.params[ 'location' ] );
        res.sendStatus( 201 );
    }

    return new Promise( (resolve, reject) => {
        resolve();
    });
}

async function handleFetchEntry( req, res ): Promise<void>
{
    const schema = Joi.object({
        location: Joi.string().alphanum()
        ,direction: Joi.any().allow(
            DB.Direction.IN
            ,DB.Direction.OUT
        )
        ,time: Joi.number().positive().integer()
    });

    const { error, params } = await schema.validate({
        location: req.params[ 'location' ]
        ,direction: req.params[ 'direction' ]
        ,time: req.params[ 'time' ]
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
        const count = await DB.entries(
            dir
            ,req.params[ 'location' ]
            ,req.params[ 'time' ]
        );

        res
            .status( 200 )
            // Want to send this as a bare number, but Express thinks you're 
            // trying to send an HTTP status code. Which makes it throw a 
            // deprecation warning. Appease the god of JSON by wrapping it in 
            // an array.
            .send([ count ]);
    }

    return new Promise( (resolve, reject) => {
        resolve();
    });
}
