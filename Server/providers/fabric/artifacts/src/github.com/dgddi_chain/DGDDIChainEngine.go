package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"../mylib"
	"os"
)

var logger = shim.NewLogger("dgddi_chain")

func main() {
	logger.SetLevel(shim.LogDebug)
    logLevel, _ := shim.LogLevel(os.Getenv("SHIM_LOGGING_LEVEL"))
    shim.SetLoggingLevel(logLevel)
	err := shim.Start(new(ChainCode))
	if err != nil {
		logger.Error("Error starting patentchain chaincode: %s", err)
	}
}

//=================================================================================================================================
//   Init : Trigger at the time of chaincode deployment
//=================================================================================================================================
func (t *ChainCode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

//=================================================================================================================================
//   Invoke : Perform transactions
//=================================================================================================================================
func (t *ChainCode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	if len(args)<2{
		logger.Error(mylib.ArgumentErrorMessage)
		shim.Error(mylib.ArgumentErrorMessage)
	}

	if args[0]=="deleteDGDDIInfo" {
		return t.deleteDGDDIInfo(stub, args)
    }else if function=="query"{
		switch args[0] {
		case "getDGDDIInfoByKey":
			return t.getDGDDIInfoByKey(stub, args[0])
		default:
			logger.Error("Invalid function")
			return shim.Error("Invalid function")
		}
	}else{
		logger.Error("Unknown function call")
		return shim.Error("Unknown function call")
	}

	return shim.Success([]byte("Error in chaincode calling"))
}

