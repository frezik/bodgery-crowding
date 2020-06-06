import * as App from '../app';
import * as DB from '../src/db';
import * as Tap from 'tap';
import { v4 as UUID } from 'uuid';

Tap.plan( 4 );


const db_name = "bodgery_entries_" + UUID();
Tap.comment( "DB name: " + db_name );


async function run(): Promise<void>
{
    const conf = await App.getConf();
    conf.influx.name = db_name;
    await DB.createDB();
    await DB.addEntry( DB.Direction.IN, "front" );
    await DB.addEntry( DB.Direction.IN, "back" );
    await DB.addEntry( DB.Direction.OUT, "back" );
    await DB.addEntry( DB.Direction.OUT, "back" );
    await DB.addEntry( DB.Direction.OUT, "front" );
    Tap.pass( "Added entries to DB" );

    const in_count = await DB.entries(
        DB.Direction.IN
        ,"front"
        ,1
    );
    Tap.equals( in_count, 1, "One entry in" );

    const out_count = await DB.entries(
        DB.Direction.OUT
        ,"back"
        ,1
    );
    Tap.equals( out_count, 2, "Two entries out back" );

    const out_front_count = await DB.entries(
        DB.Direction.OUT
        ,"front"
        ,1
    );
    Tap.equals( out_front_count, 1, "One entries out front" );

    return new Promise( (resolve) => resolve() );
}

run();
