#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let ex='topic_logs'

        ch.assertExchange(ex,'topic',{durable:false});
        ch.assertQueue('',{exclusive:true},(err,q)=>{
            console.log('Waiting for message in %s, To exit press CTRL+C');

            ch.bindQueue(q.queue,ex,'error');

            ch.consume(q.queue,(msg)=>{
                console.log('[x] %s',msg.fields.routingKey,msg.content.toString());
            },{
                noAck:true
            });
        });
    });
});

