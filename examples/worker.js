const amqp=require('amqplib/callback_api')

// params: task1 task2 task3

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        let exchange='cluster_exchange'

        channel.assertExchange(exchange,'direct',{durable:false});
        channel.prefetch(1);

        channel.assertQueue('',{
            exclusive:false
          , durable:false
        },(error,queue)=>{
            let description=['[x] waiting for a new task:']

            process.argv.slice(2).forEach((key)=>{
                description.push(key);
                channel.bindQueue(queue.queue,exchange,key);
            });

            console.log(description.join(' '));
            channel.consume(queue.queue,(message)=>{
                console.log('[x] %s %s %s %s',
                    message.fields.routingKey,
                    message.properties.replyTo,
                    message.properties.correlationId,
                    message.content.toString());

                setTimeout(()=>{
                    console.log('    Done');
//                  channel.sendToQueue(
//                      message.properties.replyTo,
//                      new Buffer('response'),{
//                          correlationId:message.properties.correlationId
//                      });
                    channel.ack(message);
                },Math.floor(Math.random()*1000));
            },{
                noAck:false
            });
        });
    });
});

