import * as Events from '../app';
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
export async function connect(
    args?: Events.influxDBArgs
): Promise<any> // Influx lib does not have a typescript mapping yet
{
    if( DB ) return DB;
    if(! args ) args = ( await Events.getConf() ).influx;

    DB = new Influx.InfluxDB({
        host: args.host
        ,port: args.port
        ,username: args.username
        ,password: args.password
        ,database: args.name
        ,schema: INFLUX_SCHEMA
    });

    return new Promise( (resolve, reject) => {
        resolve( DB );
    });
}

export async function createDB(
    args?: Events.influxDBArgs
): Promise<any>
{
    if(! args ) args = ( await Events.getConf() ).influx;

    const db = new Influx.InfluxDB({
        host: args.host
        ,port: args.port
        ,username: args.username
        ,password: args.password
        ,database: "_internal"
    });
    await db.createDatabase( args.name );

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
