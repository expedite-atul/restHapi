//require hapi and server 
const Hapi = require('hapi');
const server = new Hapi.Server({
    host: 'localhost',
    port: '3000'
});
//start the server using init 
const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});
//calling init function to start the server
init();
// knexConnection for connecting MySql
const options = {
    client: 'mysql',
    connection: {
        host: 'yourhostaddress',
        user: 'youruser',
        password: 'yourpassword',
        database: 'yourDB'
    }
}
const knex = require('knex')(options);
// Routes
server.route({
    method: 'GET',
    path: '/data',
    handler: getDataHandler
});
server.route({
    method: 'GET',
    path: '/',
    handler: getMySqlDataHandler //getSqlDataHandler     
});
//getMySqlDataHandler function
async function getMySqlDataHandler(request) {
    let count = await getCount();
    console.dir(count);
    return {
        'success': true,
        'data': {
            'count': count
        }
    }
};
//get MysqldataHandler function
async function getDataHandler(request) {
    var batchSize = 1000; //your prefered batchSize
    // Count // total_records in mongo
    // 500 data as JSON object
    limit = 500; //the limit you want to get
    offset = 0;
    //let count = await getCount({});
    for (var i = 0; i < batchSize; i++) {
        if (i == 0) {
            offset = 0;
        } else {
            offset = i * limit;
        }
        let data = await getData(limit, offset);
        //data.length will return the length of the data

        return {
            'success': true,
            'data':
            {
                'data': data
            }
        }

    }
    // let data = await getData(limit, offset);
    // console.dir("data");
    // console.dir(data);

};
//return promise of count handler function
async function getCount() {
    return new Promise((resolve, reject) => {
        knex.from('tableName').count("* as total")
            .then((rows) => {
                resolve(rows[0].total)
            }).catch((err) => {
                console.log(err); throw err
            });
    });
}
// returns rows as per the limit and offset
async function getData(limit, offset) {
    return new Promise((resolve, reject) => {
        knex.from('tableName').select('id').limit(limit).offset(offset)
            .then((rows) => {
                resolve(rows);
            }).catch((err) => {
                console.log(err); throw err
            });
    });
}
