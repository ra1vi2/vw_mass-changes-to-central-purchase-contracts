/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (mockServer2) {
	"use strict";
	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */
		init: function () {
			var sPath = "localService/mockdata/"; //Path to the mockdata 
			var sMockServerUrl = "/sap/opu/odata";
			var oMockServer1 = new mockServer2({
				rootUri: sMockServerUrl
			});
			var aRequests = oMockServer1.getRequests();
			aRequests.push({
				method: "GET",
				path: new RegExp(".*CA_FM_FEATURE_TOGGLE_STATUS_SRV/ToggleStatusSet.*"),
				response: function (oXhr, sUrlParams) {
					var sFtglJsonPath = jQuery.sap.getModulePath(sPath) + "/GetFeaturesAsync.json";
					var oResponse = jQuery.sap.sjax({
						url: sFtglJsonPath
					});
					var oResult = oResponse.data;
					oXhr.respondJSON(200, {}, oResult);
					return true;
				}
			});
			oMockServer1.setRequests(aRequests);
			oMockServer1.start();
		}
	};
});