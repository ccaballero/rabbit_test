#!/usr/bin/env node

const express=require('express')
  , app=express()
  , amqp=require('amqplib/callback_api')
  , uuid=require('node-uuid')
  , async=require('async')

function Runner(){}

Runner.prototype.run=function(name,task,replies){
    amqp.connect('amqp://localhost',(error,connection)=>{
        connection.createChannel((error,channel)=>{
            let repeat=true
              , loop=0
              , params={
                    sequence:0
                }

            task.before(()=>{
                async.until(
                    ()=>{
                        return !repeat;
                    },
                    (done)=>{
                        console.log('LOOP #%d',loop);
                        channel.assertQueue(name,{
                            durable:true
                          , exclusive:false
                        },(error,queue)=>{
                            let correlationId=uuid.v4()

                            channel.sendToQueue(name,
                                new Buffer(JSON.stringify(params)
                            ),{
                                correlationId:correlationId
                              , replyTo:replies
                            });

                            channel.assertQueue(replies,{
                                durable:true
                              , exclusive:false
                            },(error,queue)=>{
                                console.log('[x]');
                                console.log('    name: %s',name);
                                console.log('    correlationId: %s',correlationId);
                                console.log('    replyTo: %s',replies);

                                channel.consume(replies,(message)=>{
                                    let _message=JSON.parse(
                                        message.content.toString())

                                    console.log('    [.] Got');

                                    repeat=(_message.action=='repeat');
                                    if(repeat){
                                        params.sequence++;
                                    }

                                    done();
                                },{
                                    noAck:true
                                });
                            });
                        });

                        loop++;
                    },
                    (error,results)=>{
                        task.after(()=>{
                            params.sequence=0;
                        });
                    }
                );
            });
        });
    });
}

app.get('/',(request,response)=>{
    let tasks=request.query.t.split(',')
      , name=tasks[0]
      , task=require('./t/'+name)
      , replies='replies'
      , runner=new Runner()

    try{
        runner.run(name,task,replies);
    }catch(error){
        console.trace(error);
    }

    response.send('[OK]');
});

app.listen(3000);

