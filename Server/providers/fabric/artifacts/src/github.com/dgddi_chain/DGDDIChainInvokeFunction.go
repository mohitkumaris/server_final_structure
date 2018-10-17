package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"encoding/json"
	"../mylib"
)

//=================================================================================================================================
//   deleteDGDDIInfo : Delete DGDDIInfo info from world state
//=================================================================================================================================
func (t *ChainCode) deleteDGDDIInfo(stub shim.ChaincodeStubInterface, key[] string) pb.Response {

	var productInfo Product
	patentInfoAsBytes, err := stub.GetState(key[0])
	if err != nil {
		logger.Error(err)
		shim.Error(mylib.GetStateErrorMessage)
	}

	//Unmarshalling package json string to native go structure
	err = json.Unmarshal(patentInfoAsBytes, &productInfo)
	if err != nil {
		logger.Error(err)
		return shim.Error(mylib.UnmarshalErrorMessage)
	}

	if productInfo.CurrentStatus==mylib.DRAFT {
		err = stub.DelState(key[0])
		if err !=nil {
			logger.Error(err)
			return shim.Error(mylib.DeleteStateErrorMessage)
		}
	}else {
		logger.Error("Patent is not in draft state")
		return shim.Error("Patent is not in draft state")
	}

	return shim.Success([]byte("Patent is deleted successfully"))
}

