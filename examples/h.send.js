#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let ex='logs'
          , msg=process.argv.slice(2).join(' ')||'Hello World!'

        ch.assertExchange(ex,'fanout',{durable:false});
        ch.publish(ex,'',new Buffer(msg));
        console.log('[x] send \'%s\'',msg);
    });
});

