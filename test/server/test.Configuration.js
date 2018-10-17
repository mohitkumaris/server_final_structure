const assert  =  require('assert');

describe("Testing Configuration",()=>{

  it("Check AppVersion",()=>{
    var  config =  require('../../Server/config/config');

    assert.equal(config.configuration.ApiVersion,"V1");

  });

});