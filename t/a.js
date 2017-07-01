module.exports={
    before:(done)=>{
        console.log('BEFORE A');
        done();
    }
  , worker:(params,repeat,stop)=>{
        console.log('TASK WORKER',params.sequence);
        if(params.sequence<4){
            console.log('A');
            repeat();
        }else{
            stop();
        }
    }
  , after:(done)=>{
        console.log('AFTER A');
        done();
    }
};

