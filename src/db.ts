import * as Influx from 'influx';

const DEFAULT_HOST = 'localhost';
const DEFAULT_DATABASE = 'bodgery_entries';

const INFLUX_SCHEMA = [
    {
        measurement: 'entries'
        ,fields: {
            dummy: Influx.FieldType.INTEGER
        }
        ,tags: [
            'direction'
            ,'location'
        ]
    }
];


export enum Direction {
    IN = "in"
    ,OUT = "out"
}


let DB;
export async function connect( args?: {
    host?: string
    ,database?: string
}): Promise<any> // Influx lib does not have a typescript mapping yet
{
    if( DB ) return DB;
    if(! args ) args = {};
    if(! args.host ) args.host = DEFAULT_HOST;
    if(! args.database ) args.database = DEFAULT_DATABASE;

    DB = new Influx.InfluxDB({
        host: args.host
        ,database: args.database
        ,schema: INFLUX_SCHEMA
    });

    return new Promise( (resolve, reject) => {
        resolve( DB );
    });
}

export async function createDB( args: {
    host?: string
    ,database: string
}): Promise<any>
{
    if(! args.host ) args.host = DEFAULT_HOST;

    const db = new Influx.InfluxDB({
        host: args.host
        ,database: "_internal"
    });
    await db.createDatabase( args.database );

    return await connect( args );
}

export async function addEntry(
    dir: Direction
    ,location: string
): Promise<void>
{
    const db = await connect();

    return db.writePoints([
        {
            measurement: 'entries'
            ,tags: {
                direction: dir
                ,location: location
            }
            ,fields: {
                dummy: 1
            }
        }
    ]);
}

export async function entries(
    dir: Direction
    ,location: string
    ,time_sec: number
): Promise<number>
{
    const db = await connect();

    const query = [
        "SELECT COUNT(dummy) as row_count"
        ," FROM entries"
        ," WHERE"
            ,` direction = '${dir}'` 
            ,` AND location = '${location}'`
            ,` AND time > now() - ${time_sec}s`
    ].join( "" );

    return new Promise( (resolve, reject) => {
        db.query( query ).then( (rows) => {
            let result: number;

            if( 0 == rows.length ) {
                result = 0;
            }
            else {
                result = rows[0][ 'row_count' ];
            }

            resolve( result );
        });
    });
}
