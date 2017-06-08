module.exports={
    before:(done)=>{
        console.log('task before');
        done();
    }
  , worker:(params,repeat,stop)=>{
        console.log('task worker',params.sequence);
        if(params.sequence<10){
            repeat();
        }else{
            stop();
        }
    }
  , after:(done)=>{
        console.log('task after');
        done();
    }
};

