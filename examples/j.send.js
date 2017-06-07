#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let ex='topic_logs'
          , args=process.argv.slice(2)
          , key=(args.length>0)?args[0]:'anonymous.info';
          , msg=args.slice(1).join(' ')||'Hello World!'

        ch.assertExchange(ex,'topic',{durable:false});
        ch.publish(ex,key,new Buffer(msg));
        console.log('[x] send %s: \'%s\'',key,msg);
    });
});

