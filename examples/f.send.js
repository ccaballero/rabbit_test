#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let q='hello'

        ch.assertQueue(q,{durable:false});
        ch.sendToQueue(q,new Buffer('Hello World'));
        console.log('[x] send \'Hello World!\'');
    });

    /*setTimeout(()=>{
        con.close();
        process.exit(0);
    },10000);*/
});

