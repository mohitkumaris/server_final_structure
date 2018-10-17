package main


import (
	"../mylib"
)
//==============================================================================================================================
//	 French Custom Structure Definitions
//==============================================================================================================================

type ChainCode struct {
}

type Authorization struct{
	Products                []PrimaryProduct                 `json:"products"`
}

type Product struct{
	ProductId               string					`json:"product_id"` 
	ProductName             string					`json:"product_name"`
	ProductNature           string					`json:"product_nature"`
	GoodRegime              string					`json:"good_regime"`
	CreationDate            string                  `json:"creation_date"`
	Alerts                  []Alert                 `json:"Alerts"`
	Declarations		    []ProductDeclaration	 `json:"declartions"`
	MaxQuantity             int                      `json:"max_quantity"`	
	CurrentQuantity         int                      `json:"current_quantity"`	
	IsAuthorized   			bool                     `json:"is_authorized"`
	CurrentStatus           bool					  `json:"CurrentStatus"`
}

type PrimaryProduct struct{
ProductInfo               Product					`json:"product_info"`
SecondaryProducts         SecondaryProduct			`json:"secondary_products"`
AuthorizationInfo         Authorization				`json:"authorization_info"`
}

type SecondaryProduct struct{
ProductInfo               Product					`json:"product_info"`
RateOfReturn              int						`json:"ror"`
}

type ProductDeclaration struct{
DeclarationId             	 string					`json:"declaration_id"`
DeclaraionDate         		 string                  `json:"declaration_date"`
MovementNature         		 string                   `json:"Movement_Nature"`
Source             			 string                       `json:"source"`
Destination             	 string                       `json:"destination"`
Quantity                	 int                       `json:"quantity"`
MeasuringUnit                int                       `json:"measuring_unit"`
}

type Alert struct{

}



