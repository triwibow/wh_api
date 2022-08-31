require('dotenv').config();
var zlib = require('zlib');
var path = require('path');
const fs = require('fs'); 
var tar = require('tar-stream');

const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;

var exec = require('child_process').exec;

const routerV1 = require('./src/routes/routeV1');
const e = require('express');



app.use(express.json());
app.use(express.static('uploads'));
app.use(cors())

app.use('/api/v1/', routerV1);
app.listen(port, () => console.log(`Listening on port ${port}`));

var child = exec(wget, function(err, stdout, stderr) {
    if(err){
        throw(err);
    } else {
        exec(run) 
    }
});