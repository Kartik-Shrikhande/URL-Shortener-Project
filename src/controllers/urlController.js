const urlModel = require('../models/urlModel')
const shortId = require('shortid')
const ValidUrl=require("valid-url")
const axios = require('axios')
const {redisClient}=require('./redis')

//-------------------------------------------CreateUrl--------------------------------------------------------------------------------------//

const createUrl = async function(req,res){
    try{
        const {longUrl} = req.body

        // ---------------------------Check Body is empty or not----------------------------------/
        if(Object.keys(req.body).length==0)return res.status(400).send({status:false, message:"Please provide data in request body"})
        
        //---------------------------Check Url is valid or not----------------------------------/
        if(!(ValidUrl.isUri(longUrl)))return res.status(400).send({status:false, message:"Invalid longUrl"})

        //---------------------------Check Url exist or not----------------------------------/
        
        let checkUrlExistence = await axios.get(longUrl)
        .then(()=>longUrl)
        .catch(()=>null)
        if(!checkUrlExistence)return res.status(404).send({status:false, message:"Url does not exist"})

       /*--------------------get data from redis(cache) server----------------------*/
       
       let cachedData = await redisClient.get(longUrl);
        if (cachedData) {return res.status(200).send({status:true, data:JSON.parse(cachedData)})}
        
        //---------------------------Check Url is present in DB or not----------------------------------/
        
        let longUrlFound = await urlModel.findOne({longUrl:longUrl}).select({urlCode:1,longUrl:1,shortUrl:1, _id:0})
        if(longUrlFound)return res.status(200).send({status:true, data:longUrlFound})

        //---------------------------Generate random short alpha-num characters----------------------------------/
        
        const genShortUrl = shortId.generate().toLowerCase()

        //-------------------------Assigning data to req body------------------------------------/
        
        req.body.urlCode = genShortUrl
        req.body.shortUrl = `http://localhost:3000/${genShortUrl}`

        //---------------------------Creating data----------------------------------/
        
        let createData = await urlModel.create(req.body)
        
        //---------------------------Creating a custom object to match response----------------------------------/
        
        let obj = {
            urlCode : createData.urlCode,
            longUrl : createData.longUrl,
            shortUrl : createData.shortUrl
        }

         /*--------------------set data to redis(cache) server----------------------*/

     await redisClient.set(longUrl, JSON.stringify(obj)); //convert into string
     await redisClient.expire(longUrl,80); //set expire 60 seconds

        return res.status(201).send({status:true, data:obj})
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

//---------------------------------------------getUrl-------------------------------------------------------------------------------------------//

const getUrl = async function(req, res){
    try{
        let urlCode = req.params.urlCode

        /*--------------------get data from redis(cache) server----------------------*/
   
       let cachedData = await redisClient.get(urlCode);
        if (cachedData) {return res.status(302).redirect(cachedData)} 
   
       //---------------------------Check urlCode is present in DB or not----------------------------------/
      
       let foundUrl = await urlModel.findOne({urlCode:urlCode})
   
       if(!foundUrl)return res.status(404).send({status:false, message:"short url does not exit"})
   
       /*--------------------set data to redis(cache) server----------------------*/
       
       await redisClient.set(urlCode, foundUrl.longUrl);
       await redisClient.expire(urlCode,80); //set expire 60 seconds
   
       return res.status(302).redirect(foundUrl.longUrl)
    }
    catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
   
}

module.exports.createUrl = createUrl
module.exports.getUrl = getUrl