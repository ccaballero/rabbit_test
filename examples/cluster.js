const amqp=require('amqplib/callback_api')

// params: task

amqp.connect('amqp://localhost',(error,connection)=>{
    connection.createChannel((error,channel)=>{
        let exchange='cluster_exchange'
          , key=process.argv.slice(2)[0]
          , packet=JSON.stringify({})

        channel.assertExchange(exchange,'direct',{
            durable:false
        });

        //channel.publish(exchange,key,new Buffer(packet));
        //console.log('[%s] send %s',key,packet);
    });

    setTimeout(()=>{
        connection.close();
        process.exit(0);
    },500);
});

