import * as DB from '../src/db';
import * as Tap from 'tap';
import { v4 as UUID } from 'uuid';

Tap.plan( 3 );


const db_name = "bodgery_entries_" + UUID();
Tap.comment( "DB name: " + db_name );


DB.createDB({
    database: db_name
}).then( async () => {
    await DB.addEntry( DB.Direction.IN );
    await DB.addEntry( DB.Direction.OUT );
    await DB.addEntry( DB.Direction.OUT );
    Tap.pass( "Added entries to DB" );

    const in_count = await DB.entries(
        DB.Direction.IN
        ,1
    );
    Tap.equals( in_count, 1, "One entry in" );

    const out_count = await DB.entries(
        DB.Direction.OUT
        ,1
    );
    Tap.equals( out_count, 2, "Two entries out" );
});
