#!/usr/bin/env node

const express=require('express')
  , app=express()
  , amqp=require('amqplib/callback_api')
  , uuid=require('node-uuid')
  , async=require('async')

var sequence=0
  , loop=0
  , name=''

function Runner(n){
    var self=this

    loop=0;
    sequence=0

    console.log('Instantiate new runner ',n);
    this.repeat=true;
    name=n;
};

Runner.prototype.run=function(channel,replies){
    let self=this
      , before=require('./t/'+name).before

    before(function(){
        async.until(
            function(){
                return !self.repeat;
            },
            function(done){
                console.log('LOOP #%d',loop);
                channel.assertQueue(name,{
                    durable:true
                  , exclusive:false
                },function(error){
                    let correlationId=uuid.v4()

                    channel.sendToQueue(name,
                        new Buffer(JSON.stringify({
                            sequence:sequence
                        })
                    ),{
                        correlationId:correlationId
                      , replyTo:replies
                    });
                });

                channel.assertQueue(replies,{
                    durable:true
                  , exclusive:false
                },function(error){
                    let correlationId=''

                    console.log('[x] name: %s',name);
                    console.log('    correlationId: %s',correlationId);
                    console.log('    replyTo: %s',replies);

                    channel.consume(replies,(message)=>{
                        let _message=JSON.parse(
                            message.content.toString())

                        console.log('    [.] Got');

                        self.repeat=(_message.action=='repeat');
                        if(self.repeat){
                            sequence++;
                            done(null);
                        }else if(_message.action=='stop'){
                            let after=require('./t/'+name).after
                            after(function(){});
                        }
                    },{
                        noAck:true
                    });
                });

                loop++;
            },
            function(error,results){}
        );
    });
}

app.get('/',(request,response)=>{
    let tasks=request.query.t.split(',')
      , name=tasks[0]
      , replies='replies'

    amqp.connect('amqp://localhost',function(error,connection){
        connection.createChannel(function(error,channel){
            try{
                new Runner(name).run(channel,replies);
            }catch(error){
                console.trace(error);
            }
        });
    });

    response.send('[OK]');
});

app.listen(3000);

