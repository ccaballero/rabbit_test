#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let q='rpc_queue'

        ch.assertQueue(q,{durable:false});
        ch.prefetch(1);

        console.log('Waiting for message in %s, To exit press CTRL+C');

        ch.consume(q,(msg)=>{
            let n=parseInt(msg.content.toString())
              , r=(n)=>{
                    if(n==0||n==1){
                        return n;
                    }else{
                        console.log(n);
                        return r(n-1)+r(n-2);
                    }
                }

            console.log('[x] fb(%d)',n);

            ch.sendToQueue(msg.properties.replyTo,new Buffer(r(n).toString()),{
                correlationId:msg.properties.correlationId
            });

            ch.ack(msg);
        });
    });
});

