#!/usr/bin/env node

const amqp=require('amqplib/callback_api')
  , uuid=require('node-uuid')
  , async=require('async')
  , task=require('./t1')

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        let name='exclusive'
          , replies='replies'
          , repeat=true
          , loop=0
          , params={
                sequence:0
            }

        task.before(()=>{
            async.until(
                ()=>{
                    return !repeat;
                },
                (done)=>{
                    console.log('LOOP #%d',loop);
                    channel.assertQueue(name,{
                        durable:true
                      , exclusive:false
                    },(error,queue)=>{
                        let correlationId=uuid.v4()

                        channel.sendToQueue(name,
                            new Buffer(JSON.stringify(params)
                        ),{
                            correlationId:correlationId
                          , replyTo:replies
                        });

                        channel.assertQueue(replies,{
                            durable:true
                          , exclusive:false
                        },(error,queue)=>{
                            console.log('[x]');
                            console.log('    name: %s',name);
                            console.log('    correlationId: %s',correlationId);
                            console.log('    replyTo: %s',replies);

                            channel.consume(replies,(message)=>{
                                let _message=JSON.parse(
                                    message.content.toString())

                                console.log('    [.] Got');

                                repeat=(_message.action=='repeat');
                                if(repeat){
                                    params.sequence++;
                                }

                                done();
                            },{
                                noAck:true
                            });
                        });
                    });

                    loop++;
                },
                (error,results)=>{
                    task.after(()=>{
                        params.sequence=0;
                        process.exit(0);
                    });
                }
            );
        });
    });
});

