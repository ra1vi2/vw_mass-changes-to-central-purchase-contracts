/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"ui/s2p/mm/cntrl/ctrmass/update/ext/model/formatter"
], function (formatter) {
	"use strict";

	// File  having the functions for Add Item Distribution
	var AddDist = {

		formatter: formatter,
		// Simulate option using Feature Toggle
		enableSimulationFeature: function () {
			this.getView().byId("DialogSimulateBtn").setVisible(true);
/*			var p = sap.s4h.cfnd.featuretoggle.lib.featuresAsync();
			p.then(function (features) {
					this.SimulateToggleStatus = features.getFeatureStatus("MM_PUR_MASS_UPDATE_HCTR");
					if (this.SimulateToggleStatus === true) {
						this.getView().byId("DialogSimulateBtn").setVisible(true);
					}
				}.bind(this))
				.catch(function (oError) {
					// Promise has been rejected since Service is unavailable
					// console.log("An Error occurred, unable to load the feature toggle status");
				}.bind(this));*/
		},
		//Creating Dialog for Add Item Distribution
		onPressAddItmDist: function () {
			var oView = this.getView();
			var mAddItmDistForm = oView.byId("AddItemDistribution");
			if (!mAddItmDistForm) {
				mAddItmDistForm = sap.ui.xmlfragment(oView.getId(), "ui.s2p.mm.cntrl.ctrmass.update.ext.fragment.AddItemDistribution", this);
				oView.addDependent(mAddItmDistForm);
			}
			this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoadedOfSetNewValueHeaderModel.bind(this,
				mAddItmDistForm));
			mAddItmDistForm.getContent()[1].getGroups()[1].getGroupElements()[5].setLabel(this.oBundleText.getText("PurchaserNote"));
			var enableSimulationFeature = this.AddDistribution.enableSimulationFeature.bind(this);
			enableSimulationFeature();
			mAddItmDistForm.open();
			// object this holds all the fields of the Entity type C_CntrlPurContrHdrDistrType and their corresponding properties
			//this is object is further used to derive the maxlength of the editable fields.
			this.fieldLength = oView.getModel().getMetaModel().getODataEntityType(
				"MM_PUR_CNTRLCTRMASS_UPDT_SRV.C_CntrlPurContrItmDistrType");
			//code for showing the count
			this.setAffectedDocumentsCount();
		},

		//Creating Dialog for Add Header Distribution
		onPressAddHdrDist: function () {
			var oView = this.getView();
			var mAddHdrDistForm = oView.byId("AddHeaderDistribution");
			if (!mAddHdrDistForm) {
				mAddHdrDistForm = sap.ui.xmlfragment(oView.getId(), "ui.s2p.mm.cntrl.ctrmass.update.ext.fragment.AddHeaderDistribution", this);
				oView.addDependent(mAddHdrDistForm);
			}
			this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoadedOfSetNewValueHeaderModel.bind(this,
				mAddHdrDistForm));
			mAddHdrDistForm.getContent()[1].getGroups()[1].getGroupElements()[5].setLabel(this.oBundleText.getText("PurchaserNote"));
			var enableSimulationFeature = this.AddDistribution.enableSimulationFeature.bind(this);
			enableSimulationFeature();
			mAddHdrDistForm.open();
			// object this holds all the fields of the Entity type C_CntrlPurContrHdrDistrType and their corresponding properties
			//this is object is further used to derive the maxlength of the editable fields.
			this.fieldLength = oView.getModel().getMetaModel().getODataEntityType(
				"MM_PUR_CNTRLCTRMASS_UPDT_SRV.C_CntrlPurContrHdrDistrType");
			//code for showing the count
			this.setAffectedDocumentsCount();

		},

		//This method is triggered when the value is entered in Plant field and on tab out.
		validatePlant: function (oEvent) {
			//maxlength for the plant field extracted from metadata.
			var maxLength = this.getView().getModel().getMetaModel().getODataProperty(this.fieldLength, "Plant").maxLength;
			this.companyCodeChanged = "";
			this.PlantChanged = "";
			var that = this;
			var newValue, validated, ValueStateIndex, enableApplyChange, validateStorageLocation;
			var CompanyCodeValue = this.getView().byId("ProcmtHubCompanyCode").getValue();
			//flag to check if the method was triggered from change of value in Plant field or from Company Code
			if (oEvent) {
				newValue = oEvent.getParameter("newValue");
				//flag indicating the value was selected from the value help
				validated = oEvent.getParameter("validated");
				this.PlantChanged = "X";
			} else {
				newValue = this.getView().byId("Plant").getValue();
				//flag set when company code triggered this method
				this.companyCodeChanged = "X";
			}
			//data is processed only if the length of value entered is <= maxlength of the field
			if (newValue.length <= Number(maxLength) && newValue !== undefined && newValue !== "") {
				//since the value was selectedc from value help no validation check is done and directly call method enableApplyChange method for further processing
				if (validated) {
					// that.AddDistribution.enableApplyChange("Plant", that);
					// that.AddDistribution.validateStorageLocation();
					enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
					enableApplyChange("Plant");
					validateStorageLocation = that.AddDistribution.validateStorageLocation.bind(that);
					validateStorageLocation();
				}
				//Validation check for the values directly entered by user and not from value help
				else {
					var aFilters = [];
					var oModel = this.getView().getModel();
					var url = "/C_ProcmtHubPlantVH";
					var oUoMFilter = new sap.ui.model.Filter({
						path: "ProcmtHubPlant",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: newValue
					});
					aFilters.push(oUoMFilter);
					//sending the company code selected as filter
					oUoMFilter = new sap.ui.model.Filter({
						path: "ProcmtHubCompanyCode",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: CompanyCodeValue
					});
					aFilters.push(oUoMFilter);
					//sending the source system ID from the selected company code
					if (that.ProcurementHubSourceSystem) {
						oUoMFilter = new sap.ui.model.Filter({
							path: "ProcurementHubSourceSystem",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: that.ProcurementHubSourceSystem
						});

						aFilters.push(oUoMFilter);

					}
					oModel.read(url, {
						filters: aFilters,
						success: function (oResponse) {

							if (oResponse && oResponse.results) {
								if (oResponse.results.length === 0) {
									var smartIndex = that.MandateFieldChanged.indexOf("Plant");
									//	var Mandatory=this.getView().byID("Plant").getMandatory();
									var nonmandateIndex = that.nonMandateFieldChanged.indexOf("Plant");
									if (smartIndex > -1) {
										that.MandateFieldChanged.splice(smartIndex, 1);
									} else if (nonmandateIndex > -1) {
										that.nonMandateFieldChanged.splice(nonmandateIndex, 1);
									}
									that.getView().byId("DialogApplyBtn").setEnabled(false);
									that.getView().byId("DialogSimulateBtn").setEnabled(false);
									if (that.getView().byId("Plant").getMandatory() === true) {
										var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
										dependendsofMandateFields();
									}
									// that.getView().byId("PurgDocNoteText").setEnabled(false);
									// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
									that.getView().byId("Plant").setValueState("Error");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("Plant");
									if (ValueStateIndex < 0) {
										that.ValueStateErrorFields.push("Plant");
									}
									var errMsg;
									//error message thrown based of if the value change in plant triggered or the company code
									if (that.companyCodeChanged && that.companyCodeChanged === "X") {
										errMsg = that.oBundleText.getText("plantCompanyCodeError");
									} else {
										errMsg = that.oBundleText.getText("plantMsg");
									}

									that.getView().byId("Plant").setValueStateText(errMsg);

								} else {
									//if the value entered is a valid value then enableApplyChange is triggered for further processing 
									ValueStateIndex = that.ValueStateErrorFields.indexOf("Plant");
									that.getView().byId("Plant").setValueState("None");
									if (ValueStateIndex > -1) {
										that.ValueStateErrorFields.splice(ValueStateIndex, 1);
									}
									// that.AddDistribution.enableApplyChange("Plant", that);
									// that.AddDistribution.validateStorageLocation();
									enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
									enableApplyChange("Plant");
									validateStorageLocation = that.AddDistribution.validateStorageLocation.bind(that);
									validateStorageLocation();
								}
							}

						},
						error: function (oError) {}
					});
				}
			} else {
				var smartIndex = that.MandateFieldChanged.indexOf("Plant");

				var nonmandateIndex = that.nonMandateFieldChanged.indexOf("Plant");
				if (smartIndex > -1) {
					that.MandateFieldChanged.splice(smartIndex, 1);
					that.getView().byId("DialogApplyBtn").setEnabled(false);
					that.getView().byId("DialogSimulateBtn").setEnabled(false);
					var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
					dependendsofMandateFields();
					// that.getView().byId("PurgDocNoteText").setEnabled(false);
					// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
					that.getView().byId("Plant").setValueState("Error");
					ValueStateIndex = that.ValueStateErrorFields.indexOf("Plant");
					if (ValueStateIndex < 0) {
						that.ValueStateErrorFields.push("Plant");
					}

					var errMsg;
					if (that.companyCodeChanged && that.companyCodeChanged === "X") {
						errMsg = that.oBundleText.getText("plantCompanyCodeError");
					} else {
						errMsg = that.oBundleText.getText("plantMsg");
					}

					that.getView().byId("Plant").setValueStateText(errMsg);
				} else if (nonmandateIndex > -1) {
					that.nonMandateFieldChanged.splice(nonmandateIndex, 1);
					if (newValue.length > 0) {
						ValueStateIndex = that.ValueStateErrorFields.indexOf("Plant");
						if (ValueStateIndex < 0) {
							that.ValueStateErrorFields.push("Plant");
						}

					} else {
						ValueStateIndex = that.ValueStateErrorFields.indexOf("Plant");

						if (ValueStateIndex > -1) {
							that.ValueStateErrorFields.splice(ValueStateIndex, 1);
						}

					}

				}
				//check for enabling the Apply Mass Changes button
				if ((that.MandateFieldChanged.length === 5 && that.DocumentCategory === "K" && that.ValueStateErrorFields.length === 0) || (that.MandateFieldChanged
						.length === 7 && that.DocumentCategory ===
						"L" && that.ValueStateErrorFields.length === 0)) {
					that.getView().byId("DialogApplyBtn").setEnabled(true);
					that.getView().byId("DialogSimulateBtn").setEnabled(true);
					that.getView().byId("PurgDocNoteText").setEnabled(true);
					that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(true);
				} else {
					that.getView().byId("DialogApplyBtn").setEnabled(false);
					that.getView().byId("DialogSimulateBtn").setEnabled(false);
					var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
					dependendsofMandateFields();
					// that.getView().byId("PurgDocNoteText").setEnabled(false);
					// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
				}
			}
		},

		//This method is triggered when the value is entered in Purchasing Organization field and on tab out.
		validatePurchasingOrg: function (oEvent) {
			//maxlength for the plant field extracted from metadata.
			var maxLength = this.getView().getModel().getMetaModel().getODataProperty(this.fieldLength,
				"ProcmtHubPurchasingOrg").maxLength;
			this.companyCodeChanged = "";
			var that = this;
			var newValue, validated, ValueStateIndex;
			//flag to check if the method was triggered from change of value in Purchasing Org field or from Company Code
			if (oEvent) {
				newValue = oEvent.getParameter("newValue");
				//flag indicating the value was selected from the value help
				validated = oEvent.getParameter("validated");
			} else {
				newValue = this.getView().byId("ProcmtHubPurchasingOrg").getValue();
				//flag set when company code triggered this method
				this.companyCodeChanged = "X";

			}
			//data is processed only if the length of value entered is <= maxlength of the field
			if (newValue.length <= Number(maxLength) && newValue !== undefined && newValue !== "") {
				//since the value was selectedc from value help no validation check is done and directly call method enableApplyChange method for further processing
				if (validated) {
					//	that.AddDistribution.enableApplyChange("ProcmtHubPurchasingOrg", that);
					var enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
					enableApplyChange("ProcmtHubPurchasingOrg");
				}
				//Validation check for the values directly entered by user and not from value help
				else {

					var aFilters = [];
					var oModel = this.getView().getModel();
					var url = "/C_ProcmtHubPurgOrgVH";
					var oUoMFilter = new sap.ui.model.Filter({
						path: "ProcmtHubPurchasingOrg",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: newValue
					});
					aFilters.push(oUoMFilter);
					//sending the source system ID from the selected company code
					if (that.ProcurementHubSourceSystem) {
						oUoMFilter = new sap.ui.model.Filter({
							path: "ProcurementHubSourceSystem",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: that.ProcurementHubSourceSystem
						});

						aFilters.push(oUoMFilter);

					}
					oModel.read(url, {
						filters: aFilters,
						success: function (oResponse) {

							if (oResponse && oResponse.results) {
								if (oResponse.results.length === 0) {
									that.getView().byId("DialogApplyBtn").setEnabled(false);
									that.getView().byId("DialogSimulateBtn").setEnabled(false);
									var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
									dependendsofMandateFields();
									// that.getView().byId("PurgDocNoteText").setEnabled(false);
									// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
									var smartIndex = that.MandateFieldChanged.indexOf("ProcmtHubPurchasingOrg");
									if (smartIndex > -1) {
										that.MandateFieldChanged.splice(smartIndex, 1);
									}
									that.getView().byId("ProcmtHubPurchasingOrg").setValueState("Error");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("ProcmtHubPurchasingOrg");
									if (ValueStateIndex < 0) {
										that.ValueStateErrorFields.push("ProcmtHubPurchasingOrg");
									}

									var errMsg;
									//error message thrown based of if the value change in Purchasing Org. triggered or the company code
									if (that.companyCodeChanged && that.companyCodeChanged === "X") {
										errMsg = that.oBundleText.getText("PurchOrgCompanyCodeError");
									} else {
										errMsg = that.oBundleText.getText("purchOrgMsg");
									}
									that.getView().byId("ProcmtHubPurchasingOrg").setValueStateText(errMsg);
								} else {
									//if the value entered is a valid value then enableApplyChange is triggered for further processing 
									that.getView().byId("ProcmtHubPurchasingOrg").setValueState("None");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("ProcmtHubPurchasingOrg");

									if (ValueStateIndex > -1) {
										that.ValueStateErrorFields.splice(ValueStateIndex, 1);
									}
									enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
									enableApplyChange("ProcmtHubPurchasingOrg");
									//that.AddDistribution.enableApplyChange("ProcmtHubPurchasingOrg", that);
								}
							}

						},
						error: function (oError) {}
					});
				}
			} else {
				that.getView().byId("DialogApplyBtn").setEnabled(false);
				that.getView().byId("DialogSimulateBtn").setEnabled(false);
				var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
				dependendsofMandateFields();
				// that.getView().byId("PurgDocNoteText").setEnabled(false);
				// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
				var smartIndex = that.MandateFieldChanged.indexOf("ProcmtHubPurchasingOrg");
				if (smartIndex > -1) {
					that.MandateFieldChanged.splice(smartIndex, 1);
				}

				that.getView().byId("ProcmtHubPurchasingOrg").setValueState("Error");
				ValueStateIndex = that.ValueStateErrorFields.indexOf("ProcmtHubPurchasingOrg");
				if (ValueStateIndex < 0) {
					that.ValueStateErrorFields.push("ProcmtHubPurchasingOrg");
				}

				var errMsg;
				if (that.companyCodeChanged && that.companyCodeChanged === "X") {
					errMsg = that.oBundleText.getText("PurchOrgCompanyCodeError");
				} else {
					errMsg = that.oBundleText.getText("purchOrgMsg");
				}
				// var errMsg = that.oBundleText.getText("purchOrgMsg");
				that.getView().byId("ProcmtHubPurchasingOrg").setValueStateText(errMsg);

			}
		},

		//This method is triggered when the value is entered in Purchasing Group field and on tab out.
		validatePurchasingGrp: function (oEvent) {
			//maxlength for the Purchasing Group  field extracted from metadata.
			var maxLength = this.getView().getModel().getMetaModel().getODataProperty(this.fieldLength,
				"ProcmtHubPurchasingGroup").maxLength;
			this.companyCodeChanged = "";

			var newValue, validated, ValueStateIndex, enableApplyChange;
			//flag to check if the method was triggered from change of value in Purchasing Group field or from Company Code
			if (oEvent) {
				newValue = oEvent.getParameter("newValue");
				//flag indicating the value was selected from the value help
				validated = oEvent.getParameter("validated");
			} else {
				newValue = this.getView().byId("ProcmtHubPurchasingGroup").getValue();
				//flag set when company code triggered this method
				this.companyCodeChanged = "X";
			}

			var that = this;
			//data is processed only if the length of value entered is <= maxlength of the field
			if (newValue.length <= Number(maxLength) && newValue !== undefined && newValue !== "") {
				if (validated) {
					//since the value was selectedc from value help no validation check is done and directly call method enableApplyChange method for further processing
					//that.AddDistribution.enableApplyChange("ProcmtHubPurchasingGroup", that);
					enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
					enableApplyChange("ProcmtHubPurchasingGroup");
				}
				//Validation check for the values directly entered by user and not from value help
				else {
					var aFilters = [];
					var oModel = this.getView().getModel();
					var url = "/C_ProcmtHubCntrlContrPurgGrpVH";
					var oUoMFilter = new sap.ui.model.Filter({
						path: "PurchasingGroup",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: newValue
					});
					aFilters.push(oUoMFilter);
					//sending the source system ID from the selected company code
					if (that.ProcurementHubSourceSystem) {
						oUoMFilter = new sap.ui.model.Filter({
							path: "ProcurementHubSourceSystem",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: that.ProcurementHubSourceSystem
						});

						aFilters.push(oUoMFilter);

					}
					oModel.read(url, {
						filters: aFilters,
						success: function (oResponse) {

							if (oResponse && oResponse.results) {
								if (oResponse.results.length === 0) {
									that.getView().byId("DialogApplyBtn").setEnabled(false);
									that.getView().byId("DialogSimulateBtn").setEnabled(false);
									var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
									dependendsofMandateFields();
									// that.getView().byId("PurgDocNoteText").setEnabled(false);
									// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
									var smartIndex = that.MandateFieldChanged.indexOf("ProcmtHubPurchasingGroup");
									if (smartIndex > -1) {
										that.MandateFieldChanged.splice(smartIndex, 1);
									}
									that.getView().byId("ProcmtHubPurchasingGroup").setValueState("Error");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("ProcmtHubPurchasingGroup");
									if (ValueStateIndex < 0) {
										that.ValueStateErrorFields.push("ProcmtHubPurchasingGroup");
									}

									var errMsg;
									//error message thrown based of if the value change in Purchasing Group triggered or the company code
									if (that.companyCodeChanged && that.companyCodeChanged === "X") {
										errMsg = that.oBundleText.getText("PurchGrpCompanyCodeError");
									} else {
										errMsg = that.oBundleText.getText("purchGrpMsg");
									}

									//	var errMsg = that.oBundleText.getText("purchGrpMsg");
									that.getView().byId("ProcmtHubPurchasingGroup").setValueStateText(errMsg);
								} else {
									//if the value entered is a valid value then enableApplyChange is triggered for further processing 
									that.getView().byId("ProcmtHubPurchasingGroup").setValueState("None");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("ProcmtHubPurchasingGroup", that);

									if (ValueStateIndex > -1) {
										that.ValueStateErrorFields.splice(ValueStateIndex, 1);
									}
									enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
									enableApplyChange("ProcmtHubPurchasingGroup");
									//that.AddDistribution.enableApplyChange("ProcmtHubPurchasingGroup", that);
								}
							}

						},
						error: function (oError) {}
					});
				}
			} else {
				that.getView().byId("DialogApplyBtn").setEnabled(false);
				that.getView().byId("DialogSimulateBtn").setEnabled(false);
				var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
				dependendsofMandateFields();
				// that.getView().byId("PurgDocNoteText").setEnabled(false);
				// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
				var smartIndex = that.MandateFieldChanged.indexOf("ProcmtHubPurchasingGroup");
				if (smartIndex > -1) {
					that.MandateFieldChanged.splice(smartIndex, 1);
				}
				that.getView().byId("ProcmtHubPurchasingGroup").setValueState("Error");
				ValueStateIndex = that.ValueStateErrorFields.indexOf("ProcmtHubPurchasingGroup");
				if (ValueStateIndex < 0) {
					that.ValueStateErrorFields.push("ProcmtHubPurchasingGroup");
				}

				var errMsg;
				if (that.companyCodeChanged && that.companyCodeChanged === "X") {
					errMsg = that.oBundleText.getText("PurchGrpCompanyCodeError");
				} else {
					errMsg = that.oBundleText.getText("purchGrpMsg");
				}

				//	var errMsg = that.oBundleText.getText("purchGrpMsg");
				that.getView().byId("ProcmtHubPurchasingGroup").setValueStateText(errMsg);
			}
		},

		validateDependentFieldsOfCC: function () {
			var PlantVal, PurchasingOrg, StorageLocation, PurchasingGrp, PurgDocumentDistributionType;
			PlantVal = this.getView().byId("Plant").getValue();
			if (PlantVal) {
				var PlantValidate = this.AddDistribution.validatePlant.bind(this);
				PlantValidate();
				//	this.AddDistribution.validatePlant();
			}
			PurchasingOrg = this.getView().byId("ProcmtHubPurchasingOrg").getValue();
			if (PurchasingOrg) {
				//	this.AddDistribution.validatePurchasingOrg();
				var validatePurchasingOrg = this.AddDistribution.validatePurchasingOrg.bind(this);
				validatePurchasingOrg();
			}
			PurchasingGrp = this.getView().byId("ProcmtHubPurchasingGroup").getValue();
			if (PurchasingGrp) {
				var validatePurchasingGrp = this.AddDistribution.validatePurchasingGrp.bind(this);
				validatePurchasingGrp();
				//	this.AddDistribution.validatePurchasingGrp();
			}
			StorageLocation = this.getView().byId("StorageLocation").getValue();
			if (StorageLocation) {
				//	this.AddDistribution.validateStorageLocation();
				var validateStorageLocation = this.AddDistribution.validateStorageLocation.bind(this);
				validateStorageLocation();
			}
			PurgDocumentDistributionType = this.getView().byId("PurgDocumentDistributionType").getValue();
			if (PurgDocumentDistributionType) {
				var validatePurgDocumentDistributionType = this.AddDistribution.validatePurgDocumentDistributionType.bind(this);
				validatePurgDocumentDistributionType();
				//that.AddDistribution.validatePurgDocumentDistributionType();
			}
		},

		hideDependentfieldsOfCC: function () {
			var spliceIndex;
			this.getView().byId("Plant").setEditable(false);
			this.getView().byId("Plant").setValue("");
			spliceIndex = this.MandateFieldChanged.indexOf("Plant");
			if (spliceIndex > -1) {
				this.MandateFieldChanged.splice(spliceIndex, 1);
			}
			this.getView().byId("ProcmtHubPurchasingOrg").setEditable(false);
			this.getView().byId("ProcmtHubPurchasingOrg").setValue("");
			spliceIndex = this.MandateFieldChanged.indexOf("ProcmtHubPurchasingOrg");
			if (spliceIndex > -1) {
				this.MandateFieldChanged.splice(spliceIndex, 1);
			}
			this.getView().byId("ProcmtHubPurchasingGroup").setEditable(false);
			this.getView().byId("ProcmtHubPurchasingGroup").setValue("");
			spliceIndex = this.MandateFieldChanged.indexOf("ProcmtHubPurchasingGroup");
			if (spliceIndex > -1) {
				this.MandateFieldChanged.splice(spliceIndex, 1);
			}
			this.getView().byId("StorageLocation").setEditable(false);
			this.getView().byId("StorageLocation").setValue("");
			spliceIndex = this.MandateFieldChanged.indexOf("StorageLocation");
			if (spliceIndex > -1) {
				this.MandateFieldChanged.splice(spliceIndex, 1);
			}
			this.getView().byId("PurgDocumentDistributionType").setEditable(false);
			this.getView().byId("PurgDocumentDistributionType").setValue("");
			spliceIndex = this.MandateFieldChanged.indexOf("PurgDocumentDistributionType");
			if (spliceIndex > -1) {
				this.MandateFieldChanged.splice(spliceIndex, 1);
			}
		},

		//this method is triggered when the value is entered in Company Code field and on tab out.
		validateCompanyCode: function (oEvent) {
			//maxlength for the plant field extracted from metadata.
			var maxLength = this.getView().getModel().getMetaModel().getODataProperty(this.fieldLength,
				"ProcmtHubCompanyCode").maxLength;
			var that = this;
			var ValueStateIndex, enableApplyChange, validateDependentFieldsOfCC;
			//	var PlantVal, PurchasingOrg, StorageLocation, PurchasingGrp, PurgDocumentDistributionType;
			//flag indicating the value was selected from the value help
			var validated = oEvent.getParameter("validated");
			var newValue = oEvent.getParameter("newValue");
			//data	is processed only if the length of value entered is <= maxlength of the field
			if (newValue.length <= Number(maxLength) && newValue !== undefined && newValue !== "") {
				this.getView().byId("DialogResetBtn").setEnabled(true);
				// that.getView().byId("PurgDocNoteText").setEnabled(true);
				// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(true);
				if (validated) {
					//Setting the dependant field as editable since the company code has valid value slected from VH.
					that.getView().byId("Plant").setEditable(true);
					that.getView().byId("ProcmtHubPurchasingGroup").setEditable(true);
					that.getView().byId("ProcmtHubPurchasingOrg").setEditable(true);
					if (that.getView().byId("ProcmtHubPurgDocItmCategory").getValue() === "L") {
						that.getView().byId("PurgDocumentDistributionType").setEditable(true);
					}
					that.getView().byId("StorageLocation").setEditable(true);
					enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
					enableApplyChange("ProcmtHubCompanyCode");
					//	that.AddDistribution.enableApplyChange("ProcmtHubCompanyCode", that);
					//if the dependant fields were already field based on source syatem of previous company code. 
					//teh validation for those fields are fired again with the source systenm id of new company code
					//that.AddDistribution.validateDependentFieldsOfCC(that);
					validateDependentFieldsOfCC = that.AddDistribution.validateDependentFieldsOfCC.bind(that);
					validateDependentFieldsOfCC();
				} else {
					var aFilters = [];
					var oModel = this.getView().getModel();
					var url = "/C_ProcmtHubCompanyCodeVH";
					var oUoMFilter = new sap.ui.model.Filter({
						path: "ProcmtHubCompanyCode",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: newValue
					});
					aFilters.push(oUoMFilter);
					oModel.read(url, {
						filters: aFilters,
						success: function (oResponse) {

							if (oResponse && oResponse.results) {
								if (oResponse.results.length === 0) {
									//if the value of company code entered was not valid then all the dependant fields are made non editable
									that.ProcurementHubSourceSystem = "";
									var hideDependentfieldsOfCC = that.AddDistribution.hideDependentfieldsOfCC.bind(that);
									hideDependentfieldsOfCC();
									//	that.AddDistribution.hideDependentfieldsOfCC();
									that.getView().byId("DialogApplyBtn").setEnabled(false);
									that.getView().byId("DialogSimulateBtn").setEnabled(false);
									var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
									dependendsofMandateFields();
									// that.getView().byId("PurgDocNoteText").setEnabled(false);
									// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
									var smartIndex = that.MandateFieldChanged.indexOf("ProcmtHubCompanyCode");
									if (smartIndex > -1) {
										that.MandateFieldChanged.splice(smartIndex, 1);
									}
									that.getView().byId("ProcmtHubCompanyCode").setValueState("Error");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("ProcmtHubCompanyCode");
									if (ValueStateIndex < 0) {
										that.ValueStateErrorFields.push("ProcmtHubCompanyCode");
									}

									var errMsg = that.oBundleText.getText("companycodeMsg");
									that.getView().byId("ProcmtHubCompanyCode").setValueStateText(errMsg);

								} else {
									//picking the first sourcesystem from the response for processing of dependant fields
									that.ProcurementHubSourceSystem = oResponse.results[0].ProcurementHubSourceSystem;
									//setting the editable property to true since the value entered for company code was valid	
									that.getView().byId("Plant").setEditable(true);
									that.getView().byId("ProcmtHubPurchasingGroup").setEditable(true);
									that.getView().byId("ProcmtHubPurchasingOrg").setEditable(true);
									if (that.getView().byId("ProcmtHubPurgDocItmCategory").getValue() === "L") {
										that.getView().byId("PurgDocumentDistributionType").setEditable(true);
									}
									that.getView().byId("StorageLocation").setEditable(true);
									enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
									enableApplyChange("ProcmtHubCompanyCode");
									//	that.AddDistribution.enableApplyChange("ProcmtHubCompanyCode", that);

									//if the dependant fields were already field based on source syatem of previous company code.
									//teh validation for those fields are fired again with the source systenm id of new company code
									validateDependentFieldsOfCC = that.AddDistribution.validateDependentFieldsOfCC.bind(that);
									validateDependentFieldsOfCC();
								}
							}

						},
						error: function (oError) {}
					});
				}
			} else {
				if (newValue.length > 0) {
					this.getView().byId("DialogResetBtn").setEnabled(true);
				}
				//if the company code value was cleared or wrong value was entered then the dependant fields were made editable false
				//	that.AddDistribution.hideDependentfieldsOfCC();
				var hideDependentfieldsOfCC = that.AddDistribution.hideDependentfieldsOfCC.bind(that);
				hideDependentfieldsOfCC();
				that.getView().byId("DialogApplyBtn").setEnabled(false);
				that.getView().byId("DialogSimulateBtn").setEnabled(false);
				var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
				dependendsofMandateFields();
				// that.getView().byId("PurgDocNoteText").setEnabled(false);
				// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);

				var smartIndex = that.MandateFieldChanged.indexOf("ProcmtHubCompanyCode");
				if (smartIndex > -1) {
					that.MandateFieldChanged.splice(smartIndex, 1);
				}
				that.getView().byId("ProcmtHubCompanyCode").setValueState("Error");
				ValueStateIndex = that.ValueStateErrorFields.indexOf("ProcmtHubCompanyCode");
				if (ValueStateIndex < 0) {
					that.ValueStateErrorFields.push("ProcmtHubCompanyCode");
				}

				var errMsg = that.oBundleText.getText("companycodeMsg");
				that.getView().byId("ProcmtHubCompanyCode").setValueStateText(errMsg);
			}
		},

		//This method is triggered when the value is entered in document category field and on tab out.
		validateItmCategory: function (oEvent) {
			var ValueStateIndex;
			var newValue = oEvent.getParameter("newValue");
			// if (newValue) {
			this.getView().byId("DialogResetBtn").setEnabled(true);
			// } 
			// else if (oEvent.getSource().getAggregation("_content")._lastValue) {
			// 	this.AddDistribution.viewControl.getView().byId("DialogResetBtn").setEnabled(true);
			// }
			//setting the editable property of outline agreement type based on the document category selected
			if (newValue === "L" && this.getView().byId("ProcmtHubCompanyCode").getValue()) {
				this.getView().byId("PurgDocumentDistributionType").setEditable(true);
			} else {
				this.getView().byId("PurgDocumentDistributionType").setEditable(false);
				var OutlineagreementType = this.getView().byId("PurgDocumentDistributionType").getValue();
				if (OutlineagreementType) {
					this.getView().byId("PurgDocumentDistributionType").setValue("");
				}
				var smartIndex = this.MandateFieldChanged.indexOf("PurgDocumentDistributionType");
				if (smartIndex > -1) {
					this.MandateFieldChanged.splice(smartIndex, 1);
				}

			}
			//further processing of data only if the valid values are entered
			if (newValue === "L" || newValue === "K") {
				//setting the mandatory property of plant field based on the document category selected
				var category = this.getView().byId("ProcmtHubPurgDocItmCategory").getValue();
				var PlantValue = this.getView().byId("Plant").getValue();
				var smartFieldIndex = this.MandateFieldChanged.indexOf("Plant");
				var nonmandateIndex = this.nonMandateFieldChanged.indexOf("Plant");
				//Plant Mandatory
				if (category === "L" && nonmandateIndex > -1 && PlantValue) {
					this.nonMandateFieldChanged.splice(nonmandateIndex, 1);
					this.MandateFieldChanged.push("Plant");
				} else if (category === "K" && smartFieldIndex > -1 && PlantValue) {
					this.MandateFieldChanged.splice(smartFieldIndex, 1);
					this.nonMandateFieldChanged.push("Plant");
				}
				//OutlineAgreement Type
				var OutlineAgreementType = this.getView().byId("PurgDocumentDistributionType").getValue();
				smartFieldIndex = this.MandateFieldChanged.indexOf("PurgDocumentDistributionType");
				if (category === "K" && smartFieldIndex > -1 && OutlineAgreementType) {
					this.MandateFieldChanged.splice(smartFieldIndex, 1);
					this.getView().byId("PurgDocumentDistributionType").setValue("");
				}
				//	this.AddDistribution.enableApplyChange("ProcmtHubPurgDocItmCategory", this);
				var enableApplyChange = this.AddDistribution.enableApplyChange.bind(this);
				enableApplyChange("ProcmtHubPurgDocItmCategory");
			} else {
				this.getView().byId("ProcmtHubPurgDocItmCategory").setValueState("Error");

				ValueStateIndex = this.ValueStateErrorFields.indexOf("ProcmtHubPurgDocItmCategory");
				if (ValueStateIndex < 0) {
					this.ValueStateErrorFields.push("ProcmtHubPurgDocItmCategory");
				}

				var errMsg = this.oBundleText.getText("documentCatMsg");
				this.getView().byId("ProcmtHubPurgDocItmCategory").setValueStateText(errMsg);
				this.getView().byId("DialogApplyBtn").setEnabled(false);
				this.getView().byId("DialogSimulateBtn").setEnabled(false);
				var dependendsofMandateFields = this.AddDistribution.dependendsofMandateFields.bind(this);
				dependendsofMandateFields();
				// this.getView().byId("PurgDocNoteText").setEnabled(false);
				// this.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
				smartIndex = this.MandateFieldChanged.indexOf("ProcmtHubPurgDocItmCategory");
				if (smartIndex > -1) {
					this.MandateFieldChanged.splice(smartIndex, 1);
				}
			}
		},

		//this.AddDistribution.viewControl method is triggered when the value is entered in Distribution Percenatge field and on tab out.
		validateDistributionPercentage: function (oEvent) {
			var ValueStateIndex;
			this.getView().byId("DialogResetBtn").setEnabled(true);
			var newValue = oEvent.getParameter("newValue");
			var ValueState = this.getView().byId("CntrlPurContrDistributionPct").getValueState();
			//if the value entered is >0 and <100
			if (newValue !== "" && parseFloat(newValue) <= 100 && parseFloat(newValue) >= 0 && ValueState !== sap.ui.core.ValueState.Error) {
				//	this.AddDistribution.enableApplyChange("CntrlPurContrDistributionPct", this);
				var enableApplyChange = this.AddDistribution.enableApplyChange.bind(this);
				enableApplyChange("CntrlPurContrDistributionPct");
			} else {
				this.getView().byId("CntrlPurContrDistributionPct").setValueState("Error");
				ValueStateIndex = this.ValueStateErrorFields.indexOf("CntrlPurContrDistributionPct");
				if (ValueStateIndex < 0) {
					this.ValueStateErrorFields.push("CntrlPurContrDistributionPct");
				}

				var errMsg = this.oBundleText.getText("distPercntError");
				this.getView().byId("CntrlPurContrDistributionPct").setValueStateText(errMsg);
				this.getView().byId("DialogApplyBtn").setEnabled(false);
				this.getView().byId("DialogSimulateBtn").setEnabled(false);
				var dependendsofMandateFields = this.AddDistribution.dependendsofMandateFields.bind(this);
				dependendsofMandateFields();
				// this.getView().byId("PurgDocNoteText").setEnabled(false);
				// this.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
				var smartIndex = this.MandateFieldChanged.indexOf("CntrlPurContrDistributionPct");
				if (smartIndex > -1) {
					this.MandateFieldChanged.splice(smartIndex, 1);
				}
			}
		},

		//This method is triggered when the value is entered in Storage Location field and on tab out.
		validateStorageLocation: function (oEvent) {
			//maxlength for the plant field extracted from metadata.

			var maxLength = this.getView().getModel().getMetaModel().getODataProperty(this.fieldLength, "StorageLocation")
				.maxLength;
			this.companyCodeChanged = "";
			var that = this;
			var newValue, validated, plantVal, plantIndexMandate, plantIndexNonMandate, ValueStateIndex, enableApplyChange;
			//flag to check if the method was triggered from change of value in Storage Location field or from Company Code
			if (oEvent) {
				newValue = oEvent.getParameter("newValue");
				//flag indicating the value was selected from the value help
				validated = oEvent.getParameter("validated");
			} else {
				newValue = this.getView().byId("StorageLocation").getValue();
				//flag set when company code triggered this method
				this.companyCodeChanged = "X";

			}
			//data is processed only if the length of value entered is <= maxlength of the field
			if (newValue.length <= Number(maxLength) && newValue !== undefined && newValue !== "") {
				//since the value was selectedc from value help no validation check is done and directly call method enableApplyChange method for further processing
				if (validated) {
					//	if the plant field is filled on entering the value for storage location then the MandateFieldChanged and nonmandate array are updated based out outlinegareement type
					plantVal = that.getView().byId("Plant").getValue();
					plantIndexMandate = that.MandateFieldChanged.indexOf("Plant");
					plantIndexNonMandate = that.nonMandateFieldChanged.indexOf("Plant");
					if (plantVal && plantIndexMandate < 0 && that.DocumentCategory === "L") {
						that.MandateFieldChanged.push("Plant");
					} else if (plantVal && plantIndexNonMandate < 0) {
						that.nonMandateFieldChanged.push("Plant");
					}
					//	that.AddDistribution.enableApplyChange("StorageLocation", that);
					enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
					enableApplyChange("StorageLocation");
				}
				//Validation check for the values directly entered by user and not from value help
				else {
					var aFilters = [];
					var oUoMFilter;
					var oModel = this.getView().getModel();
					var url = "/C_ProcmtHubStorageLocationVH";
					var Plant = this.getView().byId("Plant").getValue();
					oUoMFilter = new sap.ui.model.Filter({
						path: "StorageLocation",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: newValue
					});
					aFilters.push(oUoMFilter);
					//sending the Plant if already populated for filetrs
					if (Plant) {
						oUoMFilter = new sap.ui.model.Filter({
							path: "Plant",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: Plant
						});
						aFilters.push(oUoMFilter);
					}
					//sending the source system ID from the selected company code
					if (that.ProcurementHubSourceSystem) {
						oUoMFilter = new sap.ui.model.Filter({
							path: "ProcurementHubSourceSystem",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: that.ProcurementHubSourceSystem
						});
						aFilters.push(oUoMFilter);
					}
					oModel.read(url, {
						filters: aFilters,
						success: function (oResponse) {

							if (oResponse && oResponse.results) {
								if (oResponse.results.length === 0) {
									that.getView().byId("DialogApplyBtn").setEnabled(false);
									that.getView().byId("DialogSimulateBtn").setEnabled(false);
									// that.getView().byId("PurgDocNoteText").setEnabled(false);
									// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
									var nonmandateIndex = that.nonMandateFieldChanged.indexOf("StorageLocation");
									if (nonmandateIndex > -1) {
										that.nonMandateFieldChanged.splice(nonmandateIndex, 1);
									}
									that.getView().byId("StorageLocation").setValueState("Error");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("StorageLocation");
									if (ValueStateIndex < 0) {
										that.ValueStateErrorFields.push("StorageLocation");
									}

									var errMsg;
									//error message thrown based of if the value change in plant triggered or the company code
									if (that.companyCodeChanged && that.companyCodeChanged === "X") {
										errMsg = that.oBundleText.getText("StorageLocCompanyCodeError");
									} else {
										errMsg = that.oBundleText.getText("storageLocationMsg");
									}
									//	var errMsg = that.oBundleText.getText("storageLocationMsg");
									that.getView().byId("StorageLocation").setValueStateText(errMsg);
								} else {
									that.getView().byId("StorageLocation").setValueState("None");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("StorageLocation");

									if (ValueStateIndex > -1) {
										that.ValueStateErrorFields.splice(ValueStateIndex, 1);
									}

									plantVal = that.getView().byId("Plant").getValue();
									plantIndexMandate = that.MandateFieldChanged.indexOf("Plant");
									plantIndexNonMandate = that.nonMandateFieldChanged.indexOf("Plant");
									if (plantVal && plantIndexMandate < 0 && that.DocumentCategory === "L") {
										that.MandateFieldChanged.push("Plant");
									} else if (plantVal && plantIndexNonMandate < 0 && that.DocumentCategory === "K") {
										that.nonMandateFieldChanged.push("Plant");
									}
									//	that.AddDistribution.enableApplyChange("StorageLocation", that);
									enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
									enableApplyChange("StorageLocation");
								}
							}

						},
						error: function (oError) {}
					});
				}
			} else {
				if (newValue.length > 0) {
					ValueStateIndex = that.ValueStateErrorFields.indexOf("StorageLocation");
					if (ValueStateIndex < 0) {
						that.ValueStateErrorFields.push("StorageLocation");
					}

				} else {
					ValueStateIndex = that.ValueStateErrorFields.indexOf("StorageLocation");

					if (ValueStateIndex > -1) {
						that.ValueStateErrorFields.splice(ValueStateIndex, 1);
					}

				}

				var nonmandateIndex = that.nonMandateFieldChanged.indexOf("StorageLocation");
				if (nonmandateIndex > -1) {
					that.nonMandateFieldChanged.splice(nonmandateIndex, 1);
				}
				//check for enabling the Apply Mass Changes button 
				if ((that.MandateFieldChanged.length === 5 && that.DocumentCategory === "K" && that.ValueStateErrorFields.length === 0) || (that.MandateFieldChanged
						.length === 7 && that.DocumentCategory ===
						"L" && that.ValueStateErrorFields.length === 0)) {
					that.getView().byId("DialogApplyBtn").setEnabled(true);
					that.getView().byId("DialogSimulateBtn").setEnabled(true);
					that.getView().byId("PurgDocNoteText").setEnabled(true);
					that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(true);
				} else {
					that.getView().byId("DialogApplyBtn").setEnabled(false);
					that.getView().byId("DialogSimulateBtn").setEnabled(false);
					// that.getView().byId("PurgDocNoteText").setEnabled(false);
					// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
				}
			}
		},

		//This method is triggered when the value is entered in plant field and on tab out.
		validatePurchasingInfoRecordUpdateCode: function (oEvent) {
			//maxlength for the plant field extracted from metadata.
			var maxLength = this.getView().getModel().getMetaModel().getODataProperty(this.fieldLength, "PurchasingInfoRecordUpdateCode").maxLength;

			this.companyCodeChanged = "";
			var that = this,
				ValueStateIndex, enableApplyChange;
			//flag indicating the value was selected from the value help
			var validated = oEvent.getParameter("validated");
			var newValue = oEvent.getParameter("newValue");
			if (newValue.length > 0) {
				this.getView().byId("DialogResetBtn").setEnabled(true);
			}
			//data is processed only if the length of value entered is <= maxlength of the field
			if (newValue.length <= Number(maxLength) && newValue !== undefined && newValue !== "") {

				this.getView().byId("DialogResetBtn").setEnabled(true);
				if (validated) {
					//since the value was selectedc from value help no validation check is done and directly call method enableApplyChange method for further processing
					//	that.AddDistribution.enableApplyChange("PurchasingInfoRecordUpdateCode", that);
					enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
					enableApplyChange("PurchasingInfoRecordUpdateCode");
				}
				//Validation check for the values directly entered by user and not from value help
				else {
					var aFilters = [];
					var oModel = this.getView().getModel();
					var url = "/I_PurgInfoRecordUpdateCode";
					var oUoMFilter = new sap.ui.model.Filter({
						path: "PurchasingInfoRecordUpdateCode",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: newValue
					});
					aFilters.push(oUoMFilter);
					oModel.read(url, {
						filters: aFilters,
						success: function (oResponse) {

							if (oResponse && oResponse.results) {
								if (oResponse.results.length === 0) {
									that.getView().byId("DialogApplyBtn").setEnabled(false);
									that.getView().byId("DialogSimulateBtn").setEnabled(false);
									// that.getView().byId("PurgDocNoteText").setEnabled(false);
									// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
									var nonmandateIndex = that.nonMandateFieldChanged.indexOf("PurchasingInfoRecordUpdateCode");
									if (nonmandateIndex > -1) {
										that.nonMandateFieldChanged.splice(nonmandateIndex, 1);
									}
									that.getView().byId("PurchasingInfoRecordUpdateCode").setValueState("Error");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("PurchasingInfoRecordUpdateCode");
									if (ValueStateIndex < 0) {
										that.ValueStateErrorFields.push("PurchasingInfoRecordUpdateCode");
									}

									var errMsg = that.oBundleText.getText("infoRecordUpdateMsg");
									that.getView().byId("PurchasingInfoRecordUpdateCode").setValueStateText(errMsg);
								} else {
									//if the value entered is a valid value then enableApplyChange is triggered for further processing 
									that.getView().byId("PurchasingInfoRecordUpdateCode").setValueState("None");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("PurchasingInfoRecordUpdateCode");

									if (ValueStateIndex > -1) {
										that.ValueStateErrorFields.splice(ValueStateIndex, 1);
									}
									enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
									enableApplyChange("PurchasingInfoRecordUpdateCode");
									//	that.AddDistribution.enableApplyChange("PurchasingInfoRecordUpdateCode", that);
								}
							}

						},
						error: function (oError) {}
					});
				}
			} else {
				if (newValue.length > 0) {
					ValueStateIndex = that.ValueStateErrorFields.indexOf("PurchasingInfoRecordUpdateCode");
					if (ValueStateIndex < 0) {
						that.ValueStateErrorFields.push("PurchasingInfoRecordUpdateCode");
					}

				} else {
					ValueStateIndex = that.ValueStateErrorFields.indexOf("PurchasingInfoRecordUpdateCode");

					if (ValueStateIndex > -1) {
						that.ValueStateErrorFields.splice(ValueStateIndex, 1);
					}

				}
				var nonmandateIndex = that.nonMandateFieldChanged.indexOf("PurchasingInfoRecordUpdateCode");
				if (nonmandateIndex > -1) {
					that.nonMandateFieldChanged.splice(nonmandateIndex, 1);
				}
				//check for enabling the Apply Mass Changes button 
				if ((that.MandateFieldChanged.length === 5 && that.DocumentCategory === "K" && that.ValueStateErrorFields.length === 0) || (that.MandateFieldChanged
						.length === 7 && that.DocumentCategory ===
						"L" && that.ValueStateErrorFields.length === 0)) {
					that.getView().byId("DialogApplyBtn").setEnabled(true);
					that.getView().byId("DialogSimulateBtn").setEnabled(true);
					that.getView().byId("PurgDocNoteText").setEnabled(true);
					that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(true);
				} else {
					that.getView().byId("DialogApplyBtn").setEnabled(false);
					that.getView().byId("DialogSimulateBtn").setEnabled(false);
					// that.getView().byId("PurgDocNoteText").setEnabled(false);
					// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
				}
			}
		},

		//This method is triggered when the value is entered in Reason Code field and on tab out.
		validatePurchasingDocVersionReasonCode: function (oEvent) {

			var newValue = oEvent.getParameters().newValue;
			//check from the combo box the value entered , here when an invalid value is entered the value in the combo box hold the entred value and the smartfield hold teh value as blank
			//hence it is possible to differentiate between clearing teh value and wrong value entered
			var valueFromComboBox =
				this.getView().byId(
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--PurchasingDocVersionReasonCode-comboBoxEdit"
				).getValue();
			if (newValue === "" && valueFromComboBox !== "") {
				this.getView().byId("PurchasingDocVersionReasonCode").setValueState("Error");
				this.getView().byId("PurchasingDocVersionReasonCode").setValueStateText(this.oBundleText.getText("ReasonCodeErrText"));
				this.getView().byId("DialogApplyBtn").setEnabled(false);
				this.getView().byId("DialogSimulateBtn").setEnabled(false);
				//when the value entered is invalid mark this field as errorneaous field to further process the apply changes buttob
				this.ValueStateErrorFields.push("PurchasingDocVersionReasonCode");
			} else {
				this.getView().byId("PurchasingDocVersionReasonCode").setValueState("None");
				this.getView().byId("PurchasingDocVersionReasonCode").setValueStateText("");
				//	this.getView().byId("DialogApplyBtn").setEnabled(true);
				//if the previously entred value was errorneous then this field is removed from the errorneous array after the valid value is entered
				var ValueStateIndex = this.ValueStateErrorFields.indexOf("PurchasingDocVersionReasonCode");
				if (ValueStateIndex > -1) {
					this.ValueStateErrorFields.splice(ValueStateIndex, 1);
				}
				// manadate field check not required since the fields will be enabled only after the mandate fileds are filled with correct values
				if (this.ValueStateErrorFields.length < 1) {
					this.getView().byId("DialogApplyBtn").setEnabled(true);
					this.getView().byId("DialogSimulateBtn").setEnabled(true);
				}
			}
		},

		//This method is triggered when the value is entered in Payment Terms field and on tab out.
		validatePaymentTerms: function (oEvent) {
			//maxlength for the Payment Terms field extracted from metadata.
			var maxLength = this.getView().getModel().getMetaModel().getODataProperty(this.fieldLength, "PaymentTerms").maxLength;
			var that = this;
			var ValueStateIndex, enableApplyChange;
			//flag indicating the value was selected from the value help
			var validated = oEvent.getParameter("validated");
			var newValue = oEvent.getParameter("newValue");
			if (newValue.length > 0) {
				this.getView().byId("DialogResetBtn").setEnabled(true);
			}
			//data is processed only if the length of value entered is <= maxlength of the field
			if (newValue.length <= Number(maxLength) && newValue !== undefined && newValue !== "") {
				this.getView().byId("DialogResetBtn").setEnabled(true);
				//since the value was selectedc from value help no validation check is done and directly call method enableApplyChange method for further processing
				if (validated) {
					enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
					enableApplyChange("PaymentTerms");
					//	that.AddDistribution.enableApplyChange("PaymentTerms", that);
				}
				//Validation check for the values directly entered by user and not from value help
				else {
					var aFilters = [];
					var oModel = this.getView().getModel();
					var url = "/I_PaymentTerms";
					var oUoMFilter = new sap.ui.model.Filter({
						path: "PaymentTerms",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: newValue
					});
					aFilters.push(oUoMFilter);
					oModel.read(url, {
						filters: aFilters,
						success: function (oResponse) {

							if (oResponse && oResponse.results) {
								if (oResponse.results.length === 0) {
									that.getView().byId("DialogApplyBtn").setEnabled(false);
									that.getView().byId("DialogSimulateBtn").setEnabled(false);
									// that.getView().byId("PurgDocNoteText").setEnabled(false);
									// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
									var nonmandateIndex = that.nonMandateFieldChanged.indexOf("PaymentTerms");
									if (nonmandateIndex > -1) {
										that.nonMandateFieldChanged.splice(nonmandateIndex, 1);
									}
									that.getView().byId("PaymentTerms").setValueState("Error");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("PaymentTerms");
									if (ValueStateIndex < 0) {
										that.ValueStateErrorFields.push("PaymentTerms");
									}

									var errMsg = that.oBundleText.getText("paymentTermsMsg");
									that.getView().byId("PaymentTerms").setValueStateText(errMsg);

								} else {
									//if the value entered is a valid value then enableApplyChange is triggered for further processing 
									that.getView().byId("PurchasingInfoRecordUpdateCode").setValueState("None");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("PurchasingInfoRecordUpdateCode");

									if (ValueStateIndex > -1) {
										that.ValueStateErrorFields.splice(ValueStateIndex, 1);
									}
									enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
									enableApplyChange("PaymentTerms");
									//	that.AddDistribution.enableApplyChange("PaymentTerms", that);
								}
							}

						},
						error: function (oError) {}
					});
				}
			} else {
				if (newValue.length > 0) {
					ValueStateIndex = that.ValueStateErrorFields.indexOf("PaymentTerms");
					if (ValueStateIndex < 0) {
						that.ValueStateErrorFields.push("PaymentTerms");
					}

				} else {
					ValueStateIndex = that.ValueStateErrorFields.indexOf("PaymentTerms");

					if (ValueStateIndex > -1) {
						that.ValueStateErrorFields.splice(ValueStateIndex, 1);
					}

				}
				// if(!newValue)
				// that.getView().byId("PaymentTerms").setValueState("None");
				var nonmandateIndex = that.nonMandateFieldChanged.indexOf("PaymentTerms");
				if (nonmandateIndex > -1) {
					that.nonMandateFieldChanged.splice(nonmandateIndex, 1);
				}
				//check for enabling the Apply Mass Changes button 
				if ((that.MandateFieldChanged.length === 5 && that.DocumentCategory === "K" && that.ValueStateErrorFields.length === 0) || (that.MandateFieldChanged
						.length === 7 && that.DocumentCategory ===
						"L" && that.ValueStateErrorFields.length === 0)) {
					that.getView().byId("DialogApplyBtn").setEnabled(true);
					that.getView().byId("DialogSimulateBtn").setEnabled(true);
					that.getView().byId("PurgDocNoteText").setEnabled(true);
					that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(true);
				} else {
					that.getView().byId("DialogApplyBtn").setEnabled(false);
					that.getView().byId("DialogSimulateBtn").setEnabled(false);
					// that.getView().byId("PurgDocNoteText").setEnabled(false);
					// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
				}
			}
		},

		//This method is triggered when the value is entered in Outline Agreement Type  field and on tab out.
		validatePurgDocumentDistributionType: function (oEvent) {
			var maxLength = this.getView().getModel().getMetaModel().getODataProperty(this.fieldLength,
				"PurgDocumentDistributionType").maxLength;
			this.companyCodeChanged = "";

			var that = this;
			var newValue, validated, ValueStateIndex, enableApplyChange;
			//flag to check if the method was triggered from change of value in Plant field or from Company Code
			if (oEvent) {
				newValue = oEvent.getParameter("newValue");
				//flag indicating the value was selected from the value help
				validated = oEvent.getParameter("validated");
			} else {
				newValue = this.getView().byId("PurgDocumentDistributionType").getValue();
				//flag set when company code triggered this method
				this.companyCodeChanged = "X";
			}

			//data is processed only if the length of value entered is <= maxlength of the field
			if (newValue.length <= Number(maxLength) && newValue !== undefined && newValue !== "") {
				this.getView().byId("DialogResetBtn").setEnabled(true);
				that.getView().byId("PurgDocNoteText").setEnabled(true);
				that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(true);
				//since the value was selectedc from value help no validation check is done and directly call method enableApplyChange method for further processing
				if (validated) {
					enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
					enableApplyChange("PurgDocumentDistributionType");
					//	that.AddDistribution.enableApplyChange("PurgDocumentDistributionType", that);
				}
				//Validation check for the values directly entered by user and not from value help
				else {
					var aFilters = [];
					var oModel = this.getView().getModel();
					var url = "/C_ProcmtHubSchedgAgrmtTypeVH";
					var oUoMFilter = new sap.ui.model.Filter({
						path: "PurchasingDocumentType",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: newValue
					});
					aFilters.push(oUoMFilter);
					//sending the source system ID from the selected company code
					if (that.ProcurementHubSourceSystem) {
						oUoMFilter = new sap.ui.model.Filter({
							path: "ProcurementHubSourceSystem",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: that.ProcurementHubSourceSystem
						});
						aFilters.push(oUoMFilter);
					}
					oModel.read(url, {
						filters: aFilters,
						success: function (oResponse) {

							if (oResponse && oResponse.results) {
								if (oResponse.results.length === 0) {
									that.getView().byId("DialogApplyBtn").setEnabled(false);
									that.getView().byId("DialogSimulateBtn").setEnabled(false);
									var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
									dependendsofMandateFields();
									// that.getView().byId("PurgDocNoteText").setEnabled(false);
									// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
									var mandateIndex = that.MandateFieldChanged.indexOf("PurgDocumentDistributionType");
									if (mandateIndex > -1) {
										that.MandateFieldChanged.splice(mandateIndex, 1);
									}
									that.getView().byId("PurgDocumentDistributionType").setValueState("Error");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("PurgDocumentDistributionType");
									if (ValueStateIndex < 0) {
										that.ValueStateErrorFields.push("PurgDocumentDistributionType");
									}

									var errMsg;
									//error message thrown based of if the value change in plant triggered or the company code
									if (that.companyCodeChanged && that.companyCodeChanged === "X") {
										errMsg = that.oBundleText.getText("outlAgrmntCompanyCodeError");
									} else {
										errMsg = that.oBundleText.getText("outlineAgrmntTypMsg");
									}
									//var errMsg = that.oBundleText.getText("outlineAgrmntTypMsg");
									that.getView().byId("PurgDocumentDistributionType").setValueStateText(errMsg);
								} else {
									//if the value entered is a valid value then enableApplyChange is triggered for further processing 
									that.getView().byId("PurgDocumentDistributionType").setValueState("None");
									ValueStateIndex = that.ValueStateErrorFields.indexOf("PurgDocumentDistributionType");

									if (ValueStateIndex > -1) {
										that.ValueStateErrorFields.splice(ValueStateIndex, 1);
									}
									enableApplyChange = that.AddDistribution.enableApplyChange.bind(that);
									enableApplyChange("PurgDocumentDistributionType");
									//	that.AddDistribution.enableApplyChange("PurgDocumentDistributionType", that);
								}
							}

						},
						error: function (oError) {}
					});
				}
			} else {
				var mandateIndex = that.MandateFieldChanged.indexOf("PurgDocumentDistributionType");
				if (mandateIndex > -1) {
					that.MandateFieldChanged.splice(mandateIndex, 1);
				}
				var errMsg;
				if (that.companyCodeChanged && that.companyCodeChanged === "X") {
					errMsg = that.oBundleText.getText("outlAgrmntCompanyCodeError");
				} else {
					errMsg = that.oBundleText.getText("outlineAgrmntTypMsg");
				}
				that.getView().byId("PurgDocumentDistributionType").setValueStateText(errMsg);
				//check for enabling the Apply Mass Changes button 
				if ((that.MandateFieldChanged.length === 5 && that.DocumentCategory === "K" && that.ValueStateErrorFields.length === 0) || (that.MandateFieldChanged
						.length === 7 && that.DocumentCategory ===
						"L" && that.ValueStateErrorFields.length === 0)) {
					that.getView().byId("DialogApplyBtn").setEnabled(true);
					that.getView().byId("DialogSimulateBtn").setEnabled(true);
					that.getView().byId("PurgDocNoteText").setEnabled(true);
					that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(true);
				} else {
					that.getView().byId("DialogApplyBtn").setEnabled(false);
					that.getView().byId("DialogSimulateBtn").setEnabled(false);
					var dependendsofMandateFields = that.AddDistribution.dependendsofMandateFields.bind(that);
					dependendsofMandateFields();
					// that.getView().byId("PurgDocNoteText").setEnabled(false);
					// that.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
				}

			}
		},

		//claering all the array values, making the apply changes and restore burron disable and trigger resetSamrtFormMetadat to reset the form
		onReset: function (oEvent) {
			var resetSamrtFormMetadat;
			var oSource = oEvent.getSource().getParent().getId();
			this.MandateFieldChanged = [];
			this.nonMandateFieldChanged = [];
			this.ValueStateErrorFields = [];
			this.DocumentCategory = "";
			this.getView().byId("DialogApplyBtn").setEnabled(false);
			this.getView().byId("DialogSimulateBtn").setEnabled(false);
			var dependendsofMandateFields = this.AddDistribution.dependendsofMandateFields.bind(this);
			dependendsofMandateFields();
			this.getView().byId("DialogResetBtn").setEnabled(false);
			this.getView().byId("CntrlPurContrDistributionPct").setValue(parseFloat(Number(0)).toFixed(3));
			if (oSource ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--AddHeaderDistribution"
			) {

				this.getView().byId("smartFormDistribution").getModel().resetChanges();
				//	this.AddDistribution.resetSamrtFormMetadat(this, "smartFormDistribution");
				resetSamrtFormMetadat = this.AddDistribution.resetSamrtFormMetadat.bind(this);
				resetSamrtFormMetadat("smartFormDistribution");

			} else if (oSource ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--AddItemDistribution"
			) {
				// 	this.getView().byId("DialogItemApplyBtn").setEnabled(false);
				// this.getView().byId("DialogItemResetBtn").setEnabled(false);
				this.getView().byId("smartFormItemDistribution").getModel().resetChanges();
				resetSamrtFormMetadat = this.AddDistribution.resetSamrtFormMetadat.bind(this);
				resetSamrtFormMetadat("smartFormItemDistribution");
				//this.AddDistribution.resetSamrtFormMetadat(this, "smartFormItemDistribution");
				//this.getView().byId("ItemCntrlPurContrDistributionPct").setValue(parseFloat(Number(0)).toFixed(3));
			}

		},

		//reset the dialog back to the initail state, values are cleared, ediatble property is reset for the dependant fields of company code 
		resetSamrtFormMetadat: function (smartFormId) {
			var fieldname;
			for (var outerIndex = 0; outerIndex < 2; outerIndex++) {
				for (var innerIndex = 0; innerIndex < 5; innerIndex++) {

					//Setting value state of all the fields as None
					this.byId(smartFormId).getGroups()[outerIndex].getGroupElements()[innerIndex].getElements()[0].setValueState("None");
					fieldname = this.byId(smartFormId).getGroups()[outerIndex].getGroupElements()[innerIndex].getElements()[0].getBindingInfo(
						"value").parts[0].path;
					//	setting the editable property of company code dependant fields
					if (fieldname === "PurgDocumentDistributionType" || fieldname === "ProcmtHubPurchasingGroup" || fieldname ===
						"ProcmtHubPurchasingOrg" ||
						fieldname === "Plant" || fieldname === "StorageLocation") {
						this.byId(smartFormId).getGroups()[outerIndex].getGroupElements()[innerIndex].getElements()[0].setEditable(false);
					}

				}
			}
		},

		//Method triggered by close of dialog , where the entry created in model for dialog binding is deleted and teh array are set to initail state
		onAddHeaderDistDialogClose: function (dialogId) {
			var oComponent = this.getOwnerComponent();
			var oAddNewValuesModel = oComponent.getModel();
			var oAddHdrDistDialog = this.getView().byId(dialogId);
			var aContexts = oAddHdrDistDialog.getBindingContext();
			oAddNewValuesModel.deleteCreatedEntry(aContexts);
			this.AffectedContractsOnAddHdrDist = [];
			this.AffectedContractsHdrDistCount = undefined;
			this.MandateFieldChanged = [];
			this.nonMandateFieldChanged = [];

		},

		//Method to handle the enable feature for Apply Mass Changes button in add header distribution.
		enableApplyChange: function (fieldId) {
			this.DocumentCategory = this.getView().byId("ProcmtHubPurgDocItmCategory").getValue();
			//flag for mandate feature of each field
			var mandatoryValue = this.getView().byId(fieldId).getMandatory();
			var applybtn = this.getView().byId("DialogApplyBtn");
			var simulatebtn = this.getView().byId("DialogSimulateBtn");
			var resetBtn = this.getView().byId("DialogResetBtn");
			var currentIndex, ValueStateIndex;

			//handling mandatory property of plant, i.e if document category is 'L' then it is mandate else it is not.
			if (fieldId === "Plant" && this.DocumentCategory === "L") {
				mandatoryValue = true;
			} else if (fieldId === "Plant") {
				mandatoryValue = false;
			}
			//if the fields are mandate they are added to MandateFieldChanged array else they are added to nonmanadate field array if already not present.
			if (mandatoryValue) {
				currentIndex = this.MandateFieldChanged.indexOf(fieldId);
			} else {
				currentIndex = this.nonMandateFieldChanged.indexOf(fieldId);
			}
			if (currentIndex === -1 && mandatoryValue) {
				this.MandateFieldChanged.push(fieldId);
				ValueStateIndex = this.ValueStateErrorFields.indexOf(fieldId);

				if (ValueStateIndex > -1) {
					this.ValueStateErrorFields.splice(ValueStateIndex, 1);
				}

			} else if (currentIndex === -1 && !(mandatoryValue)) {
				this.nonMandateFieldChanged.push(fieldId);
				ValueStateIndex = this.ValueStateErrorFields.indexOf(fieldId);

				if (ValueStateIndex > -1) {
					this.ValueStateErrorFields.splice(ValueStateIndex, 1);
				}

			}

			//check for applychanges button enablement.
			if ((this.MandateFieldChanged.length === 5 && this.DocumentCategory === "K" && this.ValueStateErrorFields.length === 0) || (this.MandateFieldChanged
					.length === 7 && this.DocumentCategory === "L" && this.ValueStateErrorFields.length === 0)) {
				applybtn.setEnabled(true);
				simulatebtn.setEnabled(true);
				this.getView().byId("PurgDocNoteText").setEnabled(true);
				this.getView().byId("PurchasingDocVersionReasonCode").setEnabled(true);
			} else {
				applybtn.setEnabled(false);
				simulatebtn.setEnabled(false);
				if (this.MandateFieldChanged.length === 5 && this.DocumentCategory === "L") {
					// when the dicument category is switched from K to L and only 5 fields are filled then clear and disable the purchaser note and reason code field
					//special check since plant and document type are non mandate fields when the category is K.
					var dependendsofMandateFields = this.AddDistribution.dependendsofMandateFields.bind(this);
					dependendsofMandateFields();
				}
			}
			if (this.MandateFieldChanged.length > 0 || this.nonMandateFieldChanged.length > 0) {
				resetBtn.setEnabled(true);
			} else {
				resetBtn.setEnabled(false);
			}

		},

		onCancelDialog: function (oEvent) {
			var oSource = oEvent.getSource().getParent().getId();
			this.MandateFieldChanged = [];
			this.nonMandateFieldChanged = [];
			this.ValueStateErrorFields = [];
			this.DocumentCategory = "";
			var dialogId;
			if (oSource ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--AddHeaderDistribution"
			) {
				dialogId = "AddHeaderDistribution";
			} else if (oSource ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--AddItemDistribution"
			) {
				dialogId = "AddItemDistribution";
			}
			if (dialogId) {
				var onAddHeaderDistDialogClose = this.AddDistribution.onAddHeaderDistDialogClose.bind(this);
				onAddHeaderDistDialogClose(dialogId);
				//	this.AddDistribution.onAddHeaderDistDialogClose(dialogId, this);
				this.getView().byId(dialogId).close();
				this.getView().byId(dialogId).destroy();
			}
		},

		//This method is triggered when the value is entered in Purchaser Note field and on tab out.
		validatePurchaserNote: function (oEvent) {

			if (oEvent.getParameters().value.length > 5000) {
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText(this.oBundleText.getText("PurchaserNoteMaxLength"));
				this.getView().byId("DialogApplyBtn").setEnabled(false);
				this.getView().byId("DialogSimulateBtn").setEnabled(false);
				var ValueStateIndex = this.ValueStateErrorFields.indexOf("PurgDocNoteText");
				if (ValueStateIndex < 0) {
					this.ValueStateErrorFields.push("PurgDocNoteText");
				}

			} else {
				oEvent.getSource().setValueState("None");
				oEvent.getSource().setValueStateText("");
				var ValueStateIndex = this.ValueStateErrorFields.indexOf("PurgDocNoteText");
				//if the previously entred value was errorneous then this field is removed from the errorneous array after the valid value is entered
				if (ValueStateIndex > -1) {
					this.ValueStateErrorFields.splice(ValueStateIndex, 1);
				}
				// manadate field check not required since the fields will be enabled only after the mandate fileds are filled with correct values
				if (this.ValueStateErrorFields.length < 1) {
					this.getView().byId("DialogApplyBtn").setEnabled(true);
					this.getView().byId("DialogSimulateBtn").setEnabled(true);
				}
			}
		},

		//clear the value and disable  Purchaser Note and Reason code field
		dependendsofMandateFields: function () {
			var ValueStateIndex;
			this.getView().byId("PurchasingDocVersionReasonCode").setValue("");
			this.getView().byId("PurgDocNoteText").setValue("");
			this.getView().byId("PurchasingDocVersionReasonCode").setEnabled(false);
			this.getView().byId("PurgDocNoteText").setEnabled(false);
			ValueStateIndex = this.ValueStateErrorFields.indexOf("PurgDocNoteText");
			if (ValueStateIndex > -1) {
				this.ValueStateErrorFields.splice(ValueStateIndex, 1);
			}
			ValueStateIndex = this.ValueStateErrorFields.indexOf("PurchasingDocVersionReasonCode");
			if (ValueStateIndex > -1) {
				this.ValueStateErrorFields.splice(ValueStateIndex, 1);
			}
		}

	};
	return AddDist;
});