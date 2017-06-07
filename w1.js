const amqp=require('amqplib/callback_api')
  , uuid=require('node-uuid')
  , task=require('./t1')

// params: task1 task2 task3

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        channel.prefetch(1);

        ['exclusive'].forEach((key)=>{
            channel.assertQueue(key,{
                durable:true
              , exclusive:false
            },(error,queue)=>{
                channel.consume(key,(message)=>{
                let name=message.fields.routingKey
                  , correlationId=message.properties.correlationId
                  , replyTo=message.properties.replyTo
                  , content=JSON.parse(message.content.toString())
                  , messages=[]

                    console.log('[x]');
                    console.log('    name: %s',name);
                    console.log('    correlationId: %s',correlationId);
                    console.log('    replyTo: %s',replyTo);

                    task.worker(content,
                        (params,nodes)=>{
                            console.log('    Done [REPEAT]');
                            channel.sendToQueue(replyTo,
                                new Buffer(JSON.stringify({
                                    action:'repeat'
                                  , nodes:nodes
                                  , params:params
                                  , messages:messages
                                })),{
                                    correlationId:correlationId
                                });

                            messages=[];
                            channel.ack(message);
                        },
                        (params)=>{
                            console.log('    Done [STOP]');
                            channel.sendToQueue(replyTo,
                                new Buffer(JSON.stringify({
                                    action:'stop'
                                  , params:params
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

