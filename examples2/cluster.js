const amqp=require('amqplib/callback_api')
  , uuid=require('node-uuid')

// params: task

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        let exchange='cluster_exchange'
          , key=process.argv.slice(2)[0]

        channel.assertExchange(exchange,'direct',{
            durable:false
        });

        channel.assertQueue('',{
            exclusive:true
        },(error,queue)=>{
            channel.publish(exchange,key,new Buffer('task 2'),{
                correlationId:uuid.v4()
              , replyTo:queue.queue
            });

            channel.consume(queue.queue,(message)=>{
                console.log(' [.] Got %s',message.content.toString());
            },{
                noAck:false
            });

            console.log('[%s] send message',key);
        });
    });
});

