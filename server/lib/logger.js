
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: LOGGER_CONNECTION,
    // auth: {
    //     username: 'root',
    //     password: 'R3Nhu7X0m7o7Nhu7Khu'
    // }
});

exports.insert = (data, index) => {
    client.index({
        index: index || 'default',
        body: data
    })
}