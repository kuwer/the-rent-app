package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorvk/rent-app/server/api-services/common"
	"github.com/gorvk/rent-app/server/api-services/common/constants"
	customTypes "github.com/gorvk/rent-app/server/api-services/common/types"
	models "github.com/gorvk/rent-app/server/api-services/models/user"
)

func DeleteUser(w http.ResponseWriter, r *http.Request) {

	var err error
	err = common.CheckHttpResponseType(w, r, http.MethodDelete)
	if err != nil {
		return
	}

	token, err := common.IsAuthenticated(r)
	if err != nil {
		common.HandleHttpError(err, w, constants.ERROR_HTTP_UNAUTHORIZED, http.StatusUnauthorized)
		return
	}

	claims := token.Claims.(*jwt.RegisteredClaims)
	_, err = models.DeleteUser(claims.Issuer)
	if err != nil {
		common.HandleDbError(err, w, constants.ERROR_DB_UNABLE_TO_DELETE_RECORD, http.StatusInternalServerError)
		return
	}

	var response customTypes.RESPONSE_PARAMETERS
	response.Result = nil
	response.IsSuccess = true
	data, err := json.Marshal(response)
	if err != nil {
		common.HandleHttpError(err, w, constants.ERROR_HTTP_UNABLE_TO_PARSE_RESPONSE, http.StatusInternalServerError)
		return
	}

	common.ExpireCookie("rent_app_jwt", w)
	_, err = w.Write(data)
	if err != nil {
		common.HandleHttpError(err, w, constants.ERROR_HTTP_UNABLE_TO_WRITE_RESPONSE, http.StatusInternalServerError)
		return
	}
}
