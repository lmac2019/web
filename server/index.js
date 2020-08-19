const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');


const app = express();

const db = monk(process.env.MONGO_URI || 'localhost/messages');
const messages = db.get('messages');
const filter = new Filter();

app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.json({
        message: 'hello world'
    });
});

app.get('/messages',(req,res)=>{
    messages
        .find()
        .then(messages =>{
            res.json(messages);
        });
});

app.use(rateLimit({
    windowMs: 30 * 1000,
    max: 10
}));

function isValidMessage(message){
    return message.name && message.name.toString().trim() != '' &&
    message.content && message.content.toString().trim() != '';
}

app.post('/messages', (req,res)=>{
    if(isValidMessage(req.body)){
        const message = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        }
        messages
            .insert(message)
            .then(createdMessage =>{
                res.json(createdMessage);
            });
        
    }else{
        res.status(422);
        res.json({
            message: 'Name and Message is required'
        });
    }
});

app.listen(5000,()=>{
    console.log('Listising on http://localhost:5000');
});