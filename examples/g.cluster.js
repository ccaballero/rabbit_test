#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let q='task_queue'
          , msg=process.argv.slice(2).join(' ')||'Hello World!'

        ch.assertQueue(q,{durable:false});
        ch.sendToQueue(q,new Buffer(msg),{persistent:true});
        console.log('[x] send \'%s\'',msg);
    });
});

