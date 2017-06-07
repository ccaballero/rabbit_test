#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let ex='logs'

        ch.assertExchange(ex,'fanout',{durable:false});
        ch.assertQueue('',{exclusive:true},(err,q)=>{
            console.log('Waiting for message in %s, To exit press CTRL+C',q.queue);
            ch.bindQueue(q.queue,ex,'');

            ch.consume(q.queue,(msg)=>{
                console.log('[x] %s',msg.content.toString());
            },{
                noAck:true
            });
        });
    });
});

