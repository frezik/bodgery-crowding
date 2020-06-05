import * as App from '../app';
import * as DB from '../src/db';
import * as Supertest from 'supertest';
import * as Tap from 'tap';
import { v4 as UUID } from 'uuid';

Tap.plan( 1 );


const db_name = "bodgery_entries_" + UUID();
Tap.comment( "DB name: " + db_name );


DB.createDB({
    database: db_name
}).then( async () => {
    const app = await App.makeApp();
    const agent = Supertest.agent( app );

    let response = await agent
        .post( `/v1/event/entry/front/in` );
    Tap.ok( 201 == response.statusCode,
        "Added entry" );
});
