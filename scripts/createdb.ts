import * as DB from '../src/db';

const db_name = "bodgery_entries";


DB.createDB({
    database: db_name
}).then( () => {
    console.log( `Created InfluxDB definitions for "${db_name}"` );
});
