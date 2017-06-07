const amqp=require('amqplib')
  , uuid=require('node-uuid')

amqp.connect('amqp://localhost')
.then((connection)=>{
    return connection.createChannel();
})

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        let exchange='cluster_exchange'

        channel.assertExchange(exchange,'direct',{
            durable:false
        });

        channel.assertQueue('',{
            exclusive:true
        },(error,queue)=>{
            channel.publish(exchange,'exclusive',new Buffer(JSON.stringify({
                count:10
              , interval:1000
            })),{
                correlationId:uuid.v4()
              , replyTo:queue.queue
            });

            channel.consume(queue.queue,(message)=>{
                console.log(' [.] Got %s',message.content.toString());
                process.exit(0);
            },{
                noAck:false
            });

            console.log('[%s] send message');
        });
    });
});

