module.exports =  {
    RandomNumber : function(length =1){
        var randomNumber  = Math.random();
        for(var count = 0; count < length; count++){
           randomNumber = randomNumber  * 10;
        }
        return  Math.floor(randomNumber);
   },

   RandomString : function (){
       return  Math.random().toString(36).substring(2);
   }

}