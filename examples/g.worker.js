#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let q='task_queue'

        console.log('Waiting for message in %s, To exit press CTRL+C',q);
        ch.assertQueue(q,{durable:false});
        ch.prefetch(1);

        ch.consume(q,(msg)=>{
            let secs=msg.content.toString().split('.').length - 1;

            console.log('[x] receive %s',msg.content.toString());
            setTimeout(()=>{
                console.log('[x] done');
                ch.ack(msg);
            },secs*1000);
        },{
            noAck:false
        });
    });
});

