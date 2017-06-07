#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let q='hello'

        console.log('Waiting for message in %s, To exit press CTRL+C',q);
        ch.assertQueue(q,{durable:false});
        ch.consume(q,(msg)=>{
            console.log('[x] receive %s',msg.content.toString());
        },{
            noAck:true
        });
    });
});

