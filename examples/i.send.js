#!/usr/bin/env node

const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        let ex='direct_logs'
          , args=process.argv.slice(2)
          , msg=args.slice(1).join(' ')||'Hello World!'
          , severity=(args.length>0)?args[0]:'info'

        ch.assertExchange(ex,'direct',{durable:false});
        ch.publish(ex,severity,new Buffer(msg));
        console.log('[x] send \'%s\'',msg);
    });
});

