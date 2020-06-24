const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');
const _ = require('lodash');
const app = express();
const PORT = 3000
const client = redis.createClient(6379);


//fetches the repos by the sorting order of full name
app.get('/repos', async (req,res)=>{
    const repodata = 'githubrepodata'
    client.get(repodata,async (err, data) => {
        if (err) throw err;   
        if (data !== null) {
          res.send(JSON.parse(data));
        } else {
            let response = await fetch('https://api.github.com/search/repositories?q=javascript');
            const data = await response.json();
            var responseData = data.items.sort((a, b) => (a.full_name > b.full_name) ? 1 : -1)
            responseData = responseData.map(x=> _.pick(x,'id','node_id','name','full_name','private'))
            client.setex(repodata,3600,JSON.stringify(responseData))
            res.send(responseData);
        }
      });    
})

app.listen(PORT, () =>{
    console.log(`listening to ${PORT}`)
})