const amqp=require('amqplib/callback_api')
  , args=process.argv.slice(2)

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        channel.assertQueue('',{exclusive: true},(error,queue)=>{
            let correlationId=(()=>{
                return Math.random().toString()+
                    Math.random().toString()+
                    Math.random().toString();
                })()
              , number=parseInt(args[0]);

            console.log(' [x] Requesting fib(%d)',number);

            channel.consume(queue.queue,(message)=>{
                if(message.properties.correlationId==correlationId){
                    console.log(' [.] Got %s',message.content.toString());
                    setTimeout(()=>{
                        connection.close();
                        process.exit(0);
                    },500);
                }
            },{noAck: true});

            channel.sendToQueue('rpc_queue',
                new Buffer(number.toString()),{
                    correlationId:correlationId
                  , replyTo:queue.queue
                });
        });
    });
});

