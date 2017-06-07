#!/usr/bin/env node

const amqp=require('amqplib/callback_api')
  , uuid=require('node-uuid')

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        let key=process.argv.slice(2)[0]
          , replies='replies'

        channel.assertQueue(key,{
            durable:true
          , exclusive:false
        },(error,queue)=>{
            let correlationId=uuid.v4()
              , message=uuid.v4()

            channel.sendToQueue(key,new Buffer(message),{
                correlationId:correlationId
              , replyTo:replies
            });

            channel.assertQueue(replies,{
                durable:false
              , exclusive:false
            },(error,queue)=>{
                console.log('[x]');
                console.log('    key: %s',key);
                console.log('    correlationId: %s',correlationId);
                console.log('    replyTo: %s',replies);
                console.log('    message: %s',message);

                channel.consume(replies,(message)=>{
                    console.log('    [.] Got %s',message.content.toString());
                    process.exit(0);
                },{
                    noAck:true
                });
            });
        });
    });
});


