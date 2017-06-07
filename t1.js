module.exports={
    before:(done)=>{
        console.log('task before');
        done();
    }
  , worker:(params,repeat,stop)=>{
        console.log('task worker',params.iteration);
        params.iteration++;

        switch(params.iteration){
            case 0:
            case 1:
                repeat(params,1);
                break;
            case 2:
                repeat(params,3);
                break;
            default:
                stop(params);
        }
    }
  , after:(done)=>{
        console.log('task after');
        done();
    }
};

