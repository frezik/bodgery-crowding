import * as App from '../app';
import * as DB from '../src/db';
import * as Supertest from 'supertest';
import * as Tap from 'tap';
import { v4 as UUID } from 'uuid';

Tap.plan( 8 );


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

    const app = await App.makeApp();
    const agent = Supertest.agent( app );

    let in_front = await agent
        .get( '/v1/event/entry/front/in/1' );
    Tap.equals( 200, in_front.statusCode,
        "Got OK response for front/in/1" );
    Tap.equals( 1, in_front.body[0],
        "Correct number returned in body for front/in/1s" );

    let out_back = await agent
        .get( '/v1/event/entry/back/out/1' );
    Tap.equals( 200, out_back.statusCode,
        "Got OK response for back/out/1" );
    Tap.equals( 2, out_back.body[0],
        "Correct number returned in body for back/out/1s" );

    return new Promise( (resolve, reject) => {
        setTimeout( async () => {
            let out_back = await agent
                .get( '/v1/event/entry/back/out/1' );
            Tap.equals( 200, out_back.statusCode,
                "Got OK response for back/out/1s after waiting" );
            Tap.equals( 0, out_back.body[0],
                "Correct number returned in body for back/out/1s after waiting" );

            let out_back_long = await agent
                .get( '/v1/event/entry/back/out/10' );
            Tap.equals( 200, out_back.statusCode,
                "Got OK response for back/out/10s after waiting" );
            Tap.equals( 0, out_back.body[0],
                "Correct number returned in body for back/out/10s after waiting" );

            resolve();
        }, 1100 );
    });
}

run();
