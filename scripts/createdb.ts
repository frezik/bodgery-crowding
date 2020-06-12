import * as DB from '../src/db';


DB.createDB().then( () => {
    console.log( `Created InfluxDB definitions` );
});
