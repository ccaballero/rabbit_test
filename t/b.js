module.exports={
    before:(done)=>{
        console.log('BEFORE B');
        done();
    }
  , worker:(params,repeat,stop)=>{
        console.log('TASK WORKER',params.sequence);
        if(params.sequence<4){
            console.log('B');
            repeat();
        }else{
            stop();
        }
    }
  , after:(done)=>{
        console.log('AFTER B');
        done();
    }
};

