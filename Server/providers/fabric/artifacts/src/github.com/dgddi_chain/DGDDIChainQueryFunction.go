package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"../mylib"
)


//=================================================================================================================================
//   getDGDDIInfoByKey : Return patent info by key
//==================================================================================================================================
func (t *ChainCode) getDGDDIInfoByKey(stub shim.ChaincodeStubInterface, key string) pb.Response  {
	patentInfoAsBytes, err := stub.GetState(key)
	if(err != nil){
		logger.Error(mylib.GetStateErrorMessage)
		shim.Error(mylib.GetStateErrorMessage)
	}
	return shim.Success(patentInfoAsBytes)
}


