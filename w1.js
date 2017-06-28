const amqp=require('amqplib/callback_api')
  , uuid=require('node-uuid')

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        channel.prefetch(1);

        ['a','b'].forEach((key)=>{
            channel.assertQueue(key,{
                durable:true
              , exclusive:false
            },(error,queue)=>{
                channel.consume(key,(message)=>{
                    let name=message.fields.routingKey
                      , correlationId=message.properties.correlationId
                      , replyTo=message.properties.replyTo
                      , task=require('./t/'+name)
                      , params=JSON.parse(message.content.toString())
                      , messages=[]

                    console.log('[x] name: %s',name);
                    console.log('    correlationId: %s',correlationId);
                    console.log('    replyTo: %s',replyTo);

                    task.worker(params,
                        ()=>{
                            console.log('    Done [REPEAT]');
                            channel.sendToQueue(replyTo,
                                new Buffer(JSON.stringify({
                                    action:'repeat'
                                  , messages:messages
                                })),{
                                    correlationId:correlationId
                                });

                            messages=[];
                            channel.ack(message);
                        },
                        ()=>{
                            console.log('    Done [STOP]');
                            channel.sendToQueue(replyTo,
                                new Buffer(JSON.stringify({
                                    action:'stop'
                                  , messages:messages
                                })),{
                                    correlationId:correlationId
                                });

                            messages=[];
                            channel.ack(message);
                        },
                        (message)=>{
                            console.log(message);
                            messages.push(message);
                        }
                    );
                },{
                    noAck:false
                });
            });
        });
    });
});

