package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"encoding/json"
	"errors"
)

//==============================================================================================================================
// save_changes - Writes to the ledger the KycProfile struct passed in a JSON format. Uses the shim file's
//                method 'PutState'.
//==============================================================================================================================
func(t *ChainCode) saveChanges(stub shim.ChaincodeStubInterface, productInfo Product)(bool, error) {

    bytes, err := json.Marshal(productInfo)

    if err != nil {
        logger.Error(err)
        return false, errors.New("Error converting patent record")
    }

    err = stub.PutState(productInfo.ProductId, bytes)
    if err != nil {
        logger.Error(err)
        return false, errors.New("Error storing patent record")
    }

    return true, nil
}

