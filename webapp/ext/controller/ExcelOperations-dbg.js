/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/UploadCollectionParameter"
], function (MessageBox, UploadCollectionParameter) {
	"use strict";

	// File  having the functions for Excel Download
	var ExcelOperations = {
		appliedFilter: undefined,
		isFilterSet: undefined,
		isInclExclSet: undefined,
		isSimulate: undefined,
		uploadedFileName: "",
		//function to handle the Enable feature of download button
		fnDownloadButtonEnableDisable: function (oEvent) {
			this.ExcelDataCount = 0;
			if (oEvent.getParameters().url.indexOf("C_PurCntrlContrMassUpdt/$count") >= 0) {
				this.appliedFilter = this.getView().byId("listReportFilter").getFilters();
				if (oEvent.getParameters().response && oEvent.getParameters().response.responseText && oEvent.getParameters().response.responseText !==
					"0") {
					this.ExcelDataCount = parseInt(oEvent.getParameters().response.responseText, 10);
				}
				if (this.ExcelDataCount > 0) {
					this.getView().byId(
						"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--action::ActionExcelDownload"
					).setEnabled(true);
					sap.ui.getCore().byId("downloadBtn").setEnabled(true);
					sap.ui.getCore().byId("downloadCctrBtn").setEnabled(true);
					sap.ui.getCore().byId("downloadHctrBtn").setEnabled(true);
				} else {
					this.getView().byId(
						"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--action::ActionExcelDownload"
					).setEnabled(false);
					sap.ui.getCore().byId("downloadBtn").setEnabled(false);
					sap.ui.getCore().byId("downloadCctrBtn").setEnabled(false);
					sap.ui.getCore().byId("downloadHctrBtn").setEnabled(false);
				}
			} else if (oEvent.getParameters().url.indexOf("C_CntrlPurContrHierMassUpdt/$count") >= 0) {
				this.appliedFilter = this.getView().byId("listReportFilter").getFilters();
				if (oEvent.getParameters().response && oEvent.getParameters().response.responseText && oEvent.getParameters().response.responseText !==
					"0") {
					this.ExcelDataCount = parseInt(oEvent.getParameters().response.responseText, 10);
				}
				if (this.ExcelDataCount > 0) {
					sap.ui.getCore().byId("downloadBtn").setEnabled(true);
					sap.ui.getCore().byId("downloadHctrBtn").setEnabled(true);
				} else {
					sap.ui.getCore().byId("downloadHctrBtn").setEnabled(false);
				}
			}
		},

		//click on download
		OnClickExcelDownload: function () {
			var that = this;
			var url = "/C_PurCntrlContrItmMassUpdt";
			var sPath = "/PurCntrlContrDownloadExcelSet(ExcelName='MCCPC_Excel.xlsx')";

			//calling preparePayload method to form inclusion/exclusion object which will be passed for download
			var inclExclArray = {},
				inclFilt = {},
				exclFilt = {},
				filtersWithInclExcl;
			inclExclArray = that._preparePayloadAsPerScenario(inclExclArray, "ME");

			inclFilt = {
				sPath: "PurchasingDocInclusionList",
				sOperator: "EQ",
				oValue1: inclExclArray.PurchasingDocInclusionList
			};
			exclFilt = {
				sPath: "PurchasingDocExclusionList",
				sOperator: "EQ",
				oValue1: inclExclArray.PurchasingDocExclusionList
			};
			filtersWithInclExcl = JSON.parse(JSON.stringify(this.appliedFilter));

			if (inclFilt.oValue1 !== undefined) {
				filtersWithInclExcl.push(inclFilt);
			}
			if (exclFilt.oValue1 !== undefined) {
				filtersWithInclExcl.push(exclFilt);
			}

			//flag to indicate that the call is from Excel Download
			this.getView().getModel().setHeaders({
				"DownloadExcel": "X"
			});
			//read call to item entity set for passing filters
			this.isFilterSet = true;
			this.getOwnerComponent().getModel().read(url, {
				groupId: "Changes",
				filters: filtersWithInclExcl,
				urlParameters: {
					"$top": "1"
				}
			});

			// if (this.appliedFilter && this.appliedFilter.length > 0) {

			// 	//check if it is inclusion in both the tabs, then no need to pass filters	
			// 	if (inclExclArray.PurchasingDocInclusionList !== undefined) {
			// 		var arr = inclExclArray.PurchasingDocInclusionList.split(",");
			// 		var hasItem = false,
			// 			hasHeader = false;
			// 		for (var j = 0; j < arr.length; j++) {
			// 			if (!hasItem && arr[j].indexOf("/") !== -1) {
			// 				hasItem = true;
			// 			}
			// 			if (!hasHeader && arr[j].indexOf("/") === -1) {
			// 				hasHeader = true;
			// 			}
			// 		}
			// 	}

			// 	if (hasHeader === true && hasItem === true) {
			// 		this.isFilterSet = false;
			// 	} else {
			// 		this.isFilterSet = true;
			// 		this.getOwnerComponent().getModel().read(url, {
			// 			groupId: "Changes",
			// 			filters: this.appliedFilter,
			// 			urlParameters: {
			// 				"$top": "1"
			// 			}
			// 		});
			// 	}

			// }

			//post call for sending inclusion/exclusion array
			// if (inclExclArray.PurchasingDocInclusionList !== undefined || inclExclArray.PurchasingDocExclusionList !== undefined) {
			// 	//to call changeset_begin method in dpc_ext, post call should be sent along with key fields having some dummy value
			// 	var downloadUrl = "/C_PurCntrlContrItmMassUpdt(CentralPurchaseContract='4700000000',CentralPurchaseContractItem='00010')";
			// 	this.isInclExclSet = true;
			// 	that.getOwnerComponent().getModel().update(downloadUrl, inclExclArray, {
			// 		groupId: "Changes",
			// 		changeSetId: "DownloadID"
			// 	});
			// }
			//call for the get stream
			this.getOwnerComponent().getModel().read(sPath, {
				groupId: "Changes"
			});
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel().submitChanges({
				groupId: "Changes",
				success: function (odata, response) {
					var index;
					// if (that.isFilterSet && that.isInclExclSet) {
					// 	index = 2;
					// } else if (that.isFilterSet) {
					// 	index = 1;
					// } else if (that.isInclExclSet) {
					// 	index = 1;
					// } else {
					// 	index = 0;
					// }
					if (that.isFilterSet) {
						index = 1;
					} else {
						index = 0;
					}
					if (response && response.data && response.data.__batchResponses[index] && response.data.__batchResponses[index].data &&
						response.data.__batchResponses[index].data.ExcelName && response.data.__batchResponses[
							index].data.ExcelName !== "#") {
						var excelName = response.data.__batchResponses[index].data.ExcelName;
						var excelContent = atob(response.data.__batchResponses[index].data.ExcelContent);
						var byteNumbers = new Array(excelContent.length);
						for (var i = 0; i < excelContent.length; i++) {
							byteNumbers[i] = excelContent.charCodeAt(i);
						}
						var byteArray = new Uint8Array(byteNumbers);
						var blob = new Blob([byteArray], {
							type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						});

						//IE browser
						if (sap.ui.Device.browser.msie) {
							window.navigator.msSaveOrOpenBlob(blob, excelName);
							sap.ui.core.BusyIndicator.hide();
							that.getView().getModel().setHeaders({
								"DownloadExcel": ""
							});
						} else {
							//Other browser
							var aTempLink = window.document.createElement("a");
							var path = window.URL.createObjectURL(blob);
							aTempLink.href = path;
							aTempLink.download = excelName;
							aTempLink.click();
							sap.ui.core.BusyIndicator.hide();
							that.getView().getModel().setHeaders({
								"DownloadExcel": ""
							});
						}

						/*var aTempLink = window.document.createElement("a");
						var path = window.URL.createObjectURL(blob);
						aTempLink.href = path;
						aTempLink.download = excelName;
						aTempLink.click();
						sap.ui.core.BusyIndicator.hide();
						that.getView().getModel().setHeaders({
							"DownloadExcel": ""
						});*/

					} else {
						var sMsg = that.oBundleText.getText("downloadErrMsg");
						that.getView().getModel().setHeaders({
							"DownloadExcel": ""
						});

						if (response && response.data && response.data.__batchResponses[index] && response.data.__batchResponses[index].headers &&
							response.data.__batchResponses[
								index].headers["sap-message"]) {
							var jsonObjectMsg = response.data.__batchResponses[index].headers["sap-message"];
							var jsonErrMsg = JSON.parse(jsonObjectMsg);
							if (jsonErrMsg.code === "EXL_OPS/000") {
								sMsg = jsonErrMsg.message;
								sMsg = sMsg + that.oBundleText.getText("configurationErrorMsg");
							}else if(jsonErrMsg.code === "EXL_OPS/004") {
								sMsg = jsonErrMsg.message;
								sMsg = sMsg + that.oBundleText.getText("configurationErrorMsg");
							}
						}
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(sMsg);
					}
					//reset the inclusion/exclusion array once download is successful
					that.isTabChanged = false;
					that.resetTables(that);
					that.filtersWithInclExcl = [];
				},
				error: function (err) {
					that.getView().getModel().setHeaders({
						"DownloadExcel": ""
					});
					var sMsg = that.oBundleText.getText("errorOccured");
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(sMsg);
				}
			});

		},

		OnClickHctrExcelDownload: function () {
			var that = this;
			var url = "/C_CntrlPurContrHierItmMassUpdt";
			var sPath = "/PurCntrlContrDownloadExcelSet(ExcelName='MCCPC_Excel.xlsx')";

			//calling preparePayload method to form inclusion/exclusion object which will be passed for download
			var inclExclArray = {},
				inclFilt = {},
				exclFilt = {},
				filtersWithInclExcl;
			inclExclArray = that._preparePayloadAsPerScenario(inclExclArray, "HME");

			inclFilt = {
				sPath: "PurchasingDocInclusionList",
				sOperator: "EQ",
				oValue1: inclExclArray.PurchasingDocInclusionList
			};
			exclFilt = {
				sPath: "PurchasingDocExclusionList",
				sOperator: "EQ",
				oValue1: inclExclArray.PurchasingDocExclusionList
			};
			filtersWithInclExcl = JSON.parse(JSON.stringify(this.appliedFilter));

			if (inclFilt.oValue1 !== undefined) {
				filtersWithInclExcl.push(inclFilt);
			}
			if (exclFilt.oValue1 !== undefined) {
				filtersWithInclExcl.push(exclFilt);
			}

			//flag to indicate that the call is from Excel Download
			this.getView().getModel().setHeaders({
				"DownloadExcel": "X"
			});
			//read call to item entity set for passing filters
			this.isFilterSet = true;
			this.getOwnerComponent().getModel().read(url, {
				groupId: "Changes",
				filters: filtersWithInclExcl,
				urlParameters: {
					"$top": "1"
				}
			});

			//call for the get stream
			this.getOwnerComponent().getModel().read(sPath, {
				groupId: "Changes"
			});
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel().submitChanges({
				groupId: "Changes",
				success: function (odata, response) {
					var index;
					if (that.isFilterSet) {
						index = 1;
					} else {
						index = 0;
					}
					if (response && response.data && response.data.__batchResponses[index] && response.data.__batchResponses[index].data &&
						response.data.__batchResponses[index].data.ExcelName && response.data.__batchResponses[
							index].data.ExcelName !== "#") {
						var excelName = response.data.__batchResponses[index].data.ExcelName;
						var excelContent = atob(response.data.__batchResponses[index].data.ExcelContent);
						var byteNumbers = new Array(excelContent.length);
						for (var i = 0; i < excelContent.length; i++) {
							byteNumbers[i] = excelContent.charCodeAt(i);
						}
						var byteArray = new Uint8Array(byteNumbers);
						var blob = new Blob([byteArray], {
							type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						});

						//IE browser
						if (sap.ui.Device.browser.msie) {
							window.navigator.msSaveOrOpenBlob(blob, excelName);
							sap.ui.core.BusyIndicator.hide();
							that.getView().getModel().setHeaders({
								"DownloadExcel": ""
							});
						} else {
							//Other browser
							var aTempLink = window.document.createElement("a");
							var path = window.URL.createObjectURL(blob);
							aTempLink.href = path;
							aTempLink.download = excelName;
							aTempLink.click();
							sap.ui.core.BusyIndicator.hide();
							that.getView().getModel().setHeaders({
								"DownloadExcel": ""
							});
						}
					} else {
						var sMsg = that.oBundleText.getText("downloadHCTRErrMsg");
						that.getView().getModel().setHeaders({
							"DownloadExcel": ""
						});

						if (response && response.data && response.data.__batchResponses[index] && response.data.__batchResponses[index].headers &&
							response.data.__batchResponses[
								index].headers["sap-message"]) {
							var jsonObjectMsg = response.data.__batchResponses[index].headers["sap-message"];
							var jsonErrMsg = JSON.parse(jsonObjectMsg);
							if (jsonErrMsg.code === "EXL_OPS/000") {
								sMsg = jsonErrMsg.message;
								sMsg = sMsg + that.oBundleText.getText("configurationErrorMsg");
							}
						}
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(sMsg);
					}
					//reset the inclusion/exclusion array once download is successful
					that.isTabChanged = false;
					that.resetTables(that);
					that.filtersWithInclExcl = [];
				},
				error: function (err) {
					that.getView().getModel().setHeaders({
						"DownloadExcel": ""
					});
					var sMsg = that.oBundleText.getText("errorOccured");
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(sMsg);
				}
			});

		},

		//this function is triggered when i file is selected from the file uploader
		fnChangeUploadFiles: function (oEvent) {
			var that = this;
			var fileSize = oEvent.getParameters().files[0].size;
			//if the selected file has data then it is further sent for update process
			if (fileSize > 0) {
				var UploadExcelText = this.oBundleText.getText("UploadExcel");
				var uploadJobDescription = this.oBundleText.getText("uploadJobDescription");
				var uploadedFileName = oEvent.getParameters().files[0].name;
				var defaultJobDescription = this.oBundleText.getText("defaultJobDescUpload", [uploadedFileName]);
				var dialog = new sap.m.Dialog({
					title: UploadExcelText,
					type: "Message",
					content: [
						new sap.ui.layout.VerticalLayout({
							width: "100%",
							content: [
								new sap.m.Text("excelConfirmationDialogText", {
									text: uploadJobDescription
								}),
								new sap.m.TextArea("excelConfirmDialogTextarea", {
									ariaLabelledBy: "excelConfirmationDialogText",
									width: "100%",
									value: defaultJobDescription,
									maxLength: 100
								})
							]
						})
					],
					beginButton: new sap.m.Button("UploadExcBtn", {
						text: that.oBundleText.getText("ActionExcelUpload"),
						press: function () {
							var sComment = sap.ui.getCore().byId("excelConfirmDialogTextarea").getValue();
							/*if (sComment === "") {
								sComment = UploadExcelText;
							}*/
							that.sComment = sComment;
							dialog.close();
							// sap.ui.core.BusyIndicator.show();
							that.getView().byId("fileUploader").upload();

						},
						type: "Emphasized"
					}),
					endButton: new sap.m.Button({
						text: that.oBundleText.getText("cancelButtonText"),
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
				if (sap.ui.getCore().byId("excelConfirmDialogTextarea")) {
					sap.ui.getCore().byId("excelConfirmDialogTextarea").attachLiveChange(this.ExcelOperations.fnEnableDisableUpldBtn.bind(this));
				}
				dialog.open();
			}
		},
		//this function is triggered when file is added in the excel uploader
		fnChangeUploadFilesV2: function (oEvent) {
			var that = this;
			var fileSize = oEvent.getParameters().files[0].size;
			var oResBundle = this.getView().getModel("@i18n").getResourceBundle();
			if (fileSize > 0) {
				sap.ui.getCore().byId("uploadExcel--uploadBtn").setEnabled(true);
				sap.ui.getCore().byId("uploadExcel--SimulateBtn").setEnabled(true);
				var oFileName = oEvent.getParameters().files[0].name;
				this.uploadedFileName = oFileName;
			}
			setTimeout(function () {
				that.ExcelOperations._attachFileDelPress(oResBundle, oFileName);
			}, 0);
		},

		fnOpenExcelUploadModel: function (oEvent) {
			var that = this,
				fragment = "ui.s2p.mm.cntrl.ctrmass.update.ext.fragment.ExcelPopup",
				oView = this.getView();
			if (!that._oDialogObjList) {
				that._oDialogObjList = sap.ui.xmlfragment("uploadExcel", fragment, that);
				oView.addDependent(that._oDialogObjList);
			}
			that.oModel = oView.getModel();
			that._oDialogObjList.setModel(that.oModel);
			that.ExcelOperations._resetUploadCollection();
			sap.ui.getCore().byId("uploadExcel--excelUploadFrag").setTitle(this.excelUploadTypeText);
			that._oDialogObjList.open();
		},

		_resetUploadCollection: function () {
			var oUploadCollection = sap.ui.getCore().byId("uploadExcel--UploadCollection");
			if (oUploadCollection.getItems().length > 0) {
				oUploadCollection.removeAllItems();
			}
			setTimeout(function () {
				if (oUploadCollection && oUploadCollection.getToolbar()) {
					var oControlId = oUploadCollection.getToolbar()._getControlsIds()[2];
					sap.ui.getCore().byId(oControlId).setEnabled(true);
				}
			}, 0);
			sap.ui.getCore().byId("uploadExcel--uploadBtn").setEnabled(false);
			sap.ui.getCore().byId("uploadExcel--SimulateBtn").setEnabled(false);
		},

		_attachFileDelPress: function (oResBundle, oFileName) {
			var oUploadCollection = sap.ui.getCore().byId("uploadExcel--UploadCollection");
			var oItems = oUploadCollection.getItems(),
				oControlId = oUploadCollection.getToolbar()._getControlsIds()[2],
				oMsg = oResBundle.getText("deleteExcelConfirmMsg", oFileName);
			oItems = oItems[0];
			sap.ui.getCore().byId(oControlId).setEnabled(false);
			oItems.attachDeletePress(function (oEvent) {
				MessageBox.show(oMsg, {
					title: oResBundle.getText("deleteExcelConfirmTitle"),
					actions: [oResBundle.getText("deleteExcelConfirmOkBtn"), sap.m.MessageBox.Action.CANCEL],
					onClose: function (sAction) {
						if (sAction === oResBundle.getText("deleteExcelConfirmOkBtn")) {
							oUploadCollection.removeAllItems();
							sap.ui.getCore().byId(oControlId).setEnabled(true);
							sap.ui.getCore().byId("uploadExcel--uploadBtn").setEnabled(false);
							sap.ui.getCore().byId("uploadExcel--SimulateBtn").setEnabled(false);
							this._objErrUploadVal = {};
						} else {
							sap.ui.getCore().byId(oControlId).setEnabled(false);
							sap.ui.getCore().byId("uploadExcel--uploadBtn").setEnabled(true);
						}
					}
				});
			});

		},

		fnEnableDisableUpldBtn: function () {

			var jobdescription = sap.ui.getCore().byId("excelConfirmDialogTextarea").getValue();
			if (jobdescription && jobdescription.length > 0) {
				sap.ui.getCore().byId("UploadExcBtn").setEnabled(true);
			} else {
				sap.ui.getCore().byId("UploadExcBtn").setEnabled(false);
			}

		},

		fnEnableDisableSimBtn: function () {
			var jobdescription = sap.ui.getCore().byId("excelConfirmDialogTextarea").getValue();
			if (jobdescription && jobdescription.length > 0) {
				sap.ui.getCore().byId("SimulateExcBtn").setEnabled(true);
			} else {
				sap.ui.getCore().byId("SimulateExcBtn").setEnabled(false);
			}
		},
		//Setting the request header with csrf-token and sending the uploaded filename and the job description as a slug to the backend
		fnBeforeUpload: function (oEvent) {
			sap.ui.core.BusyIndicator.show();
			var uploadedFileName = oEvent.getParameters().fileName;
			var oCsrfToken = this.getView().getModel().getSecurityToken();
			oEvent.getParameters().requestHeaders.push({
				name: "x-csrf-token",
				value: oCsrfToken // when fresh upload happens
			});
			oEvent.getParameters().requestHeaders.push({
				name: "slug",
				value: uploadedFileName + "#" + this.sComment // when fresh upload happens
			});

		},
		fnBeforeUploadV2: function (oEvent) {
			sap.ui.core.BusyIndicator.show();
			var uploadedFileName = oEvent.getParameters().fileName;
			var oCsrfToken = this.getView().getModel().getSecurityToken();
			var oCsrfTokenData = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: oCsrfToken // when fresh upload happens
			});
			oEvent.getParameters().addHeaderParameter(oCsrfTokenData);
			if (this.isSimulate === "X") {
				var oCsrfTokenSlug = new UploadCollectionParameter({
					name: "slug",
					value: uploadedFileName + "#" + this.sComment + "#" + this.excelUploadType + "#" + this.isSimulate // when fresh upload happens
				});
			} else {
				oCsrfTokenSlug = new UploadCollectionParameter({
					name: "slug",
					value: uploadedFileName + "#" + this.sComment + "#" + this.excelUploadType // when fresh upload happens
				});
			}
			oEvent.getParameters().addHeaderParameter(oCsrfTokenSlug);
		},

		fnUploadComplete: function (oEvent) {
			sap.ui.core.BusyIndicator.hide();
			var that = this;
			var oBundle = this.getView().getModel("@i18n").getResourceBundle();

			// if (oEvent.getParameters().getParameters().status === 200 || oEvent.getParameters().getParameters().status === 201) {
			if (oEvent.getParameters().status === 200 || oEvent.getParameters().status === 201) {
				var result = oEvent.getParameters().responseRaw;
				var JobId = this.ExcelOperations.getJobIdFromXMLResp(result);
				sap.ui.core.BusyIndicator.hide();
				// var index = result.indexOf('JobName') + 9;
				// var JobId = result.substr(index, 32);

				if (JobId && JobId.length > 1) {
					var sJobDescription = oBundle.getText("jobDescription", [that.sComment]);
					var sJobScheduledText = oBundle.getText("jobCreatedText", [that.sComment]);
					var dialog = new sap.m.Dialog({
						title: "success",
						type: "Message",
						state: "Success",
						content: [
							new sap.ui.layout.VerticalLayout({
								width: "100%",
								content: [
									new sap.m.Text("confirmDialogText", {
										text: sJobScheduledText.replace(sJobDescription, '"' + sJobDescription + '"')
											//text: oBundle.getText("jobCreatedText", [that.sComment])
									})
								]
							})
						],
						beginButton: new sap.m.Button({
							text: oBundle.getText("viewJobButtonText"),
							press: function () {
								that.onClickMassChangeJobs();
								dialog.close();
							}
						}),
						endButton: new sap.m.Button({
							text: oBundle.getText("closeButtonText"),

							press: function () {
								dialog.close();

							}
						}),
						afterClose: function () {
							dialog.destroy();
						}

					});
					that.getView().addDependent(dialog);

					dialog.open();
				} else {
					if (oEvent.getParameters().headers && oEvent.getParameters().headers["sap-message"]) {
						var message = oEvent.getParameters().headers["sap-message"];
						var errMsg = that.ExcelOperations.getErrorMsgFromXMLResp(message);

						if (errMsg && errMsg.length > 1) {
							MessageBox.error(errMsg);
							sap.ui.core.BusyIndicator.hide();
						} else {
							//This will occur only when the message retured is blank
							MessageBox.error(oBundle.getText("errorOccured"));
							sap.ui.core.BusyIndicator.hide();
						}
					}
				}
			} else {
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error(oBundle.getText("errorOccured"));

			}

		},
		fnUploadCompleteV2: function (oEvent) {
			sap.ui.core.BusyIndicator.hide();
			var that = this;
			var oBundle = this.getView().getModel("@i18n").getResourceBundle();

			if (oEvent.getParameters().getParameters().status === 200 || oEvent.getParameters().getParameters().status === 201) {
				var result = oEvent.getParameters().getParameters().responseRaw;
				var JobId = this.ExcelOperations.getJobIdFromXMLResp(result);
				sap.ui.core.BusyIndicator.hide();

				if (JobId && JobId.length > 1) {
					var sJobDescription = oBundle.getText("jobDescription", [that.sComment]);
					var sJobScheduledText = oBundle.getText("jobCreatedText", [that.sComment]);
					var dialog = new sap.m.Dialog({
						title: "Success",
						type: "Message",
						state: "Success",
						content: [
							new sap.ui.layout.VerticalLayout({
								width: "100%",
								content: [
									new sap.m.Text("confirmDialogText", {
										text: sJobScheduledText.replace(sJobDescription, '"' + sJobDescription + '"')
									})
								]
							})
						],
						beginButton: new sap.m.Button({
							text: oBundle.getText("viewJobButtonText"),
							press: function () {
								that.onClickMassChangeJobs();
								dialog.close();
							}
						}),
						endButton: new sap.m.Button({
							text: oBundle.getText("closeButtonText"),

							press: function () {
								dialog.close();
								that.ExcelOperations.closeUploadDialog();

							}
						}),
						afterClose: function () {
							dialog.destroy();
						}

					});
					that.getView().addDependent(dialog);
					dialog.open();
				} else {
					if (oEvent.getParameters().headers && oEvent.getParameters().headers["sap-message"]) {
						var message = oEvent.getParameters().headers["sap-message"];
						var errMsg = that.ExcelOperations.getErrorMsgFromXMLResp(message);

						if (errMsg && errMsg.length > 1) {
							MessageBox.error(errMsg);
							sap.ui.core.BusyIndicator.hide();
						} else {
							//This will occur only when the message retured is blank
							MessageBox.error(oBundle.getText("errorOccured"));
							sap.ui.core.BusyIndicator.hide();
						}
					}
				}
			} else {
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error(oBundle.getText("errorOccured"));

			}
			sap.ui.getCore().byId("uploadExcel--uploadBtn").setEnabled(false);
			sap.ui.getCore().byId("uploadExcel--SimulateBtn").setEnabled(false);
			var oUploadCollection = sap.ui.getCore().byId("uploadExcel--UploadCollection");
			var oControlId = oUploadCollection.getToolbar()._getControlsIds()[2];
			sap.ui.getCore().byId(oControlId).setEnabled(true);

		},

		getJobIdFromXMLResp: function (result) {
			var parser = new DOMParser();
			var jobId = parser.parseFromString(result, "text/xml");
			if (jobId.getElementsByTagName("d:JobName") && jobId.getElementsByTagName("d:JobName")[0] && jobId.getElementsByTagName("d:JobName")[
					0].childNodes && jobId.getElementsByTagName("d:JobName")[0].childNodes[0] && jobId.getElementsByTagName("d:JobName")[0].childNodes[
					0].nodeValue) {
				var jobName = jobId.getElementsByTagName("d:JobName")[0].childNodes[0].nodeValue;
			}
			return jobName;
		},

		getErrorMsgFromXMLResp: function (result) {
			var parser = new DOMParser();
			var errMsg = parser.parseFromString(result, "text/xml");
			if (errMsg.getElementsByTagName("message") && errMsg.getElementsByTagName("message")[0] && errMsg.getElementsByTagName("message")[0]
				.childNodes && errMsg.getElementsByTagName("message")[0].childNodes[0] && errMsg.getElementsByTagName("message")[0].childNodes[0].nodeValue
			) {
				var errorMsg = errMsg.getElementsByTagName("message")[0].childNodes[0].nodeValue;
			}
			return errorMsg;
			//return errMsg.getElementsByTagName("message")[0].childNodes[0].nodeValue || "";
		},

		//This function is triggered when the uploaded file type is not .xlsx, a Dialog opens with appropriate error message
		fnFileTypeMissmatch: function () {
			var sMsg = new sap.m.Text("sFileTypeMisMatch", {
				text: this.oBundleText.getText("ExcelUploadTypeMismatch")
			});
			var dialog = new sap.m.Dialog({
				title: this.oBundleText.getText("Error"),
				type: "Message",
				state: "Error",
				content: sMsg,
				endButton: new sap.m.Button({
					text: this.oBundleText.getText("closeButtonText"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},

		onUploadBtnClick: function (oEvent) {
			var that = this;
			var defaultJobDescription;
			var uploadJobDescription;
			var SimDefJobDescription;
			var oUploadCollection = sap.ui.getCore().byId("uploadExcel--UploadCollection");
			if (oUploadCollection.getItems().length > 1) {
				var sMsg = that.oBundleText.getText("uploadErrorMsg");
				MessageBox.error(sMsg);
			} else {
				if (oEvent.getSource().getId() === "uploadExcel--uploadBtn") {
					this.isSimulate = "";
					var UploadExcelText = this.oBundleText.getText("UploadExcel");
					uploadJobDescription = this.oBundleText.getText("uploadJobDescription");
					if (this.excelUploadType === "EXL_OPS_CCTR") {
						defaultJobDescription = this.oBundleText.getText("defaultJobDescUpd", [this.uploadedFileName]);
					} else if (this.excelUploadType === "EXL_OPS_HCTR") {
						defaultJobDescription = this.oBundleText.getText("defaultJobDescHier", [this.uploadedFileName]);
					}
					var dialog = new sap.m.Dialog({
						title: UploadExcelText,
						type: "Message",
						content: [
							new sap.ui.layout.VerticalLayout({
								width: "100%",
								content: [
									new sap.m.Text("excelConfirmationDialogText", {
										text: uploadJobDescription
									}),
									new sap.m.TextArea("excelConfirmDialogTextarea", {
										ariaLabelledBy: "excelConfirmationDialogText",
										width: "100%",
										value: defaultJobDescription, 
										maxLength: 100
									})
								]
							})
						],
						beginButton: new sap.m.Button("UploadExcBtn", {
							text: that.oBundleText.getText("ActionExcelUpload"),
							press: function () {
								var sComment = sap.ui.getCore().byId("excelConfirmDialogTextarea").getValue();
								that.sComment = sComment;
								dialog.close();
								oUploadCollection.upload();

							},
							type: "Emphasized"
						}),
						endButton: new sap.m.Button({
							text: that.oBundleText.getText("cancelButtonText"),
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});
					if (sap.ui.getCore().byId("excelConfirmDialogTextarea")) {
						sap.ui.getCore().byId("excelConfirmDialogTextarea").attachLiveChange(this.ExcelOperations.fnEnableDisableUpldBtn.bind(this));
					}
					dialog.open();

				} else if (oEvent.getSource().getId() === "uploadExcel--SimulateBtn") {
					this.isSimulate = "X";
					var SimulateExcelText = this.oBundleText.getText("SimulateJob");
					uploadJobDescription = this.oBundleText.getText("uploadJobDescription");
					if (this.excelUploadType === "EXL_OPS_CCTR") {
						SimDefJobDescription = this.oBundleText.getText("defSimJobDescUpload", [this.uploadedFileName]);
					} else if (this.excelUploadType === "EXL_OPS_HCTR") {
						SimDefJobDescription = this.oBundleText.getText("SimJobDescUploadHCTR", [this.uploadedFileName]);
					}
					var dialog1 = new sap.m.Dialog({
						title: SimulateExcelText,
						type: "Message",
						content: [
							new sap.ui.layout.VerticalLayout({
								width: "100%",
								content: [
									new sap.m.Text("excelConfirmationDialogText", {
										text: uploadJobDescription 
									}),
									new sap.m.TextArea("excelConfirmDialogTextarea", {
										ariaLabelledBy: "excelConfirmationDialogText",
										width: "100%",
										value: SimDefJobDescription,
										maxLength: 120
									})
								]
							})
						],
						beginButton: new sap.m.Button("SimulateExcBtn", {
							text: that.oBundleText.getText("ActionExcelSimulate"),
							press: function () {
								var sComment = sap.ui.getCore().byId("excelConfirmDialogTextarea").getValue();
								that.sComment = sComment;
								dialog1.close();
								oUploadCollection.upload();

							},
							type: "Emphasized"
						}),
						endButton: new sap.m.Button({
							text: that.oBundleText.getText("cancelButtonText"),
							press: function () {
								dialog1.close();
							}
						}),
						afterClose: function () {
							dialog1.destroy();
						}
					});
					if (sap.ui.getCore().byId("excelConfirmDialogTextarea")) {
						sap.ui.getCore().byId("excelConfirmDialogTextarea").attachLiveChange(this.ExcelOperations.fnEnableDisableSimBtn.bind(this));
					}
					dialog1.open();
				}
			}
		},

		//This function is triggered when the file uploaded has no data, a dilog opens with appropriate error message
		fnEmptyFileSelected: function (oEvent) {
			var sMsg = new sap.m.Text("sFileSizeZero", {
				text: this.oBundleText.getText("FileSizeZero")
			});
			var dialog = new sap.m.Dialog({
				title: this.oBundleText.getText("Error"),
				type: "Message",
				state: "Error",
				content: sMsg,
				endButton: new sap.m.Button({
					text: this.oBundleText.getText("closeButtonText"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},

		closeUploadDialog: function () {
			var oDialog = sap.ui.core.Fragment.byId("uploadExcel", "excelUploadFrag");
			sap.ui.getCore().byId("uploadExcel--uploadBtn").setEnabled(false);
			if (oDialog) {
				oDialog.close();
			}
		}

	};
	return ExcelOperations;
});