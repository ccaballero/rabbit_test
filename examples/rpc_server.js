const amqp=require('amqplib/callback_api')

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        let q='rpc_queue'

        channel.assertQueue(q,{durable:false});
        channel.prefetch(1);
        console.log(' [x] Awaiting RPC requests');

        channel.consume(q,(message)=>{
            let n=parseInt(message.content.toString())
              , f=(n)=>{
                    if(n==0||n==1){
                        return n;
                    }else{
                        return f(n-1)+f(n-2);
                    }
                }
              , r=f(n)

            console.log(' [.] fib(%d)',n);

            channel.sendToQueue(message.properties.replyTo,
                new Buffer(r.toString()),{
                    correlationId:message.properties.correlationId
                });

            channel.ack(message);
        });
    });
});
