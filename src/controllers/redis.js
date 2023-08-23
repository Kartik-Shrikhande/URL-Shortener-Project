const redis = require("redis");    //

//--------------------------------------------- Connect to the redis server-----------------------------------------------------------------//

const { createClient }= require ('redis');

const redisClient = createClient({
    password: 'Kok0b7yBhs5NyqnuO36koyXirfh88Blc',
    socket: {
        host: 'redis-19047.c15.us-east-1-2.ec2.cloud.redislabs.com',
        port: 19047
    }
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

module.exports={redisClient}

