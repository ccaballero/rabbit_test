#!/usr/bin/env node

const amqp=require('amqplib/callback_api')
  , uuid=require('node-uuid')
  , args=process.argv.slice(2)

amqp.connect('amqp://localhost',(err,con)=>{
    con.createChannel((err,ch)=>{
        ch.assertQueue('',{exclusive:true},(err,q)=>{
            let corr=uuid.v4()
              , num=parseInt(args[0]);

            console.log('[x] request fib(%d)',num);

            ch.consume(q.queue,(msg)=>{
                if(msg.properties.correlationId==corr){
                    console.log('[.] Get %s',msg.content.toString());
                    setTimeout(()=>{con.close();process.exit(0)},500);
                }
            },{noAck:true});

            ch.sendToQueue('rpc_queue',new Buffer(num.toString()),{
                correlationId:corr,replyTo:q.queue});
        });
    });
});

