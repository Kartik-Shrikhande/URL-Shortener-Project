
const Redis=require('ioredis')
const redisClient= new Redis({
  port: 19047,
  host: 'redis-19047.c15.us-east-1-2.ec2.cloud.redislabs.com',
  username:'default',
  password: 'Kok0b7yBhs5NyqnuO36koyXirfh88Blc',
  db:0
})
 
redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

module.exports={redisClient}