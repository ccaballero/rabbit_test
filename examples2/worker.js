const amqp=require('amqplib/callback_api')
   , uuid=require('node-uuid')

// params: task1 task2 task3

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        let exchange='cluster_exchange'

        channel.prefetch(1);
        channel.assertExchange(exchange,'direct',{
            durable:false
        });

        channel.assertQueue('',{
            exclusive:false
          , durable:true
        },(error,queue)=>{
            let description=['[x] waiting for a new task:']
              , id=uuid.v4()

            process.argv.slice(2).forEach((key)=>{
                description.push(key);
                channel.bindQueue(queue.queue,exchange,key);
            });

            console.log(description.join(' '));
            channel.consume(queue.queue,(message)=>{
                console.log('[x] %s %s %s %s',
                    message.fields.routingKey,
                    message.properties.correlationId,
                    message.properties.replyTo,
                    message.content.toString());

                setTimeout(()=>{
                    console.log('    Done %s',id);

                    channel.sendToQueue(message.properties.replyTo,
                        new Buffer('worker says: '+id),{
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

