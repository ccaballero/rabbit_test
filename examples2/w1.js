const amqp=require('amqplib/callback_api')
   , uuid=require('node-uuid')

// params: task1 task2 task3

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        channel.prefetch(1);

        process.argv.slice(2).forEach((key)=>{
            channel.assertQueue(key,{
                durable:true
              , exclusive:false
            },(error,queue)=>{
                channel.consume(key,(message)=>{
                    console.log('[x]');
                    console.log('    key: %s',message.fields.routingKey);
                    console.log('    correlationId: %s',message.properties.correlationId);
                    console.log('    replyTo: %s',message.properties.replyTo);
                    console.log('    message: %s',message.content.toString());

                    setTimeout(()=>{
                        let id=uuid.v4()

                        console.log('    Done [%s]',id);

                        channel.sendToQueue(message.properties.replyTo,
                            new Buffer('Worker reply: '+id),{
                                correlationId:message.properties.correlationId
                            });

                        channel.ack(message);
                    },Math.floor(Math.random()*10000));
                },{
                    noAck:false
                });
            });
        });
    });
});

