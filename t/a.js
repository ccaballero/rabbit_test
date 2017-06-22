module.exports={
    before:(done)=>{
        console.log('TASK BEFORE');
        done();
    }
  , worker:(params,repeat,stop)=>{
        console.log('TASK WORKER',params.sequence);
        if(params.sequence<10){
            repeat();
        }else{
            stop();
        }
    }
  , after:(done)=>{
        console.log('TASK AFTER');
        done();
    }
};

