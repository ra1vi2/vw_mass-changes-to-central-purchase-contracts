/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/util/MockServer",
	"jquery.sap.xml"
], function(MockServer) {
	"use strict";
	var oMockServer;
	//var _sAppModulePath = "i2d.qm.insplot.manages1/";
	var rootPath = "rootFolder/";
	var _sLocalServicePath = "localService/";
	var _sJsonFilesModulePath = "localService/mockdata/";
	var _localUriMap = {
		"MM_PUR_CNTRLCTRMASS_UPD_ANNO_MDL": "MM_PUR_CNTRLCTRMASS_UPD_ANNO_MDL"
	};
	var _getLocalUri = function(sName, sUri, sSuffix) {
		var suffix = sSuffix ? sSuffix : ".xml";
		var localPath = _localUriMap[sName] ? _localUriMap[sName] : sUri;
		return jQuery.sap.getModulePath(_sLocalServicePath + localPath, suffix);
	};
	var _xmlResponse = function(sPath) {
		return function(oXhr) {
			var oAnnotations = jQuery.sap.sjax({
				url: sPath,
				dataType: "xml"
			}).data;
			oXhr.respondXML(200, {}, jQuery.sap.serializeXML(oAnnotations));
			return true;
		};
	};
	var _startServer = function(sAnnotationName, oDataSource) {
		var oAnnotation = oDataSource[sAnnotationName],
			sUri = oAnnotation.uri,
			sLocalUri = _getLocalUri(sAnnotationName, sUri);
		new MockServer({
			rootUri: sUri,
			requests: [{
				method: "GET",
				path: new RegExp(""),
				response: _xmlResponse(sLocalUri)
			}, {
				method: "GET",
				path: /\?sap-language=\w{2}/,
				response: _xmlResponse(sLocalUri)
			}]
		}).start();
	};
	var startSearchInfoMockServer = function() {
		new MockServer({
			rootUri: "/sap/es/ina/",
			requests: [{
				method: "GET",
				path: /GetServerInfo\?_=\d+/,
				response: function(oXhr) {
					oXhr.respondXML(404, {});
				}
			}]
		}).start();
	};
	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */
		init: function() {
			var sPath = jQuery.sap.getModulePath(rootPath);
			var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),
				sManifestUrl = sPath + "/manifest.json", //jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json"),
				sEntity = "C_PurCntrlContrItmMassUpdt",
				sErrorParam = oUriParameters.get("errorType"),
				iErrorCode = sErrorParam === "badRequest" ? 400 : 500,
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oDataSource = oManifest["sap.app"].dataSources,
				oMainDataSource = oDataSource.mainService,
				sMetadataUrl = jQuery.sap.getModulePath(_sLocalServicePath + "metadata", ".xml"),
				// ensure there is a trailing slash
				sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/",
				aAnnotations = oMainDataSource.settings.annotations;
			oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});
			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: (oUriParameters.get("serverDelay") || 1000)
			});
			// load local mock data

			//oMockServer.simulate(sPath + "/metadata.xml", sPath + "/mockdata");
			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl: sJsonFilesUrl,
				bGenerateMissingMockData: true
			});
			var aRequests = oMockServer.getRequests(),
				fnResponse = function(iErrCode, sMessage, aRequest) {
					aRequest.response = function(oXhr) {
						oXhr.respond(iErrCode, {
							"Content-Type": "text/plain;charset=utf-8"
						}, sMessage);
					};
				};
			// handling the metadata error test
			if (oUriParameters.get("metadataError")) {
				aRequests.forEach(function(aEntry) {
					if (aEntry.path.toString().indexOf("$metadata") > -1) {
						fnResponse(500, "metadata Error", aEntry);
					}
				});
			}
			// Handling request errors
			if (sErrorParam) {
				aRequests.forEach(function(aEntry) {
					if (aEntry.path.toString().indexOf(sEntity) > -1) {
						fnResponse(iErrorCode, sErrorParam, aEntry);
					}
				});
			}
			oMockServer.start();
			jQuery.sap.log.info("Running the app with mock data");
			aAnnotations.forEach(function(sAnnotationName) {
				_startServer(sAnnotationName, oDataSource);
			});
			startSearchInfoMockServer();
		},
		/**
		 * @public returns the mockserver of the app, should be used in integration tests
		 * @returns {sap.ui.core.util.MockServer} Instance of Mockserver
		 */
		getMockServer: function() {
			return oMockServer;
		}
	};
});