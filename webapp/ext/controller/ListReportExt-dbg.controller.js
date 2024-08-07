/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"ui/s2p/mm/cntrl/ctrmass/update/ext/model/formatter",
	"ui/s2p/mm/cntrl/ctrmass/update/ext/controller/AddDistribution",
	"ui/s2p/mm/cntrl/ctrmass/update/ext/controller/AddHCTRDistribution",
	"ui/s2p/mm/cntrl/ctrmass/update/ext/controller/ExcelOperations"

], function (MessageToast, JSONModel, MessageBox, Filter, FilterOperator, Sorter, formatter, AddDistribution, AddHCTRDistribution,
	ExcelOperations) {
	"use strict";

	return sap.ui.controller("ui.s2p.mm.cntrl.ctrmass.update.ext.controller.ListReportExt", {
		formatter: formatter,
		AddDistribution: AddDistribution,
		AddHCTRDistribution: AddHCTRDistribution,
		ExcelOperations: ExcelOperations,
		oHeaderDistributionFilters: [],
		oItemDistributionFilters: [],
		oPOInclExclFilters: [],
		distarrayfil: [],
		oSmTableInnerTab1: undefined,
		oSmTableInnerTab2: undefined,
		oSmFilter: undefined,
		isSelectAllTab1: false,
		isExclusionTab1: false,
		isInclusionTab1: false,
		exclusionArrayTab1: [],
		inclusionArrayTab1: [],
		isSelectAllTab2: false,
		isExclusionTab2: false,
		isInclusionTab2: false,
		exclusionArrayTab2: [],
		inclusionArrayTab2: [],
		// New two new tabs
		oSmTableInnerTab3: undefined,
		isSelectAllTab3: false,
		isExclusionTab3: false,
		isInclusionTab3: false,
		exclusionArrayTab3: [],
		inclusionArrayTab3: [],
		oSmTableInnerTab4: undefined,
		isSelectAllTab4: false,
		isExclusionTab4: false,
		isInclusionTab4: false,
		exclusionArrayTab4: [],
		inclusionArrayTab4: [],
		subObjectType: 'C',
		excelUploadType: "",
		excelUploadTypeText: "",
		//****
		massEditChangeFields: [],
		aFilter: [],
		HeaderDistArray: [],
		countHeaderDist: undefined,
		ItemDistArray: [],
		countItemDist: undefined,
		applyChangeCntrlId: undefined,
		applychangesIndicator: undefined,
		SimulateToggleStatus: false,
		isSimulation: false,
		massUpdateHctrToggleStatus: false,

		//START Common method for Add Header Distribution and Mass Edit

		onInit: function () {
			this.MandateFieldChanged = [];
			this.nonMandateFieldChanged = [];
			this.DocumentCategory = "";
			this.fieldbeingChanged = "";
			this.companyCodeChanged = "";
			this.fieldLength = "";
			this.ProcurementHubSourceSystem = "";
			this.ValueStateErrorFields = [];
			this.PlantChanged = "";

			this.oSmFilter = this.getView().byId("listReportFilter");
			this.oSmFilter.setUseDateRangeType(true);
			// enable multiselect and excel for table in Tab1
			this.oSmTableTab1 = this.getView().byId("listReport-_tab1");
			this.oSmTableTab1.setUseExportToExcel(true);
			this.oSmTableInnerTab1 = this.oSmTableTab1.getTable();
			this.oSmTableInnerTab1.setMode("MultiSelect");
			this.oSmTableTab1.setIgnoredFields(
				"CntrlPurContrItmDistrPct,Material,MaterialGroup,ProductType,ProductTypeCode,CntrlPurContrDistributionPct,ProcmtHubPurchasingOrg,ProcmtHubPurchasingGroup," +
				"ProcmtHubCompanyCode,Plant,PurchasingProcessingStatus,CntrlPurContrFlxblDistrIsAllwd,CntrlPurContrOvrlDistrStsTxt,PurgDocNoteText"
			);

			this.oSmTableInnerTab1.attachSelectionChange(this._onTable1RowSelection1.bind(this));
			this.oSmTableInnerTab1.attachUpdateFinished(this._handleGrowing.bind(this));
			// enable multiselect and excel for table in Tab2
			this.oSmTableTab2 = this.getView().byId("listReport-_tab2");
			this.oSmTableTab2.setUseExportToExcel(true);
			this.oSmTableTab2.setIgnoredFields(
				"CntrlPurContrItmDistrPct,CntrlPurContrDistributionPct,ProcmtHubPurchasingOrg,ProcmtHubPurchasingGroup,ProcmtHubCompanyCode," +
				"Plant,CashDiscount2Percent,NetPaymentDays,PurchasingOrganization,PurchasingGroup,CompanyCode,PurchasingDocumentStatus," +
				"CashDiscount1Percent,CashDiscount2Days,PurchasingProcessingStatus,ItemDistributionStatusName,CashDiscount1Days,IncotermsClassification," +
				"IncotermsLocation1,IncotermsLocation2,IncotermsVersion,QuotationSubmissionDate,SupplierQuotation,CorrespncExternalReference," +
				"CorrespncInternalReference,PaymentTerms,SupplierRespSalesPersonName,CashDiscount2Days,Supplier,SupplierPhoneNumber,ValidityEndDate," +
				"PurchaseContractTargetAmount,CntrlPurContrFlxblDistrIsAllwd,PurchaseContractType,ValidityStartDate,ValidityEndDate,DocumentCurrency,PurgDocNoteText,PurchasingDocVersionReasonCode"
			);

			this.oSmTableInnerTab2 = this.oSmTableTab2.getTable();
			this.oSmTableTab1.setRequestAtLeastFields("ActivePurchasingDocument");
			this.oSmTableTab2.setRequestAtLeastFields("ActivePurchasingDocument,FormattedPurchaseContractItem,CentralPurchaseContractItem");
			this.oSmTableInnerTab2.setMode("MultiSelect");
			this.oSmTableInnerTab2.attachSelectionChange(this._onTable2RowSelection1.bind(this));
			this.oSmTableInnerTab2.attachUpdateFinished(this._handleGrowing.bind(this));
			this.oSmTableTab1.attachBeforeRebindTable(this.resetTables.bind(this));
			this.oSmTableTab2.attachBeforeRebindTable(this.resetTables.bind(this));
			this.oIconTabBar = this.getView().byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--template::IconTabBar"
			);
			// this.oIconTabBar.attachSelect(this.handleTabChange.bind(this));
			this.oSmFilter.attachSearch(this.resetTables.bind(this));

			this.oSmTableTab3 = this.getView().byId("listReport-_tab3");
			this.oSmTableInnerTab3 = this.oSmTableTab3.getTable();
			this.oSmTableInnerTab3.setMode("MultiSelect");
			this.oSmTableTab3.setIgnoredFields(
				"CntrlPurContrItmDistrPct,Material,MaterialGroup,ProductType,ProductTypeCode,CntrlPurContrDistributionPct,ProcmtHubPurchasingOrg,ProcmtHubPurchasingGroup," +
				"ProcmtHubCompanyCode,Plant,PurchasingProcessingStatus,CntrlPurContrFlxblDistrIsAllwd,CntrlPurContrOvrlDistrStsTxt,PurgDocNoteText"
			);

			this.oSmTableTab4 = this.getView().byId("listReport-_tab4");
			this.oSmTableInnerTab4 = this.oSmTableTab4.getTable();
			this.oSmTableInnerTab4.setMode("MultiSelect");
			this.oSmTableTab4.setIgnoredFields(
				"CntrlPurContrItmDistrPct,CntrlPurContrDistributionPct,ProcmtHubPurchasingOrg,ProcmtHubPurchasingGroup,ProcmtHubCompanyCode," +
				"Plant,CashDiscount2Percent,NetPaymentDays,PurchasingOrganization,PurchasingGroup,CompanyCode,PurchasingDocumentStatus," +
				"CashDiscount1Percent,CashDiscount2Days,PurchasingProcessingStatus,ItemDistributionStatusName,CashDiscount1Days,IncotermsClassification," +
				"IncotermsLocation1,IncotermsLocation2,IncotermsVersion,QuotationSubmissionDate,SupplierQuotation,CorrespncExternalReference," +
				"CorrespncInternalReference,PaymentTerms,SupplierRespSalesPersonName,CashDiscount2Days,Supplier,SupplierPhoneNumber,ValidityEndDate," +
				"PurchaseContractTargetAmount,CntrlPurContrFlxblDistrIsAllwd,PurchaseContractType,ValidityStartDate,ValidityEndDate,DocumentCurrency,PurgDocNoteText,PurchasingDocVersionReasonCode"
			);
			//New tabs changes
			this.oIconTabBar.attachSelect(this.handleTabChange.bind(this));
			this.oSmTableInnerTab3.attachSelectionChange(this._onTable3RowSelection1.bind(this));
			this.oSmTableInnerTab3.attachUpdateFinished(this._handleGrowing.bind(this));
			this.oSmTableInnerTab4.attachSelectionChange(this._onTable4RowSelection1.bind(this));
			this.oSmTableInnerTab4.attachUpdateFinished(this._handleGrowing.bind(this));
			this.oSmTableTab3.attachBeforeRebindTable(this.resetTables.bind(this));
			this.oSmTableTab4.attachBeforeRebindTable(this.resetTables.bind(this));
		},

		enableHCTRfunctionality: function () {
			this.setHierarchyTabsVisibility(true);
			this.getView().byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--action::ActionExcelDownload"
			).setVisible(false);
			this.addUploadMenuButton();
/*						var p = sap.s4h.cfnd.featuretoggle.lib.featuresAsync();
						p.then(function (features) {
								this.massUpdateHctrToggleStatus = features.getFeatureStatus("MM_PUR_MASS_UPDATE_HCTR");
								if (this.massUpdateHctrToggleStatus === true) {
									this.setHierarchyTabsVisibility(true);
									this.getView().byId(
										"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--action::ActionExcelDownload"
									).setVisible(false);
									this.addUploadMenuButton();

								} else {
									this.addUploadButton();
									this.setHierarchyTabsVisibility(false);
									sap.ui.getCore().byId("downloadBtn").setVisible(false);
								}
							}.bind(this))
							.catch(function (oError) {
								// Promise has been rejected since Service is unavailable
								// console.log("An Error occurred, unable to load the feature toggle status");
							}.bind(this));*/
		},

		enableSimulationFeature: function () {
			this.getView().byId("simulateJobButton").setVisible(true);
			/*			var p = sap.s4h.cfnd.featuretoggle.lib.featuresAsync();
						p.then(function (features) {
								this.SimulateToggleStatus = features.getFeatureStatus("MM_PUR_MASS_UPDATE_HCTR");
								if (this.SimulateToggleStatus === true) {
									this.getView().byId("simulateJobButton").setVisible(true);
								}
							}.bind(this))
							.catch(function (oError) {
								// Promise has been rejected since Service is unavailable
								// console.log("An Error occurred, unable to load the feature toggle status");
							}.bind(this));*/
		},

		setHierarchyTabsVisibility: function (flag) {
			var oView = this.getView();
			var hierarchyHeaderTab = oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--template::IconTabFilter-_tab3"
			);
			var hierarchyItemTab = oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--template::IconTabFilter-_tab4"
			);
			hierarchyHeaderTab.setVisible(flag);
			hierarchyItemTab.setVisible(flag);
		},

		//Method to check if the length of value in Purchaser Note is > 5000
		validatePurchaserNote: function (oEvent) {
			var PurchaserNoteField = this.getView().byId("PurgDocNoteTextFld-SmartField-input");
			if (PurchaserNoteField.getValue().length > 5000) {
				PurchaserNoteField.setValueState("Error");
				PurchaserNoteField.setValueStateText(this.oBundleText.getText("PurchaserNoteMaxLength"));
				this.getView().byId("applyChangesButton").setEnabled(false);
				this.ErrInPurchaserNote = true;
			} else {
				PurchaserNoteField.setValueState("None");
				PurchaserNoteField.setValueStateText("");
				this.getView().byId("applyChangesButton").setEnabled(true);
				this.ErrInPurchaserNote = false;
			}
		},

		changeModel: function (isSimulate) {
			var that = this;
			var confirmationTxt;
			var newModel;
			if (isSimulate === false) {
				if (that.subObjectType === "C") {
					confirmationTxt = that.oBundleText.getText("applyChangesConfirmation");
				} else if (that.subObjectType === "H") {
					confirmationTxt = that.oBundleText.getText("applyChangesConfirmationHCTR");
				}
				newModel = new JSONModel({
					buttonId: "updateJobConfirmationBtn",
					dialogTitle: that.oBundleText.getText("applyChangesConfTitle"),
					Confirmation: confirmationTxt,
					JobDescription: that.oBundleText.getText("massJobDescription"),
					CommentBox: that.oBundleText.getText("massChangeJobCommentBox"),
					buttonTxt: that.oBundleText.getText("applyChangesConfirmationApply")
				});
			} else if (isSimulate === true) {
				if (that.subObjectType === "C") {
					confirmationTxt = that.oBundleText.getText("simulateChangesConfirmation");
				} else if (that.subObjectType === "H") {
					confirmationTxt = that.oBundleText.getText("simulateChangesConfirmationHCTR");
				}
				newModel = new JSONModel({
					buttonId: "simulateJobConfirmationBtn",
					dialogTitle: that.oBundleText.getText("simulateConfTitle"),
					Confirmation: confirmationTxt,
					JobDescription: that.oBundleText.getText("simulateJobDescription"),
					CommentBox: that.oBundleText.getText("simulateJobCommentBox"),
					buttonTxt: that.oBundleText.getText("simulateJobConfirmationSimulate")
				});
			}

			return newModel;
		},

		// applychangesModel: function () {
		// 	var that = this;
		// 	var confirmationTxt;
		// 	if (that.subObjectType === "C") {
		// 		confirmationTxt = that.oBundleText.getText("applyChangesConfirmation");
		// 	} else if (that.subObjectType === "H") {
		// 		confirmationTxt = that.oBundleText.getText("applyChangesConfirmationHCTR");
		// 	}
		// 	var newModel;
		// 	newModel = new JSONModel({
		// 		buttonId: "updateJobConfirmationBtn",
		// 		dialogTitle: that.oBundleText.getText("applyChangesConfTitle"),
		// 		Confirmation: confirmationTxt,
		// 		JobDescription: that.oBundleText.getText("massJobDescription"),
		// 		CommentBox: that.oBundleText.getText("massChangeJobCommentBox"),
		// 		buttonTxt: that.oBundleText.getText("applyChangesConfirmationApply")
		// 	});
		// 	return newModel;
		// },
		// simulateModel: function () {
		// 	var that = this;
		// 	var confirmationTxt;
		// 	if (that.subObjectType === "C") {
		// 		confirmationTxt = that.oBundleText.getText("simulateChangesConfirmation");
		// 	} else if (that.subObjectType === "H") {
		// 		confirmationTxt = that.oBundleText.getText("simulateChangesConfirmationHCTR");
		// 	}
		// 	var newModel;
		// 	newModel = new JSONModel({
		// 		buttonId: "simulateJobConfirmationBtn",
		// 		dialogTitle: that.oBundleText.getText("simulateConfTitle"),
		// 		Confirmation: confirmationTxt,
		// 		JobDescription: that.oBundleText.getText("simulateJobDescription"),
		// 		CommentBox: that.oBundleText.getText("simulateJobCommentBox"),
		// 		buttonTxt: that.oBundleText.getText("simulateJobConfirmationSimulate")
		// 	});
		// 	return newModel;
		// },
		setViewModelHeader: function (isMassAddition, isSimulation) {
			this.getView().getModel().setHeaders({
				"MassAddition": isMassAddition,
				"Simulation": isSimulation
			});
		},

		createApplyChangesPopUp: function (oEvent) {
			var that = this;
			var addDistDialogClose;
			var oModel;
			var applyConfirmationText;
			this.applyChangeCntrlId = "";

			if (oEvent.getId() === "press") {
				if (oEvent.getSource().getId() ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--DialogApplyBtn"
				) {
					oModel = this.changeModel(false);
				} else if (oEvent.getSource().getId() ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--DialogSimulateBtn"
				) {
					this.isSimulation = true;
					oModel = this.changeModel(true);
				}
				if (oEvent.getSource() && oEvent.getSource().getParent()) {
					if (oEvent.getSource().getParent().getId().search("AddHeaderDistribution") > -1) {
						this.applyChangeCntrlId = "AddHeaderDistribution";
						applyConfirmationText = oModel.getData().Confirmation + "\n\n" + oModel.getData().JobDescription;
					} else if (oEvent.getSource().getParent().getId().search("AddItemDistribution") > -1) {
						this.applyChangeCntrlId = "AddItemDistribution";
						applyConfirmationText = oModel.getData().Confirmation + "\n\n" + oModel.getData().JobDescription;
					} else if (oEvent.getSource().getParent().getId().search("AddHCTRItemDistribution") > -1) {
						this.applyChangeCntrlId = "AddHCTRItemDistribution";
						applyConfirmationText = oModel.getData().Confirmation + "\n\n" + oModel.getData().JobDescription;
					} else if (oEvent.getSource().getParent().getId().search("AddHCTRHeaderDistribution") > -1) {
						this.applyChangeCntrlId = "AddHCTRHeaderDistribution";
						applyConfirmationText = oModel.getData().Confirmation + "\n\n" + oModel.getData().JobDescription;
					}
				}
			} else if (oEvent.getId() ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--MassEditForm"
			) {
				oModel = this.changeModel(this.isSimulation);
				this.applyChangeCntrlId = "";
				applyConfirmationText = oModel.getData().Confirmation + "\n\n" + oModel.getData().JobDescription;
			} else if (oEvent.getId() ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--HrMassEditForm"
			) {
				oModel = this.changeModel(this.isSimulation);
				this.applyChangeCntrlId = "";
				applyConfirmationText = oModel.getData().Confirmation + "\n\n" + oModel.getData().JobDescription;
			}
			var dialog = new sap.m.Dialog({
				// title: that.oBundleText.getText("applyChangesConfTitle"),
				title: oModel.getData().dialogTitle,
				type: "Message",
				content: [
					new sap.ui.layout.VerticalLayout({
						width: "100%",
						content: [
							new sap.m.Text("confirmationDialogText", {
								text: applyConfirmationText
							}),
							new sap.m.TextArea("confirmDialogTextarea", {
								ariaLabelledBy: "confirmationDialogText",
								width: "100%",
								// value: that.oBundleText.getText("massChangeJobCommentBox"),
								value: oModel.getData().CommentBox,
								maxLength: 120
							})
						]
					})
				],
				// beginButton: new sap.m.Button("updateJobConfirmationBtn", {
				beginButton: new sap.m.Button(oModel.getData().buttonId, {
					// text: that.oBundleText.getText("applyChangesConfirmationApply"),
					text: oModel.getData().buttonTxt,
					press: function () {
						var sComment = sap.ui.getCore().byId("confirmDialogTextarea").getValue();
						if (sComment === "") {
							sComment = that.oBundleText.getText("MassChangeJobDefaultDescription");
						}
						that.applyChanges(sComment, oEvent, that.applyChangeCntrlId);
						if (that.getView().byId("MassEditForm")) {
							//When Apply Mass Changes is triggereed from Mass Edit Form
							that.resetSetNewValuesForm("MassEditForm-item--Form", "MassEditForm");
							that.onMassEditDialogClose("MassEditForm");
							that.getView().byId("MassEditForm").close();
							that.getView().byId("MassEditForm").destroy();
							//When Apply Mass Changes is triggereed from HCTR Mass Edit Form							
						}
						if (that.getView().byId("HrMassEditForm")) {
							that.resetSetNewValuesForm("HrMassEditForm-item--Form", "HrMassEditForm");
							that.onMassEditDialogClose("HrMassEditForm");
							that.getView().byId("HrMassEditForm").close();
							that.getView().byId("HrMassEditForm").destroy();
						} else if (that.getView().byId("AddHeaderDistribution")) {
							// //When Apply Mass Changes is triggereed from Add Header Distribution
							addDistDialogClose = that.AddDistribution.onAddHeaderDistDialogClose.bind(that, "AddHeaderDistribution");
							addDistDialogClose();
							that.getView().byId("AddHeaderDistribution").close();
							that.getView().byId("AddHeaderDistribution").destroy();
						} else if (that.getView().byId("AddItemDistribution")) {
							//When Apply Mass Changes is triggereed from Add Header Distribution
							addDistDialogClose = that.AddDistribution.onAddHeaderDistDialogClose.bind(that, "AddItemDistribution");
							addDistDialogClose();
							that.getView().byId("AddItemDistribution").close();
							that.getView().byId("AddItemDistribution").destroy();
						} else if (that.getView().byId("AddHCTRItemDistribution")) {
							//When Apply Mass Changes is triggereed from Add Header Distribution
							addDistDialogClose = that.AddDistribution.onAddHeaderDistDialogClose.bind(that, "AddHCTRItemDistribution");
							addDistDialogClose();
							that.getView().byId("AddHCTRItemDistribution").close();
							that.getView().byId("AddHCTRItemDistribution").destroy();
						} else if (that.getView().byId("AddHCTRHeaderDistribution")) {
							//When Apply Mass Changes is triggereed from Add Header Distribution
							addDistDialogClose = that.AddDistribution.onAddHeaderDistDialogClose.bind(that, "AddHCTRHeaderDistribution");
							addDistDialogClose();
							that.getView().byId("AddHCTRHeaderDistribution").close();
							that.getView().byId("AddHCTRHeaderDistribution").destroy();
						}
						dialog.close();

						sap.ui.core.BusyIndicator.show(5);
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
			dialog.open();
			sap.ui.getCore().byId("confirmDialogTextarea").attachLiveChange(function (event) {
				if (event.getParameter("value") === "") {
					// sap.ui.getCore().byId("updateJobConfirmationBtn").setEnabled(false);
					if (oModel.getData().buttonId === "updateJobConfirmationBtn") {
						sap.ui.getCore().byId("updateJobConfirmationBtn").setEnabled(false);
					} else if (oModel.getData().buttonId === "simulateJobConfirmationBtn") {
						sap.ui.getCore().byId("simulateJobConfirmationBtn").setEnabled(false);
					}
				} else {
					// sap.ui.getCore().byId("updateJobConfirmationBtn").setEnabled(true);
					if (oModel.getData().buttonId === "updateJobConfirmationBtn") {
						sap.ui.getCore().byId("updateJobConfirmationBtn").setEnabled(true);
					} else if (oModel.getData().buttonId === "simulateJobConfirmationBtn") {
						sap.ui.getCore().byId("simulateJobConfirmationBtn").setEnabled(true);
					}
				}
			});
		},

		onAfterRendering: function (oEvent) {
			// App Dumps in QS9/CCF - Commenting call temporarily		
			// this.hideHierItmDistrBtn();
			var that = this;
			var oView = this.getView();
			this.oBundleText = oView.getModel("@i18n").getResourceBundle();
			var mEditBtn = oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--action::ActionC_PurCntrlContrItmMassUpdt1button"
			);
			mEditBtn.setEnabled(false);
			//mEditBtn.setTooltip(this.oBundleText.getText("ActionC_PurCntrlContrItmMassUpdt1"));
			//Adding Button for Header Distribut
			var oMenu = new sap.m.MenuButton({
				"id": "MassAdditionBtn",
				"enabled": false,
				"menu": new sap.m.Menu({
					items: [new sap.m.MenuItem({
							id: "AddHdrDistBtn",
							"enabled": false
						}),
						new sap.m.MenuItem({
							id: "AddItmDistBtn",
							"enabled": false
						})
					],
					"itemSelected": function (selectedItem) {
						var oItem = selectedItem.getParameter("item");
						if (oItem && oItem.getId() === "AddHdrDistBtn") {
							if (that.subObjectType === 'C') {
								var createHeaderDistDialog = that.AddDistribution.onPressAddHdrDist.bind(that);
							} else if (that.subObjectType === 'H') {
								createHeaderDistDialog = that.AddHCTRDistribution.onPressAddHdrDist.bind(that);
							}
							createHeaderDistDialog();

							//	that.AddDistribution.onPressAddHdrDist(that);
						} else if (oItem && oItem.getId() === "AddItmDistBtn") {
							if (that.subObjectType === 'C') {
								var createItemDistDialog = that.AddDistribution.onPressAddItmDist.bind(that);
							} else if (that.subObjectType === 'H') {
								createItemDistDialog = that.AddHCTRDistribution.onPressAddItmDist.bind(that);
							}
							// var createItemDistDialog = that.AddDistribution.onPressAddItmDist.bind(that);
							createItemDistDialog();
							//	that.AddDistribution.onPressAddItmDist(that);
						}
					}
				})
			});
			this.overFlowToolBar = sap.ui.getCore().byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--template:::ListReportPage:::DynamicPageTitle-_actionsToolbar"
			);
			var insertIndex = this.overFlowToolBar.getContent().length - 2;
			oMenu.placeAt(this.overFlowToolBar, insertIndex);

			sap.ui.getCore().byId("MassAdditionBtn").setText(this.oBundleText.getText("MassAction"));
			sap.ui.getCore().byId("MassAdditionBtn").setTooltip(this.oBundleText.getText("MassAction"));
			sap.ui.getCore().byId("AddHdrDistBtn").setText(this.oBundleText.getText("AddHdrDist"));
			sap.ui.getCore().byId("AddHdrDistBtn").setTooltip(this.oBundleText.getText("AddHdrDist"));
			sap.ui.getCore().byId("AddItmDistBtn").setText(this.oBundleText.getText("AddItmDist"));
			sap.ui.getCore().byId("AddItmDistBtn").setTooltip(this.oBundleText.getText("AddItmDist"));

			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--addEntry-_tab1"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--addEntry-_tab2"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--addEntry-_tab3"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--addEntry-_tab4"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHdrDistrbutton-_tab2"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHdrDistrbutton-_tab3"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHdrDistrbutton-_tab4"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrItmDistrbutton-_tab1"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrItmDistrbutton-_tab3"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrItmDistrbutton-_tab4"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHierHdrDistrbutton-_tab2"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHierHdrDistrbutton-_tab1"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHierHdrDistrbutton-_tab4"
			).setVisible(false);
			///Hide logic for Hier.Item Distribution Edit Button
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHierItmDistrbutton-_tab1"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHierItmDistrbutton-_tab2"
			).setVisible(false);
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHierItmDistrbutton-_tab3"
			).setVisible(false);
			//End logic for Hier.Item Distribution Edit Button
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHdrDistrbutton-_tab1"
			).setTooltip(this.oBundleText.getText("ActionC_CntrlPurContrHdrDistrbutton"));
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrItmDistrbutton-_tab2"
			).setTooltip(this.oBundleText.getText("ActionC_CntrlPurContrItmDistrbutton"));
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHierHdrDistrbutton-_tab3"
			).setTooltip(this.oBundleText.getText("ActionC_CntrlPurContrHierHdrDistrbutton"));
			oView.byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--action::ActionC_PurCntrlContrItmMassUpdt2button"
			).setTooltip(this.oBundleText.getText("GlobalActionMassChangeJob"));

			var downloadExcelBtn = oView.byId("action::ActionExcelDownload");
			downloadExcelBtn.setTooltip(this.oBundleText.getText("ActionExcelDownload"));
			downloadExcelBtn.setEnabled(false);
			//Attaching the function for click of download button
			downloadExcelBtn.attachPress(this.ExcelOperations.OnClickExcelDownload, this);
			//Attaching the function for checking the enable feature of download button
			this.getView().getModel().attachRequestCompleted(this.ExcelOperations.fnDownloadButtonEnableDisable.bind(this));

			var downloadMenu = new sap.m.MenuButton({
				"id": "downloadBtn",
				"enabled": false,
				"menu": new sap.m.Menu({
					items: [new sap.m.MenuItem({
							id: "downloadCctrBtn",
							"enabled": false
						}),
						new sap.m.MenuItem({
							id: "downloadHctrBtn",
							"enabled": false
						})
					],
					"itemSelected": function (selectedItem) {
						var oItem = selectedItem.getParameter("item");
						if (oItem && oItem.getId() === "downloadCctrBtn") {
							var downloadCctr = that.ExcelOperations.OnClickExcelDownload.bind(that);
							downloadCctr();
						} else if (oItem && oItem.getId() === "downloadHctrBtn") {
							var downloadHctr = that.ExcelOperations.OnClickHctrExcelDownload.bind(that);
							downloadHctr();
						}
					}
				})
			});
			//Attaching the function for checking the enable feature of download menu button
			this.getView().getModel().attachRequestCompleted(this.ExcelOperations.fnDownloadButtonEnableDisable.bind(this));
			this.overFlowToolBar = sap.ui.getCore().byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--template:::ListReportPage:::DynamicPageTitle-_actionsToolbar"
			);
			var dwnldBtnIndex = this.overFlowToolBar.getContent().length - 3;
			downloadMenu.placeAt(this.overFlowToolBar, dwnldBtnIndex);

			sap.ui.getCore().byId("downloadBtn").setText(this.oBundleText.getText("download"));
			sap.ui.getCore().byId("downloadBtn").setTooltip(this.oBundleText.getText("download"));
			sap.ui.getCore().byId("downloadCctrBtn").setText(this.oBundleText.getText("downloadCctr"));
			sap.ui.getCore().byId("downloadCctrBtn").setTooltip(this.oBundleText.getText("downloadCctr"));
			sap.ui.getCore().byId("downloadHctrBtn").setText(this.oBundleText.getText("downloadHctr"));
			sap.ui.getCore().byId("downloadHctrBtn").setTooltip(this.oBundleText.getText("downloadHctr"));

			this.enableHCTRfunctionality();
		},
		addUploadButton: function (oEvent) {
			var oView = this.getView();
			//Adding Upload button in the overflow toolbar , after the Download button
			var uploadExcelBtn = oView.byId("FileUploader");
			if (!uploadExcelBtn) {
				uploadExcelBtn = sap.ui.xmlfragment(oView.getId(), "ui.s2p.mm.cntrl.ctrmass.update.ext.fragment.UploadExcel", this);
				oView.addDependent(uploadExcelBtn);
			}
			var toolbarContentLength = this.overFlowToolBar.getContent().length;
			var UpldBtnIndex = 0;
			for (var toolbarIndex = 0; toolbarIndex < toolbarContentLength; toolbarIndex++) {
				if (this.overFlowToolBar.getContent()[toolbarIndex].getId().search("ActionExcelDownload") >= 0) {
					UpldBtnIndex = toolbarIndex + 1;
					break;
				}
			}
			uploadExcelBtn.placeAt(this.overFlowToolBar, UpldBtnIndex);
		},
		addUploadMenuButton: function (oEvent) {
			var that = this;
			var uploadMenu = new sap.m.MenuButton({
				"id": "uploadBtn",
				"enabled": true,
				"menu": new sap.m.Menu({
					items: [new sap.m.MenuItem({
							id: "uploadCctrBtn",
							"enabled": true
						}),
						new sap.m.MenuItem({
							id: "uploadHctrBtn",
							"enabled": true
						})
					],
					"itemSelected": function (selectedItem) {
						that.excelUploadType = "";
						var oItem = selectedItem.getParameter("item");
						if (oItem && oItem.getId() === "uploadCctrBtn") {
							that.excelUploadType = "EXL_OPS_CCTR";
							that.excelUploadTypeText = that.oBundleText.getText("excelBsdUploadCctrDialogTitle");
							var uploadCctr = that.ExcelOperations.fnOpenExcelUploadModel.bind(that);
							uploadCctr();
						} else if (oItem && oItem.getId() === "uploadHctrBtn") {
							that.excelUploadType = "EXL_OPS_HCTR";
							that.excelUploadTypeText = that.oBundleText.getText("excelBsdUploadHctrDialogTitle");
							var uploadHctr = that.ExcelOperations.fnOpenExcelUploadModel.bind(that);
							uploadHctr();
						}
					}
				})
			});
			var toolbarContentLength = this.overFlowToolBar.getContent().length;
			var UpldBtnIndex = 0;
			for (var toolbarIndex = 0; toolbarIndex < toolbarContentLength; toolbarIndex++) {
				if (this.overFlowToolBar.getContent()[toolbarIndex].getId().search("ActionExcelDownload") >= 0) {
					UpldBtnIndex = toolbarIndex + 2;
					break;
				}
			}
			uploadMenu.placeAt(this.overFlowToolBar, UpldBtnIndex);

			sap.ui.getCore().byId("uploadBtn").setText(this.oBundleText.getText("upload"));
			sap.ui.getCore().byId("uploadBtn").setTooltip(this.oBundleText.getText("upload"));
			sap.ui.getCore().byId("uploadCctrBtn").setText(this.oBundleText.getText("uploadCctr"));
			sap.ui.getCore().byId("uploadCctrBtn").setTooltip(this.oBundleText.getText("uploadCctr"));
			sap.ui.getCore().byId("uploadHctrBtn").setText(this.oBundleText.getText("uploadHctr"));
			sap.ui.getCore().byId("uploadHctrBtn").setTooltip(this.oBundleText.getText("uploadHctr"));
		},

		hideHierItmDistrBtn: function (oEvent) {
			var oView = this.getView();
			var ItmDistrBtnId =
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHierItmDistrbutton";
			var Tab1Id = ItmDistrBtnId + "-_tab1";
			var Tab2Id = ItmDistrBtnId + "-_tab2";
			var Tab3Id = ItmDistrBtnId + "-_tab3";
			oView.byId(Tab1Id).setVisible(false);
			oView.byId(Tab2Id).setVisible(false);
			oView.byId(Tab3Id).setVisible(false);
		},

		handleTabChange: function (oEvent) {
			var sSourceTab = oEvent.getSource().getId();
			var tab = this.getView().byId(sSourceTab).getSelectedKey();
			var tab1count = this.oSmTableInnerTab1.getSelectedItems().length;
			var tab2count = this.oSmTableInnerTab2.getSelectedItems().length;
			var tab3count = this.oSmTableInnerTab3.getSelectedItems().length;
			var tab4count = this.oSmTableInnerTab4.getSelectedItems().length;

			if (tab3count > 0 || tab4count > 0) {
				if (tab === "_tab1" || tab === "_tab2") {
					var sToastMsg = this.oBundleText.getText("ToastMsgCCTR");
					sap.m.MessageToast.show(sToastMsg, {
						duration: 9999, // default
						width: "600%", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			} else if (tab1count > 0 || tab2count > 0) {
				if (tab === "_tab3" || tab === "_tab4") {
					var sToastMsgHCTR = this.oBundleText.getText("ToastMsgHCTR");
					sap.m.MessageToast.show(sToastMsgHCTR, {
						duration: 9999, // default
						width: "600%", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			}
		},

		_onTable2RowSelection1: function (oEvent) {
			this.massEditEnableDisable(); // enable-disable Mass E
			var sSelectionChangedItemText, index;
			var oSelectionChangedItem = oEvent.getParameter("listItem"); //Up-Most Item whose selection is changed
			var aSelectionChanged = oEvent.getParameter("listItems"); // Array of Items whose selection changed
			var bIsSelected = oEvent.getParameter("selected"); // is selected
			var bIsSelectAll = oEvent.getParameter("selectAll"); // is SelectAll
			var model = this.oSmTableInnerTab2.getModel();
			//More than one item changed
			if (aSelectionChanged.length > 1) {
				if (bIsSelectAll) {
					this.isSelectAllTab2 = true;
					this.isInclusionTab2 = false;
					this.isExclusionTab2 = false;
					this.inclusionArrayTab2 = [];
					this.exclusionArrayTab2 = [];
					this.noneditCheckboxTab3Tab4();
				} else {
					this.isSelectAllTab2 = false;
					this.isInclusionTab2 = false;
					this.isExclusionTab2 = false;
					this.inclusionArrayTab2 = [];
					this.exclusionArrayTab2 = [];
					this.editableCheckBoxTab3Tab4();
				}
			} else {
				if (bIsSelected) {
					sSelectionChangedItemText = model.getProperty("FormattedPurchaseContractItem", oSelectionChangedItem.getBindingContext());
					if (this.exclusionArrayTab2.indexOf(sSelectionChangedItemText) > -1) {
						index = this.exclusionArrayTab2.indexOf(sSelectionChangedItemText);
						this.exclusionArrayTab2.splice(index, 1);
						if (this.exclusionArrayTab2.length === 0) {
							this.isSelectAllTab2 = true;
							this.isInclusionTab2 = false;
							this.isExclusionTab2 = false;
							this.noneditCheckboxTab3Tab4();
						}
					} else {
						this.inclusionArrayTab2.push(sSelectionChangedItemText);
						this.isInclusionTab2 = true;
						this.isExclusionTab2 = false;
						this.noneditCheckboxTab3Tab4();
					}
				} else {
					sSelectionChangedItemText = model.getProperty("FormattedPurchaseContractItem", oSelectionChangedItem.getBindingContext());
					if (this.inclusionArrayTab2.indexOf(sSelectionChangedItemText) > -1) {
						index = this.inclusionArrayTab2.indexOf(sSelectionChangedItemText);
						this.inclusionArrayTab2.splice(index, 1);
						if (this.inclusionArrayTab2.length === 0) {
							this.isSelectAllTab2 = false;
							this.isInclusionTab2 = false;
							this.isExclusionTab2 = false;
							this.editableCheckBoxTab3Tab4();
						}
					} else {
						this.exclusionArrayTab2.push(sSelectionChangedItemText);
						this.isInclusionTab2 = false;
						this.isExclusionTab2 = true;
						this.isSelectAllTab2 = false;
						this.noneditCheckboxTab3Tab4();
					}
				}
			}
		},

		_onTable1RowSelection1: function (oEvent) {
			this.massEditEnableDisable(); // enable-disable Mass E
			var sSelectionChangedItemText, index;
			var oSelectionChangedItem = oEvent.getParameter("listItem"); //Up-Most Item whose selection is changed
			var aSelectionChanged = oEvent.getParameter("listItems"); // Array of Items whose selection changed
			var bIsSelected = oEvent.getParameter("selected"); // is selected
			var bIsSelectAll = oEvent.getParameter("selectAll"); // is SelectAll
			var model = this.oSmTableInnerTab1.getModel();
			//More than one item changed
			if (aSelectionChanged.length > 1) {
				if (bIsSelectAll) {
					this.isSelectAllTab1 = true;
					this.isInclusionTab1 = false;
					this.isExclusionTab1 = false;
					this.inclusionArrayTab1 = [];
					this.exclusionArrayTab1 = [];
					this.noneditCheckboxTab3Tab4();
				} else {
					this.isSelectAllTab1 = false;
					this.isInclusionTab1 = false;
					this.isExclusionTab1 = false;
					this.inclusionArrayTab1 = [];
					this.exclusionArrayTab1 = [];
					this.editableCheckBoxTab3Tab4();
				}
			} else {
				if (bIsSelected) {
					sSelectionChangedItemText = model.getProperty("ActivePurchasingDocument", oSelectionChangedItem.getBindingContext());
					if (this.exclusionArrayTab1.indexOf(sSelectionChangedItemText) > -1) {
						index = this.exclusionArrayTab1.indexOf(sSelectionChangedItemText);
						this.exclusionArrayTab1.splice(index, 1);
						if (this.exclusionArrayTab1.length === 0) {
							this.isSelectAllTab1 = true;
							this.isInclusionTab1 = false;
							this.isExclusionTab1 = false;
							this.noneditCheckboxTab3Tab4();
						}
					} else {
						this.inclusionArrayTab1.push(sSelectionChangedItemText);
						this.isInclusionTab1 = true;
						this.isExclusionTab1 = false;
						this.noneditCheckboxTab3Tab4();
					}
				} else {
					sSelectionChangedItemText = model.getProperty("ActivePurchasingDocument", oSelectionChangedItem.getBindingContext());
					if (this.inclusionArrayTab1.indexOf(sSelectionChangedItemText) > -1) {
						index = this.inclusionArrayTab1.indexOf(sSelectionChangedItemText);
						this.inclusionArrayTab1.splice(index, 1);
						if (this.inclusionArrayTab1.length === 0) {
							this.isSelectAllTab1 = false;
							this.isInclusionTab1 = false;
							this.isExclusionTab1 = false;
							this.editableCheckBoxTab3Tab4();
						}
					} else {
						this.exclusionArrayTab1.push(sSelectionChangedItemText);
						this.isInclusionTab1 = false;
						this.isExclusionTab1 = true;
						this.isSelectAllTab1 = false;
						this.noneditCheckboxTab3Tab4();
					}
				}
			}
		},

		_onTable3RowSelection1: function (oEvent) {
			this.massEditEnableDisable(); // enable-disable Mass E
			var sSelectionChangedItemText, index;
			var oSelectionChangedItem = oEvent.getParameter("listItem"); //Up-Most Item whose selection is changed
			var aSelectionChanged = oEvent.getParameter("listItems"); // Array of Items whose selection changed
			var bIsSelected = oEvent.getParameter("selected"); // is selected
			var bIsSelectAll = oEvent.getParameter("selectAll"); // is SelectAll
			var model = this.oSmTableInnerTab3.getModel();
			//More than one item changed
			if (aSelectionChanged.length > 1) {
				if (bIsSelectAll) {
					this.isSelectAllTab3 = true;
					this.isInclusionTab3 = false;
					this.isExclusionTab3 = false;
					this.inclusionArrayTab3 = [];
					this.exclusionArrayTab3 = [];
					this.noneditCheckboxTab1Tab2();
				} else {
					this.isSelectAllTab3 = false;
					this.isInclusionTab3 = false;
					this.isExclusionTab3 = false;
					this.inclusionArrayTab3 = [];
					this.exclusionArrayTab3 = [];
					this.editableCheckBoxTab1Tab2();
				}
			} else {
				if (bIsSelected) {
					sSelectionChangedItemText = model.getProperty("ActivePurchasingDocument", oSelectionChangedItem.getBindingContext());
					if (this.exclusionArrayTab3.indexOf(sSelectionChangedItemText) > -1) {
						index = this.exclusionArrayTab3.indexOf(sSelectionChangedItemText);
						this.exclusionArrayTab3.splice(index, 1);
						if (this.exclusionArrayTab3.length === 0) {
							this.isSelectAllTab3 = true;
							this.isInclusionTab3 = false;
							this.isExclusionTab3 = false;
							this.noneditCheckboxTab1Tab2();
						}
					} else {
						this.inclusionArrayTab3.push(sSelectionChangedItemText);
						this.isInclusionTab3 = true;
						this.isExclusionTab3 = false;
						this.noneditCheckboxTab1Tab2();
					}
				} else {
					sSelectionChangedItemText = model.getProperty("ActivePurchasingDocument", oSelectionChangedItem.getBindingContext());
					if (this.inclusionArrayTab3.indexOf(sSelectionChangedItemText) > -1) {
						index = this.inclusionArrayTab3.indexOf(sSelectionChangedItemText);
						this.inclusionArrayTab3.splice(index, 1);
						if (this.inclusionArrayTab3.length === 0) {
							this.isSelectAllTab3 = false;
							this.isInclusionTab3 = false;
							this.isExclusionTab3 = false;
							this.editableCheckBoxTab1Tab2();
						}
					} else {
						this.exclusionArrayTab3.push(sSelectionChangedItemText);
						this.isInclusionTab3 = false;
						this.isExclusionTab3 = true;
						this.isSelectAllTab3 = false;
						this.noneditCheckboxTab1Tab2();
					}
				}
			}
		},
		_onTable4RowSelection1: function (oEvent) {
			this.massEditEnableDisable(); // enable-disable Mass E
			var sSelectionChangedItemText, index;
			var oSelectionChangedItem = oEvent.getParameter("listItem"); //Up-Most Item whose selection is changed
			var aSelectionChanged = oEvent.getParameter("listItems"); // Array of Items whose selection changed
			var bIsSelected = oEvent.getParameter("selected"); // is selected
			var bIsSelectAll = oEvent.getParameter("selectAll"); // is SelectAll
			var model = this.oSmTableInnerTab4.getModel();
			//More than one item changed
			if (aSelectionChanged.length > 1) {
				if (bIsSelectAll) {
					this.isSelectAllTab4 = true;
					this.isInclusionTab4 = false;
					this.isExclusionTab4 = false;
					this.inclusionArrayTab4 = [];
					this.exclusionArrayTab4 = [];
					this.noneditCheckboxTab1Tab2();
				} else {
					this.isSelectAllTab4 = false;
					this.isInclusionTab4 = false;
					this.isExclusionTab4 = false;
					this.inclusionArrayTab4 = [];
					this.exclusionArrayTab4 = [];
					this.editableCheckBoxTab1Tab2();
				}
			} else {
				if (bIsSelected) {
					sSelectionChangedItemText = model.getProperty("FormattedPurchaseContractItem", oSelectionChangedItem.getBindingContext());
					if (this.exclusionArrayTab4.indexOf(sSelectionChangedItemText) > -1) {
						index = this.exclusionArrayTab4.indexOf(sSelectionChangedItemText);
						this.exclusionArrayTab4.splice(index, 1);
						if (this.exclusionArrayTab4.length === 0) {
							this.isSelectAllTab4 = true;
							this.isInclusionTab4 = false;
							this.isExclusionTab4 = false;
							this.noneditCheckboxTab1Tab2();
						}
					} else {
						this.inclusionArrayTab4.push(sSelectionChangedItemText);
						this.isInclusionTab4 = true;
						this.isExclusionTab4 = false;
						this.noneditCheckboxTab1Tab2();
					}
				} else {
					sSelectionChangedItemText = model.getProperty("FormattedPurchaseContractItem", oSelectionChangedItem.getBindingContext());
					if (this.inclusionArrayTab4.indexOf(sSelectionChangedItemText) > -1) {
						index = this.inclusionArrayTab4.indexOf(sSelectionChangedItemText);
						this.inclusionArrayTab4.splice(index, 1);
						if (this.inclusionArrayTab4.length === 0) {
							this.isSelectAllTab4 = false;
							this.isInclusionTab4 = false;
							this.isExclusionTab4 = false;
							this.editableCheckBoxTab1Tab2();
						}
					} else {
						this.exclusionArrayTab4.push(sSelectionChangedItemText);
						this.isInclusionTab4 = false;
						this.isExclusionTab4 = true;
						this.isSelectAllTab4 = false;
						this.noneditCheckboxTab1Tab2();
					}
				}
			}
		},

		noneditCheckboxTab1Tab2: function () {
			var items1 = this.oSmTableInnerTab1.getItems();
			var items2 = this.oSmTableInnerTab2.getItems();
			var tab1sa =
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab1-sa";
			var tab2sa =
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab2-sa";
			this.oSmTableInnerTab1.removeSelections(true);
			this.oSmTableInnerTab2.removeSelections(true);
			var items1len;
			var items2len;
			items1len = items1.length;
			items2len = items2.length;

			if (items1len > 0) {
				for (var i in items1) {
					if (items1[i].getMultiSelectControl() !== undefined) {
						items1[i].getMultiSelectControl().setEditable(false);
					}
				}
			}

			// this.getView().byId(
			// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab1-sa"
			// ).setEditable(false);
			if (this.getView().byId(tab1sa) !== undefined) {
				this.getView().byId(tab1sa).setEditable(false);
			}
			//TAB2 
			if (items2len > 0) {
				for (var j in items2) {
					if (items2[j].getMultiSelectControl() !== undefined) {
						items2[j].getMultiSelectControl().setEditable(false);
					}
				}
			}

			// this.getView().byId(
			// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab2-sa"
			// ).setEditable(false);
			if (this.getView().byId(tab2sa) !== undefined) {
				this.getView().byId(tab2sa).setEditable(false);
			}
		},
		editableCheckBoxTab1Tab2: function () {
			var items1 = this.oSmTableInnerTab1.getItems();
			var items2 = this.oSmTableInnerTab2.getItems();

			for (var i in items1) {
				if (items1[i].getMultiSelectControl() !== undefined) {
					items1[i].getMultiSelectControl().setEditable(true);
				}
			}
			var tab1sa =
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab1-sa";
			var tab2sa =
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab2-sa";
			if (this.getView().byId(tab1sa) !== undefined) {
				this.getView().byId(tab1sa).setEditable(true);
			}
			// this.getView().byId(
			// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab1-sa"
			// ).setEditable(true);
			//TAB2 

			for (var j in items2) {
				if (items2[j].getMultiSelectControl() !== undefined) {
					items2[j].getMultiSelectControl().setEditable(true);
				}
			}
			// this.getView().byId(
			// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab2-sa"
			// ).setEditable(true);
			if (this.getView().byId(tab2sa) !== undefined) {
				this.getView().byId(tab2sa).setEditable(true);
			}
		},
		noneditCheckboxTab3Tab4: function () {
			var items3 = this.oSmTableInnerTab3.getItems();
			var items4 = this.oSmTableInnerTab4.getItems();
			var tab3sa =
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab3-sa";
			var tab4sa =
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab4-sa";
			this.oSmTableInnerTab3.removeSelections(true);
			this.oSmTableInnerTab4.removeSelections(true);
			//TAB3
			var items3len;
			var items4len;
			items3len = items3.length;
			items4len = items4.length;

			if (items3len > 0) {
				for (var i in items3) {
					if (items3[i].getMultiSelectControl() !== undefined) {
						items3[i].getMultiSelectControl().setEditable(false);
					}
					// this.getView().byId(
					// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab3-sa"
					// ).setEditable(false);
					if (this.getView().byId(tab3sa) !== undefined) {
						this.getView().byId(tab3sa).setEditable(false); //Disable selectAll box for tab3 
					}
				}
			}

			//TAB4

			if (items4len > 0) {
				for (var j in items4) {
					if (items4[j].getMultiSelectControl() !== undefined) {
						items4[j].getMultiSelectControl().setEditable(false);
					}
					// this.getView().byId(
					// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab4-sa"
					// ).setEditable(false);
					if (this.getView().byId(tab4sa) !== undefined) {
						this.getView().byId(tab4sa).setEditable(false); //Disable selectAll box for tab4 
					}
				}
			}

		},
		editableCheckBoxTab3Tab4: function () {
			var items3 = this.oSmTableInnerTab3.getItems();
			var items4 = this.oSmTableInnerTab4.getItems();

			for (var i in items3) {
				if (items3[i].getMultiSelectControl() !== undefined) {
					items3[i].getMultiSelectControl().setEditable(true);
				}
			}
			var tab3sa =
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab3-sa";
			var tab4sa =
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab4-sa";
			// this.getView().byId(
			// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab3-sa"
			// ).setEditable(true);
			if (this.getView().byId(tab3sa) !== undefined) {
				this.getView().byId(tab3sa).setEditable(true);
			}

			for (var j in items4) {
				if (items4[j].getMultiSelectControl() !== undefined) {
					items4[j].getMultiSelectControl().setEditable(true);
				}
			}

			// this.getView().byId(
			// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab4-sa"
			// ).setEditable(true);
			if (this.getView().byId(tab4sa) !== undefined) {
				this.getView().byId(tab4sa).setEditable(true);
			}
		},

		getTotalSelectedItemsCount: function () {
			var totalSelectedItems, tab1Count, tab2Count, hctrHeaderCount, hctrItemCount;
			if (this.oSmTableInnerTab1) {
				tab1Count = this.oSmTableInnerTab1.getSelectedItems().length;
			}
			if (this.oSmTableInnerTab2) {
				tab2Count = this.oSmTableInnerTab2.getSelectedItems().length;
			}
			if (this.oSmTableInnerTab3) {
				hctrHeaderCount = this.oSmTableInnerTab3.getSelectedItems().length;
			}
			if (this.oSmTableInnerTab4) {
				hctrItemCount = this.oSmTableInnerTab4.getSelectedItems().length;
			}
			//Enabling or Disabling the Add Header Distribution button
			if (hctrHeaderCount + hctrItemCount > 0) {
				this.subObjectType = 'H';
			} else if (tab1Count + tab2Count > 0) {
				this.subObjectType = 'C';
			}
			if (tab1Count + hctrHeaderCount === 0) {
				sap.ui.getCore().byId("AddHdrDistBtn").setEnabled(false);
			} else {
				sap.ui.getCore().byId("AddHdrDistBtn").setEnabled(true);
			}

			//Enabling or Disabling the Add Item Distribution button
			if (tab2Count + hctrItemCount === 0) {
				sap.ui.getCore().byId("AddItmDistBtn").setEnabled(false);
			} else {
				sap.ui.getCore().byId("AddItmDistBtn").setEnabled(true);
			}

			totalSelectedItems = tab1Count + tab2Count + hctrHeaderCount + hctrItemCount;
			if (totalSelectedItems > 0) {
				sap.ui.getCore().byId("MassAdditionBtn").setEnabled(true);
			} else {
				sap.ui.getCore().byId("MassAdditionBtn").setEnabled(false);
			}
			return totalSelectedItems;
		},

		_handleGrowing: function (oEvent) {
			var sReason = oEvent.getParameter("reason");
			var growingThreshold, itemsCount;
			var aItems, sSourceTab, model, sText;
			var checksa;
			//Check reason for update of table
			if (sReason === "Growing") {
				sSourceTab = oEvent.getSource().getId();
				//Source is 1st Tab/2nd Tab 
				if (sSourceTab ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab1"
				) {
					checksa = this.getView().byId(
						"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab1-sa"
					).getEditable();
					if (this.isSelectAllTab1) {
						this.oSmTableInnerTab1.selectAll();
					} else if (this.isExclusionTab1) {
						growingThreshold = this.oSmTableInnerTab1.getGrowingThreshold();
						aItems = this.oSmTableInnerTab1.getItems();
						itemsCount = aItems.length;
						model = this.oSmTableInnerTab1.getModel();
						for (var i = itemsCount - growingThreshold; i < itemsCount; i++) {
							sText = model.getProperty("ActivePurchasingDocument", aItems[i].getBindingContext());
							if (this.exclusionArrayTab1.indexOf(sText) > -1) {
								aItems[i].setSelected(false);
							} else {
								aItems[i].setSelected(true);
							}
						}
					} else if (checksa === false) {
						this.noneditCheckboxTab1Tab2();
					}
				} else if (sSourceTab ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab2"
				) {
					checksa = this.getView().byId(
						"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab2-sa"
					).getEditable();
					if (this.isSelectAllTab2) {
						this.oSmTableInnerTab2.selectAll();
					} else if (this.isExclusionTab2) {
						growingThreshold = this.oSmTableInnerTab2.getGrowingThreshold();
						aItems = this.oSmTableInnerTab2.getItems();
						itemsCount = aItems.length;
						model = this.oSmTableInnerTab2.getModel();
						for (i = itemsCount - growingThreshold; i < itemsCount; i++) {
							sText = model.getProperty("FormattedPurchaseContractItem", aItems[i].getBindingContext());
							if (this.exclusionArrayTab2.indexOf(sText) > -1) {
								aItems[i].setSelected(false);
							} else {
								aItems[i].setSelected(true);
							}
						}
					} else if (checksa === false) {
						this.noneditCheckboxTab1Tab2();
					}
				} else if (sSourceTab ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab3"
				) {
					checksa = this.getView().byId(
						"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab3-sa"
					).getEditable();
					if (this.isSelectAllTab3) {
						this.oSmTableInnerTab3.selectAll();
					} else if (this.isExclusionTab3) {
						growingThreshold = this.oSmTableInnerTab3.getGrowingThreshold();
						aItems = this.oSmTableInnerTab3.getItems();
						itemsCount = aItems.length;
						model = this.oSmTableInnerTab3.getModel();
						for (i = itemsCount - growingThreshold; i < itemsCount; i++) {
							sText = model.getProperty("ActivePurchasingDocument", aItems[i].getBindingContext());
							if (this.exclusionArrayTab3.indexOf(sText) > -1) {
								aItems[i].setSelected(false);
							} else {
								aItems[i].setSelected(true);
							}
						}
					} else if (checksa === false) {
						this.noneditCheckboxTab3Tab4();
					}
				} else if (sSourceTab ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab4"
				) {
					checksa = this.getView().byId(
						"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab4-sa"
					).getEditable();
					if (this.isSelectAllTab4) {
						this.oSmTableInnerTab4.selectAll();
					} else if (this.isExclusionTab4) {
						growingThreshold = this.oSmTableInnerTab4.getGrowingThreshold();
						aItems = this.oSmTableInnerTab4.getItems();
						itemsCount = aItems.length;
						model = this.oSmTableInnerTab4.getModel();
						for (i = itemsCount - growingThreshold; i < itemsCount; i++) {
							sText = model.getProperty("FormattedPurchaseContractItem", aItems[i].getBindingContext());
							if (this.exclusionArrayTab4.indexOf(sText) > -1) {
								aItems[i].setSelected(false);
							} else {
								aItems[i].setSelected(true);
							}
						}
					} else if (checksa === false) {
						this.noneditCheckboxTab3Tab4();
					}
				}
			} else if (sReason === "Refresh") {
				sSourceTab = oEvent.getSource().getId();
				var tab1count, tab2count, tab3count, tab4count;
				if (sSourceTab ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab1"
				) {
					tab3count = this.oSmTableInnerTab3.getSelectedItems().length;
					tab4count = this.oSmTableInnerTab4.getSelectedItems().length;
					if (tab3count > 0 || tab4count > 0) {
						this.noneditCheckboxTab1Tab2();
					}
				} else if (sSourceTab ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab2"
				) {
					tab3count = this.oSmTableInnerTab3.getSelectedItems().length;
					tab4count = this.oSmTableInnerTab4.getSelectedItems().length;
					if (tab3count > 0 || tab4count > 0) {
						this.noneditCheckboxTab1Tab2();
					}
				} else if (sSourceTab ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab3"
				) {
					tab1count = this.oSmTableInnerTab1.getSelectedItems().length;
					tab2count = this.oSmTableInnerTab2.getSelectedItems().length;
					if (tab1count > 0 || tab2count > 0) {
						this.noneditCheckboxTab3Tab4();
					}
				} else if (sSourceTab ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--responsiveTable-_tab4"
				) {
					tab1count = this.oSmTableInnerTab1.getSelectedItems().length;
					tab2count = this.oSmTableInnerTab2.getSelectedItems().length;
					if (tab1count > 0 || tab2count > 0) {
						this.noneditCheckboxTab3Tab4();
					}
				}
			}
		},

		setAffectedDocumentsCount: function () {
			//Setting in Mass Edit Dialog Selected PO/PO Item Count
			var selectedCtrCountLabel = this.getView().byId("SelectedCTRCount");
			var selectedCtrItemCountLabel = this.getView().byId("selectedCTRItemCount");
			var selectedCtrCountLabelAddHdrDist = this.getView().byId("AffectedCTRCount");
			var selectedCtrCountLabelAddItemDist = this.getView().byId("AffectedCTRItemCount");
			var growingInfoTab1 = this.oSmTableInnerTab1.getGrowingInfo();
			var growingInfoTab2 = this.oSmTableInnerTab2.getGrowingInfo();
			//HCTR Changes
			var selectedHCtrCountLabel = this.getView().byId("SelectedHCTRCount");
			var selectedHCtrItemCountLabel = this.getView().byId("selectedHCTRItemCount");
			var growingInfoTab3 = this.oSmTableInnerTab3.getGrowingInfo();
			var growingInfoTab4 = this.oSmTableInnerTab4.getGrowingInfo();
			var selectedCtrCount, selectedCtrItemCount, selectedHCtrCount, selectedHCtrItemCount;
			//Default Values
			selectedCtrCount = 0;
			selectedCtrItemCount = 0;
			selectedHCtrCount = 0;
			selectedHCtrItemCount = 0;
			//Count of Purchase Contract affected
			if (selectedCtrCountLabel || selectedCtrCountLabelAddHdrDist) {
				if (this.isSelectAllTab1) {
					selectedCtrCount = growingInfoTab1.total;
				} else if (this.isExclusionTab1) {
					selectedCtrCount = growingInfoTab1.total - this.exclusionArrayTab1.length;
				} else if (this.isInclusionTab1) {
					selectedCtrCount = this.inclusionArrayTab1.length;
				}
			}
			//Count of Purchase Contract Items affected
			if (selectedCtrItemCountLabel || selectedCtrCountLabelAddItemDist) {
				if (this.isSelectAllTab2) {
					selectedCtrItemCount = growingInfoTab2.total;
				} else if (this.isExclusionTab2) {
					selectedCtrItemCount = growingInfoTab2.total - this.exclusionArrayTab2.length;
				} else if (this.isInclusionTab2) {
					selectedCtrItemCount = this.inclusionArrayTab2.length;
				}
			}
			//Count for HCTR tab
			if (selectedHCtrCountLabel) {
				if (this.isSelectAllTab3) {
					selectedHCtrCount = growingInfoTab3.total;
				} else if (this.isExclusionTab3) {
					selectedHCtrCount = growingInfoTab3.total - this.exclusionArrayTab3.length;
				} else if (this.isInclusionTab3) {
					selectedHCtrCount = this.inclusionArrayTab3.length;
				}
			}
			//Count for HCTR Item Tab
			if (selectedHCtrItemCountLabel) {
				if (this.isSelectAllTab4) {
					selectedHCtrItemCount = growingInfoTab4.total;
				} else if (this.isExclusionTab4) {
					selectedHCtrItemCount = growingInfoTab4.total - this.exclusionArrayTab4.length;
				} else if (this.isInclusionTab4) {
					selectedHCtrItemCount = this.inclusionArrayTab4.length;
				}
			}
			if (selectedCtrCountLabel && selectedCtrCountLabel !== null && selectedCtrCountLabel !== undefined) {
				selectedCtrCountLabel.setText(selectedCtrCount);
			} else if (selectedCtrCountLabelAddHdrDist && selectedCtrCountLabelAddHdrDist !== null && selectedCtrCountLabelAddHdrDist !==
				undefined) {
				selectedCtrCountLabelAddHdrDist.setText(selectedCtrCount);
			}
			if (selectedCtrItemCountLabel && selectedCtrItemCountLabel !== null && selectedCtrItemCountLabel !== undefined) {
				selectedCtrItemCountLabel.setText(selectedCtrItemCount);
			} else if (selectedCtrCountLabelAddItemDist && selectedCtrCountLabelAddItemDist !== null && selectedCtrCountLabelAddItemDist !==
				undefined) {
				selectedCtrCountLabelAddItemDist.setText(selectedCtrItemCount);
			}
			//HCTR Changes			
			if (selectedHCtrCountLabel && selectedHCtrCountLabel !== null && selectedHCtrCountLabel !== undefined) {
				selectedHCtrCountLabel.setText(selectedHCtrCount);
			}
			if (selectedHCtrItemCountLabel && selectedHCtrItemCountLabel !== null && selectedHCtrItemCountLabel !== undefined) {
				selectedHCtrItemCountLabel.setText(selectedHCtrItemCount);
			}
		},

		onClickApplicationJob: function (oEvent) {

			var params = {
				"JobCatalogEntryName": "SAP_MM_PUR_MASSCCTRBG_J"
			};
			var oNavigationController = this.extensionAPI.getNavigationController();
			oNavigationController.navigateExternal("CtrApplicationJob", params);
		},

		clearInclusionExclusionVars: function () {
			this.isSelectAllTab1 = false;
			this.isExclusionTab1 = false;
			this.isInclusionTab1 = false;
			this.exclusionArrayTab1 = [];
			this.inclusionArrayTab1 = [];
			this.isSelectAllTab2 = false;
			this.isExclusionTab2 = false;
			this.isInclusionTab2 = false;
			this.exclusionArrayTab2 = [];
			this.inclusionArrayTab2 = [];
			//New changes for HCTR
			this.isSelectAllTab3 = false;
			this.isExclusionTab3 = false;
			this.isInclusionTab3 = false;
			this.exclusionArrayTab3 = [];
			this.inclusionArrayTab3 = [];
			this.isSelectAllTab4 = false;
			this.isExclusionTab4 = false;
			this.isInclusionTab4 = false;
			this.exclusionArrayTab4 = [];
			this.inclusionArrayTab4 = [];
		},

		applyChanges: function (sComment, oEvent, applyChangeCntrlId) {
			var oView = this.getView();
			var poEntry = {};
			this.MandateFieldChanged = [];
			this.ValueStateErrorFields = [];
			this.applychangesIndicator = "";
			this.DocumentCategory = "";
			this.nonMandateFieldChanged = [];
			var that = this;
			var rowContextsTab1, rowContextsTab2, currentRowContextTab1, currentRowContextTab2, sPath;
			var rowContextsTab3, rowContextsTab4, currentRowContextTab3, currentRowContextTab4;
			var url = "/C_PurCntrlContrItmMassUpdt";
			var afilters = [];
			var changedFields = {};
			var mergeCtr, mergeCtrItem, mergeCtrHdrdist, mergeCtrItmdist;
			afilters = that.getView().byId("listReportFilter").getFilters();
			that.getOwnerComponent().getModel().setUseBatch(true);
			var oBundle = that.getView().getModel("@i18n").getResourceBundle();
			that.getOwnerComponent().getModel().setDeferredGroups(["DEFAULT"]);

			// If Mass Edit From Apply Changes
			if (oEvent.getId() ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--MassEditForm"
			) {

				if (this.isSimulation === true) {
					this.setViewModelHeader(" ", "X");
				} else {
					this.setViewModelHeader(" ", " ");
				}
				this.applychangesIndicator = "ME";
				//	url = "/C_PurCntrlContrItmMassUpdt";
				changedFields = that.getMassEditChangedFields("MassEditForm-item--Form");
				poEntry = that._filterPoEntryValues(changedFields);
				rowContextsTab2 = that.oSmTableInnerTab2.getSelectedContexts();
				if (rowContextsTab2.length !== 0) {
					currentRowContextTab2 = rowContextsTab2[0];
					mergeCtr = that.getView().getModel().getProperty("CentralPurchaseContract", currentRowContextTab2);
					mergeCtrItem = that.getView().getModel().getProperty("CentralPurchaseContractItem", currentRowContextTab2);
				} else {
					rowContextsTab1 = that.oSmTableInnerTab1.getSelectedContexts();
					currentRowContextTab1 = rowContextsTab1[0];
					mergeCtr = that.getView().getModel().getProperty("CentralPurchaseContract", currentRowContextTab1);
					mergeCtrItem = "00010";
				}
				sPath = "/C_PurCntrlContrItmMassUpdt(CentralPurchaseContract='" + mergeCtr + "',CentralPurchaseContractItem='" + mergeCtrItem +
					"')";

			}
			//HCTR
			else if (oEvent.getId() ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--HrMassEditForm"
			) {
				if (this.isSimulation === true) {
					this.setViewModelHeader(" ", "X");
				} else {
					this.setViewModelHeader(" ", " ");
				}
				this.applychangesIndicator = "HME";
				changedFields = that.getMassEditChangedFields("HrMassEditForm-item--Form");
				poEntry = that._filterPoEntryValues(changedFields);
				rowContextsTab4 = that.oSmTableInnerTab4.getSelectedContexts();
				if (rowContextsTab4.length !== 0) {
					currentRowContextTab4 = rowContextsTab4[0];
					mergeCtr = that.getView().getModel().getProperty("CentralPurchaseContract", currentRowContextTab4);
					mergeCtrItem = that.getView().getModel().getProperty("CentralPurchaseContractItem", currentRowContextTab4);
				} else {
					rowContextsTab3 = that.oSmTableInnerTab3.getSelectedContexts();
					currentRowContextTab3 = rowContextsTab3[0];
					mergeCtr = that.getView().getModel().getProperty("CentralPurchaseContract", currentRowContextTab3);
					mergeCtrItem = "00010";
				}
				sPath = "/C_CntrlPurContrHierItmMassUpdt(CentralPurchaseContract='" + mergeCtr + "',CentralPurchaseContractItem='" +
					mergeCtrItem +
					"')";
				url = "/C_CntrlPurContrHierItmMassUpdt";
			}
			//If Add Header Distribution triggered Apply changes
			else if ((oEvent.getSource().getId() === "updateJobConfirmationBtn" || oEvent.getSource().getId() ===
					"simulateJobConfirmationBtn") && applyChangeCntrlId === "AddHeaderDistribution") {

				//fals to differentiate between Mass Update and Mass Add.
				if (oEvent.getSource().getId() === "updateJobConfirmationBtn") {
					this.setViewModelHeader("X", " ");
					// this.getView().getModel().setHeaders({
					// 	"MassAddition": "X",
					// 	"Simulation": ""
					// });
				} else if (oEvent.getSource().getId() === "simulateJobConfirmationBtn") {
					this.setViewModelHeader("X", "X");
					// this.getView().getModel().setHeaders({
					// 	"MassAddition": "X",
					// 	"Simulation": "X"
					// });
				}
				this.applychangesIndicator = "AH";
				//	url = "/C_CntrlPurContrHdrDistr";
				poEntry = that.getAddCCTRDistChangedFields("smartFormDistribution");
				rowContextsTab1 = that.oSmTableInnerTab1.getSelectedContexts();
				currentRowContextTab1 = rowContextsTab1[0];
				mergeCtr = that.getView().getModel().getProperty("CentralPurchaseContract", currentRowContextTab1);
				mergeCtrHdrdist = "0000";
				sPath = "/C_CntrlPurContrHdrDistr(CentralPurchaseContract='" + mergeCtr +
					"',DistributionKey='" + mergeCtrHdrdist + "')";
			} else if ((oEvent.getSource().getId() === "updateJobConfirmationBtn" || oEvent.getSource().getId() ===
					"simulateJobConfirmationBtn") && applyChangeCntrlId === "AddItemDistribution") {

				//fals to differentiate between Mass Update and Mass Add.
				if (oEvent.getSource().getId() === "updateJobConfirmationBtn") {
					this.setViewModelHeader("X", " ");
					// this.getView().getModel().setHeaders({
					// 	"MassAddition": "X",
					// 	"Simulation": ""
					// });
				} else if (oEvent.getSource().getId() === "simulateJobConfirmationBtn") {
					this.setViewModelHeader("X", "X");
					// this.getView().getModel().setHeaders({
					// 	"MassAddition": "X",
					// 	"Simulation": "X"
					// });
				}
				this.applychangesIndicator = "AI";
				//	url = "/C_CntrlPurContrHdrDistr";
				poEntry = that.getAddCCTRDistChangedFields("smartFormItemDistribution");
				rowContextsTab2 = that.oSmTableInnerTab2.getSelectedContexts();
				currentRowContextTab2 = rowContextsTab2[0];
				mergeCtr = that.getView().getModel().getProperty("CentralPurchaseContract", currentRowContextTab2);
				mergeCtrItem = that.getView().getModel().getProperty("CentralPurchaseContractItem", currentRowContextTab2);
				mergeCtrItmdist = "0000";
				sPath = "/C_CntrlPurContrItmDistr(CentralPurchaseContract='" + mergeCtr + "',CentralPurchaseContractItem='" + mergeCtrItem +
					"',DistributionKey='" + mergeCtrItmdist + "')";
			} else if ((oEvent.getSource().getId() === "updateJobConfirmationBtn" || oEvent.getSource().getId() ===
					"simulateJobConfirmationBtn") && applyChangeCntrlId === "AddHCTRItemDistribution") {

				//fals to differentiate between Mass Update and Mass Add.
				if (oEvent.getSource().getId() === "updateJobConfirmationBtn") {
					this.setViewModelHeader("X", " ");
					// this.getView().getModel().setHeaders({
					// 	"MassAddition": "X",
					// 	"Simulation": ""
					// });
				} else if (oEvent.getSource().getId() === "simulateJobConfirmationBtn") {
					this.setViewModelHeader("X", "X");
					// this.getView().getModel().setHeaders({
					// 	"MassAddition": "X",
					// 	"Simulation": "X"
					// });
				}
				this.applychangesIndicator = "AHI";
				url = "/C_CntrlPurContrHierItmMassUpdt";
				poEntry = that.getHCTRAddDistChangedFields("smartFormHCTRItemDistribution");
				rowContextsTab4 = that.oSmTableInnerTab4.getSelectedContexts();
				currentRowContextTab4 = rowContextsTab4[0];
				mergeCtr = that.getView().getModel().getProperty("CentralPurchaseContract", currentRowContextTab4);
				mergeCtrItem = that.getView().getModel().getProperty("CentralPurchaseContractItem", currentRowContextTab4);
				mergeCtrItmdist = "0000";
				sPath = "/C_CPurConHierItmDistrMassUpdt(CentralPurchaseContract='" + mergeCtr + "',CentralPurchaseContractItem='" + mergeCtrItem +
					"',PurgDocItemDistributionKey='" + mergeCtrItmdist + "')";
			} else if ((oEvent.getSource().getId() === "updateJobConfirmationBtn" || oEvent.getSource().getId() ===
					"simulateJobConfirmationBtn") && applyChangeCntrlId === "AddHCTRHeaderDistribution") {

				//fals to differentiate between Mass Update and Mass Add.
				if (oEvent.getSource().getId() === "updateJobConfirmationBtn") {
					this.setViewModelHeader("X", " ");
					// this.getView().getModel().setHeaders({
					// 	"MassAddition": "X",
					// 	"Simulation": ""
					// });
				} else if (oEvent.getSource().getId() === "simulateJobConfirmationBtn") {
					this.setViewModelHeader("X", "X");
					// this.getView().getModel().setHeaders({
					// 	"MassAddition": "X",
					// 	"Simulation": "X"
					// });
				}
				this.applychangesIndicator = "AHH";
				url = "/C_CntrlPurContrHierItmMassUpdt";
				poEntry = that.getHCTRAddDistChangedFields("smartFormHCTRHeaderDistribution");
				rowContextsTab3 = that.oSmTableInnerTab3.getSelectedContexts();
				currentRowContextTab3 = rowContextsTab3[0];
				mergeCtr = that.getView().getModel().getProperty("CentralPurchaseContract", currentRowContextTab3);
				mergeCtrHdrdist = "0000";
				sPath = "/C_CPurConHierHdrDistrMassUpdt(CentralPurchaseContract='" + mergeCtr +
					"',PurgDocItemDistributionKey='" + mergeCtrHdrdist + "')";
			}

			that.getOwnerComponent().getModel().read(url, {
				groupId: "DEFAULT",
				filters: afilters,
				urlParameters: {
					"$top": "1"
				}
			});
			poEntry.InternalComment = sComment;
			poEntry = that._preparePayloadAsPerScenario(poEntry, this.applychangesIndicator);
			that.getOwnerComponent().getModel().update(sPath, poEntry, {
				groupId: "DEFAULT",
				changeSetId: "myId"
			});
			that.getOwnerComponent().getModel().submitChanges({
				groupId: "DEFAULT",
				success: function (response) {
					var sMsg, jobId, sJobDescription, sJobScheduledText;
					jobId = response.__batchResponses[1].headers.job_id;
					if (jobId !== null && jobId !== undefined) {
						sJobDescription = oBundle.getText("jobDescription", [sComment]);
						sJobScheduledText = oBundle.getText("jobCreatedText", [sComment]); //.substring(sJobDescription.length);
						sMsg = new sap.m.Text("sJobScheduledText", {
							//text: "\"" + sJobDescription + "\"" + sJobScheduledText
							text: sJobScheduledText.replace(sJobDescription, '"' + sJobDescription + '"')
						});
						var dialog = new sap.m.Dialog({
							title: oBundle.getText("success"),
							type: "Message",
							state: "Success",
							content: sMsg,
							beginButton: new sap.m.Button({
								text: oBundle.getText("viewJobButtonText"),
								press: function () {
									that.onClickMassChangeJobs(jobId);
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
						sap.ui.core.BusyIndicator.hide();
						dialog.open();
						that.isTabChanged = false;
						that.resetTables(that);
						oView.byId(
							"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrHdrDistrbutton-_tab1"
						).setEnabled(false);
						oView.byId(
							"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--ActionC_CntrlPurContrItmDistrbutton-_tab2"
						).setEnabled(false);
					} else {
						sMsg = oBundle.getText("jobFailedText");
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(sMsg);
					}
					if (sMsg === null || sMsg === undefined) {
						sMsg = oBundle.getText("jobFailedText");
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(sMsg);
					}
				},
				error: function (err) {
					var sMsg = that.oBundleText.getText("errorOccured");
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(sMsg);
				}
			});

		},

		_preparePayloadAsPerScenario: function (poEntry, applychangesIndicator) {
			//For Tab 1
			if (applychangesIndicator === "ME" || applychangesIndicator === "AH") {
				if (this.isSelectAllTab1) {
					poEntry.PurOrdHeadersAreSelected = "X";
				} else if (this.isExclusionTab1) {
					poEntry.PurOrdHeadersAreSelected = " ";
					poEntry.PurchasingDocExclusionList = this.exclusionArrayTab1.toString();
				} else if (this.isInclusionTab1) {
					poEntry.PurOrdHeadersAreSelected = " ";
					poEntry.PurchasingDocInclusionList = this.inclusionArrayTab1.toString();
				}
			}
			//For Tab 2
			if (applychangesIndicator === "ME" || applychangesIndicator === "AI") {
				if (this.isSelectAllTab2) {
					poEntry.PurOrdItemsAreSelected = "X";
				} else if (this.isExclusionTab2) {
					poEntry.PurOrdItemsAreSelected = " ";
					if (poEntry.PurchasingDocExclusionList !== undefined) {
						poEntry.PurchasingDocExclusionList = poEntry.PurchasingDocExclusionList + "," + this.exclusionArrayTab2.toString();
					} else {
						poEntry.PurchasingDocExclusionList = this.exclusionArrayTab2.toString();
					}
				} else if (this.isInclusionTab2) {
					poEntry.PurOrdItemsAreSelected = " ";
					if (poEntry.PurchasingDocInclusionList !== undefined) {
						poEntry.PurchasingDocInclusionList = poEntry.PurchasingDocInclusionList + "," + this.inclusionArrayTab2.toString();
					} else {
						poEntry.PurchasingDocInclusionList = this.inclusionArrayTab2.toString();
					}
				}
			}
			//HCTR Tab 3			
			if (applychangesIndicator === "HME" || applychangesIndicator === "AHH") {
				if (this.isSelectAllTab3) {
					poEntry.PurOrdHeadersAreSelected = true;
				} else if (this.isExclusionTab3) {
					poEntry.PurOrdHeadersAreSelected = false;
					poEntry.PurchasingDocExclusionList = this.exclusionArrayTab3.toString();
				} else if (this.isInclusionTab3) {
					poEntry.PurOrdHeadersAreSelected = false;
					poEntry.PurchasingDocInclusionList = this.inclusionArrayTab3.toString();
				}
			}
			//HCTR Tab 4			
			if (applychangesIndicator === "HME" || applychangesIndicator === "AHI") {
				if (this.isSelectAllTab4) {
					poEntry.PurOrdItemsAreSelected = true;
				} else if (this.isExclusionTab4) {
					poEntry.PurOrdItemsAreSelected = false;
					if (poEntry.PurchasingDocExclusionList !== undefined) {
						poEntry.PurchasingDocExclusionList = poEntry.PurchasingDocExclusionList + "," + this.exclusionArrayTab4.toString();
					} else {
						poEntry.PurchasingDocExclusionList = this.exclusionArrayTab4.toString();
					}
				} else if (this.isInclusionTab4) {
					poEntry.PurOrdItemsAreSelected = false;
					if (poEntry.PurchasingDocInclusionList !== undefined) {
						poEntry.PurchasingDocInclusionList = poEntry.PurchasingDocInclusionList + "," + this.inclusionArrayTab4.toString();
					} else {
						poEntry.PurchasingDocInclusionList = this.inclusionArrayTab4.toString();
					}
				}
			}
			return poEntry;
		},

		//Method triggered for row navigation
		adaptNavigationParameterExtension: function (oSelectionVariant, oObjectInfo) {
			if (oObjectInfo.action === "manage" && oObjectInfo.semanticObject === "CentralPurchaseContract") {
				//fetch the tab that triggered the row navigation
				var currentTab = this.extensionAPI.getQuickVariantSelectionKey();
				oSelectionVariant.getSelectOptionsPropertyNames().forEach(function (sSelectOptionName) {
					//when item tab send ActivePurchasingDocument and CentralPurchaseContractItem to target application
					if (currentTab === "_tab2") {
						if (sSelectOptionName !== "ActivePurchasingDocument" && sSelectOptionName !== "CentralPurchaseContractItem" &&
							sSelectOptionName !== "CentralPurchaseContract") {
							oSelectionVariant.removeSelectOption(sSelectOptionName);
						}
					} else if (currentTab === "_tab1") {
						//when header tab send ActivePurchasingDocument to target application
						if (sSelectOptionName !== "ActivePurchasingDocument") {
							oSelectionVariant.removeSelectOption(sSelectOptionName);
						}
					}
				});
			}
		},

		onListNavigationExtension: function (oEvent, oBindingContext, bReplaceInHistory) {
			var currentTab = this.extensionAPI.getQuickVariantSelectionKey();
			if (currentTab === "_tab3") {
				var vCentralPurchaseContract = oEvent.getSource().getBindingContext().getObject().CentralPurchaseContract;
				var vComplete_url = window.location.href;
				var vUrlParts = vComplete_url.indexOf("#CentralPurchaseContract");
				var vRequiredURL = vComplete_url.slice(0, vUrlParts);
				var vSemanticObjandAction = "#CentralPurchaseContract-manage&/C_CntrlPurContrHierHdrTP";
				var vDraftContractHierarchy = "(CentralPurchaseContract='" + vCentralPurchaseContract +
					"',DraftUUID=guid'00000000-0000-0000-0000-000000000000";
				var vActiveEntity = "',IsActiveEntity=true)";
				vRequiredURL = (vRequiredURL + vSemanticObjandAction + vDraftContractHierarchy + vActiveEntity);
				sap.m.URLHelper.redirect(vRequiredURL, false);
			} else if (currentTab === "_tab4") {
				var vHierCentralPurchaseContract = oEvent.getSource().getBindingContext().getObject().CentralPurchaseContract;
				var vCentralPurchaseContractItem = oEvent.getSource().getBindingContext().getObject().CentralPurchaseContractItem;
				var vComplete_urlItem = window.location.href;
				var vUrlPartsitem = vComplete_urlItem.indexOf("#CentralPurchaseContract");
				var vRequiredURLItem = vComplete_urlItem.slice(0, vUrlPartsitem);
				var vSemanticObjandActionItem = "#CentralPurchaseContract-manage&/C_CntrlPurContrHierHdrTP";
				var vDraftContractHierarchyItem = "(CentralPurchaseContract='" + vHierCentralPurchaseContract +
					"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)/to_CntrlPurchaseContractItemTP(CentralPurchaseContractItem='" +
					vCentralPurchaseContractItem + "',CentralPurchaseContract='" + vHierCentralPurchaseContract +
					"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)";
				vRequiredURLItem = (vRequiredURLItem + vSemanticObjandActionItem + vDraftContractHierarchyItem);
				sap.m.URLHelper.redirect(vRequiredURLItem, false);
			}
		},
		onClickMassChangeJobs: function (sJobId) {
			var params = {
				"JobCatalogEntryName": "SAP_MM_PUR_MASSCCTRBG_J"
			};
			var oNavigationController = this.extensionAPI.getNavigationController();
			oNavigationController.navigateExternal("CtrApplicationJob", params);
		},
		//End Common method for Add Header Distribution and Mass Edit

		//START MAss Edit Methods

		//Method triggered on click of Central Contract(Active Purchaing Document) smart link
		onBeforePopoverOpensForActivePurchasingDoc: function (oEvent) {
			this.parametersBeforePopOver = oEvent.getParameters();
			var obj = this.parametersBeforePopOver.semanticAttributes;
			var semanticAttributesArray = this.constructiongSemanticAttributesArrayForActivePurchasingDoc(obj);
			this.parametersBeforePopOver.setSemanticAttributes(semanticAttributesArray);
			oEvent.getParameters().open();
			this.oNavigationHandler.processBeforeSmartLinkPopoverOpens([this.parametersBeforePopOver]);

		},
		constructiongSemanticAttributesArrayForActivePurchasingDoc: function (obj) {
			for (var name in obj) {
				if (obj.hasOwnProperty(name)) {
					//Send only ActivePurchasingDocument to the target application
					if (!(name === "ActivePurchasingDocument")) {
						delete obj[name];
					}
				}
			}
			return obj;
		},
		constructiongSemanticAttributesArrayForFormattedCTRItem: function (obj) {
			for (var name in obj) {
				if (obj.hasOwnProperty(name)) {
					//Send only ActivePurchasingDocument and CentralPurchaseContractItem to the target application
					if (!(name === "ActivePurchasingDocument" || name === "CentralPurchaseContractItem" || name === "CentralPurchaseContract")) {
						delete obj[name];
					}
				}
			}
			return obj;
		},

		//Method triggered on click of FormattedContractItem smart link
		onBeforePopoverOpensForFormattedCTRItem: function (oEvent) {
			this.parametersBeforePopOver = oEvent.getParameters();
			var obj = this.parametersBeforePopOver.semanticAttributes;
			//CentralContract holds the value of FormattedContractItem since the SemanticObject is Central Contract
			this.parametersBeforePopOver.semanticAttributes.ActivePurchasingDocument = this.parametersBeforePopOver.semanticAttributes.FormattedPurchaseContractItem
				.split("/")[0];
			this.parametersBeforePopOver.semanticAttributes.CentralPurchaseContractItem = this.parametersBeforePopOver.semanticAttributes.FormattedPurchaseContractItem
				.split("/")[1];
			this.parametersBeforePopOver.semanticAttributes.CentralPurchaseContract = this.parametersBeforePopOver.semanticAttributes.CentralPurchaseContract;
			var semanticAttributesArray = this.constructiongSemanticAttributesArrayForFormattedCTRItem(obj);

			this.parametersBeforePopOver.setSemanticAttributes(semanticAttributesArray);
			oEvent.getParameters().open();
			this.oNavigationHandler.processBeforeSmartLinkPopoverOpens([this.parametersBeforePopOver]);

		},

		//Method triggered on click of Central Contract Item smart link
		// onBeforePopoverOpensForCTRItem: function (oEvent) {
		// 	this.parametersBeforePopOver = oEvent.getParameters();
		// 	var obj = this.parametersBeforePopOver.semanticAttributes;
		// 	//extracting the active purchasing document and item value for navigation
		// 	this.parametersBeforePopOver.semanticAttributes.ActivePurchasingDocument = this.parametersBeforePopOver.semanticAttributes.FormattedPurchaseContractItem
		// 		.split("/")[0];
		// 	this.parametersBeforePopOver.semanticAttributes.CentralPurchaseContractItem = this.parametersBeforePopOver.semanticAttributes.FormattedPurchaseContractItem
		// 		.split("/")[1];
		// 	for (var name in obj) {
		// 		if (obj.hasOwnProperty(name)) {
		// 			//Send only ActivePurchasingDocument and CentralPurchaseContractItem to the target application
		// 			if (!(name === "ActivePurchasingDocument" || name === "CentralPurchaseContractItem")) {
		// 				delete obj[name];
		// 			}
		// 		}
		// 	}
		// 	this.parametersBeforePopOver.setSemanticAttributes(this.parametersBeforePopOver.semanticAttributes);
		// 	oEvent.getParameters().open();
		// 	this.oNavigationHandler.processBeforeSmartLinkPopoverOpens([this.parametersBeforePopOver]);
		// },

		massEditScrollToTop: function () {
			var oDiv = document.getElementById(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--affectedDocsVbox"
			);
			oDiv.scrollIntoView(true);
		},

		massEditEnableDisable: function () {
			var butMassEdit;
			var totalSelected = this.getTotalSelectedItemsCount();
			butMassEdit = this.getView().byId(
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--action::ActionC_PurCntrlContrItmMassUpdt1button"
			);
			if (totalSelected === 0) {
				butMassEdit.setEnabled(false);
				butMassEdit.setType("Transparent");
			} else {
				butMassEdit.setEnabled(true);
				butMassEdit.setType("Emphasized");
			}
		},

		OnClickMassEdit: function (oEvent) {
			if ((this.oSmTableInnerTab1.isAllSelectableSelected() || this.oSmTableInnerTab1.getSelectedItems().length > 0)) {
				sap.ui.core.BusyIndicator.show(5);
				this.countHeaderdistribution(oEvent);
			} else if (this.oSmTableInnerTab2.isAllSelectableSelected() || this.oSmTableInnerTab2.getSelectedItems().length > 0) {
				sap.ui.core.BusyIndicator.show(5);
				this.countItemdistribution(oEvent);
			} else {
				this.openMassEditDialog(oEvent);
			}
		},

		openMassEditDialog: function (oEvent) {
			var oView = this.getView();
			var mEditFormDialog;
			var CCTRCount = this.oSmTableInnerTab1.getSelectedItems().length + this.oSmTableInnerTab2.getSelectedItems().length;
			if (CCTRCount !== 0) {
				mEditFormDialog = oView.byId("MassEditForm");
				if (!mEditFormDialog) {
					mEditFormDialog = sap.ui.xmlfragment(oView.getId(), "ui.s2p.mm.cntrl.ctrmass.update.ext.fragment.MassEditForm", this);
					oView.addDependent(mEditFormDialog);
					this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoadedOfSetNewValueHeaderModel.bind(this,
						mEditFormDialog));
					this.enableSimulationFeature();
				}
			} else {
				//Logic for HCTR mass edit form	
				mEditFormDialog = oView.byId("HrMassEditForm");
				if (!mEditFormDialog) {
					mEditFormDialog = sap.ui.xmlfragment(oView.getId(), "ui.s2p.mm.cntrl.ctrmass.update.ext.fragment.HrMassEditForm", this);
					oView.addDependent(mEditFormDialog);
					this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoadedOfSetNewValueHeaderModel.bind(this,
						mEditFormDialog));
					var HCTRDoc = "X";
				}
			}
			this.massEditChangeFields = [];
			mEditFormDialog.setEscapeHandler(this.onPressEcsButton.bind(this));
			this.setAffectedDocumentsCount();
			// mEditFormDialog.setStretch(sap.ui.Device.system.phone);
			// mEditFormDialog.open();

			var oSmartForm;
			if (HCTRDoc === "X") {
				oSmartForm = this.getView().byId("HrMassEditForm-item");
			} else {
				oSmartForm = this.getView().byId("MassEditForm-item");
			}

			var sIgnoredFields =
				"CentralPurchaseContract,CentralPurchaseContractItem,FormattedPurchaseContractItem,ActivePurchasingDocument,";
			sIgnoredFields +=
				"PurchaseContractType,PurchasingDocumentTypeName,ProductType,ProductTypeName,MaterialGroup";
			sIgnoredFields +=
				"MaterialGroupName,Material,OrderQuantityUnit,ContractNetPriceAmount,DocumentCurrency,NetPriceQuantity,";
			sIgnoredFields +=
				"OrderPriceUnit,CntrlPurContrItmTargetAmount,SupplierConfControlKeyName,DomainText,ShippingInstructionName,";
			sIgnoredFields +=
				"PurchasingOrganization,PurchasingOrganizationName,PurchasingGroupName,CompanyCode,";
			sIgnoredFields +=
				"CompanyCodeName,Supplier,SupplierName,ValidityStartDate,Currency,CurrencyName,PurchasingProcessingStatus,PurchasingDocumentStatus,";
			sIgnoredFields +=
				"ItemDistributionStatusName,CreatedByUser,UserDescription,CreationDate,IsEndOfPurposeBlocked,PaymentTermsName,IncotermsClassificationName,";
			sIgnoredFields +=
				"IncotermsVersionName,ProcmtHubPurchasingOrg,ProcmtHubCompanyCode,ProcmtHubPurchasingGroup,Plant,ReleaseDateTime,InternalComment,";
			sIgnoredFields +=
				"PurchasingDocInclusionList,PurchasingDocExclusionList,PurOrdItemsAreSelected,PurOrdHeadersAreSelected,CntrlPurContrFlxblDistrIsAllwd";
			var sHeaderFields =
				"ValidityEndDate,PurchaseContractTargetAmount,PaymentTerms,CashDiscount1Days,CashDiscount1Percent,CashDiscount2Days,CashDiscount2Percent,";
			sHeaderFields +=
				"NetPaymentDays,IncotermsClassification,IncotermsLocation1,IncotermsLocation2,IncotermsVersion,PurchasingGroup,QuotationSubmissionDate,SupplierQuotation,";
			sHeaderFields +=
				"CorrespncExternalReference,CorrespncInternalReference,SupplierRespSalesPersonName,SupplierPhoneNumber,CntrlPurContrDistributionPct";
			var sItemfields =
				"MaterialDescription,TargetQuantity,PurgDocReleaseOrderQuantity,NoDaysReminder1,NoDaysReminder2,NoDaysReminder3,SupplierConfirmationControlKey,";
			sItemfields +=
				"PurgDocOrderAcknNumber,RequirementTracking,SupplierMaterialNumber,IsOrderAcknRqd,PurgDocEstimatedPrice,PurchasingPriceIsEstimated,PriceIsToBePrinted,";
			sItemfields +=
				"UnderdelivTolrtdLmtRatioInPct,OverdelivTolrtdLmtRatioInPct,UnlimitedOverdeliveryIsAllowed,StockType,TaxCode,ShippingInstruction,IsInfoAtRegistration,";
			sItemfields +=
				"GoodsReceiptIsExpected,GoodsReceiptIsNonValuated,InvoiceIsExpected,InvoiceIsGoodsReceiptBased,EvaldRcptSettlmtIsAllowed,CntrlPurContrItmDistrPct";

			// var aFormElements;
			// var oField;
			// var aFormContainers = this.getView().byId("MassEditForm-item--Form").getFormContainers();
			// for (var i = 0; i < aFormContainers.length; i++) {
			// 	//returns all the fields of the group
			// 	aFormElements = aFormContainers[i].getFormElements();
			// 	for (var j = 0; j < aFormElements.length; j++) {
			// 		//hiding every fields UOM
			// 		oField = aFormElements[j].getFields()[0];
			// 	}
			// }
			// var oHdrTable = this.getView().byId(
			// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab1"
			// ).getTable();
			// var oItmTable = this.getView().byId(
			// 	"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab2"
			// ).getTable();
			var HdrTab;
			var ItmTab;
			var Form;
			if (!HCTRDoc) {
				HdrTab =
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab1";
				ItmTab =
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab2";
				Form = "MassEditForm-item--Form";
			} else {
				HdrTab =
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab3";
				ItmTab =
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab4";
				Form = "HrMassEditForm-item--Form";
			}
			//Allow switch between CCTR and HCTR Edit				
			var oHdrTable = this.getView().byId(HdrTab).getTable();
			var oItmTable = this.getView().byId(ItmTab).getTable();

			// mEditFormDialog.setStretch(sap.ui.Device.system.phone);
			// mEditFormDialog.open();
			// var oHeaderGroup = this.getView().byId("MassEditForm-item--Form").getFormContainers()[0];
			// var oHeaderDistGroup = this.getView().byId("MassEditForm-item--Form").getFormContainers()[1];
			// var oItemGroup = this.getView().byId("MassEditForm-item--Form").getFormContainers()[2];
			// var oItemDistGroup = this.getView().byId("MassEditForm-item--Form").getFormContainers()[3];
			//Allow switch between CCTR and HCTR Edit			
			var oHeaderGroup = this.getView().byId(Form).getFormContainers()[0];
			var oHeaderDistGroup = this.getView().byId(Form).getFormContainers()[1];
			var oItemGroup = this.getView().byId(Form).getFormContainers()[2];
			var oItemDistGroup = this.getView().byId(Form).getFormContainers()[3];
			if (oHdrTable.isAllSelectableSelected() || oHdrTable.getSelectedItems().length > 0) {
				oHeaderGroup.setVisible(true);
				oHeaderDistGroup.setVisible(true);
				var HeaderDistCount = this.countHeaderDist;
				var HeaderDistCountFld = this.getView().byId("HeaderDistFieldcount");
				HeaderDistCountFld.setText(HeaderDistCount);

				oSmartForm.setIgnoredFields(sIgnoredFields + "," + sItemfields);
			}
			if (oItmTable.isAllSelectableSelected() || oItmTable.getSelectedItems().length > 0) {
				oItemGroup.setVisible(true);
				oItemDistGroup.setVisible(true);
				var ItemDistCount = this.countItemDist;
				var ItemDistCountFld = this.getView().byId("ItemDistFieldcount");
				ItemDistCountFld.setText(ItemDistCount);

				oSmartForm.setIgnoredFields(sIgnoredFields + "," + sHeaderFields);
			}
			mEditFormDialog.setStretch(sap.ui.Device.system.phone);
			//Disabling the Reason code and Purchaser Note
			// oSmartForm.getGroups()[4].getFormElements()[0].getFields()[0].getDependents()[0].setEnabled(false);
			// oSmartForm.getGroups()[4].getFormElements()[1].getFields()[0].getDependents()[0].setEnabled(false);
			var PurchaserNoteField = this.getView().byId("PurgDocNoteTextFld-SmartField-input");
			PurchaserNoteField.addEventDelegate({
				onsapfocusleave: this.validatePurchaserNote.bind(this)
			});
			mEditFormDialog.open();
		},

		countHeaderdistribution: function (oEvent) {
			var oFilterData = this.oSmFilter.getFilters();
			var oEvent2 = oEvent;
			var that = this;
			if (this.isInclusionTab1) {
				// if (oFilterData.length) {
				// //	oFilterData = oFilterData[0].aFilters;
				// }
				for (var i in this.inclusionArrayTab1) {
					oFilterData.push(new Filter("ActivePurchasingDocument", "EQ", this.inclusionArrayTab1[i]));
				}
			} else if (this.isExclusionTab1) {
				//	oFilterData = this.oSmFilter.getFilters();
				var f = new Filter({
					filters: [],
					and: true
				});
				for (var j in this.exclusionArrayTab1) {
					f.aFilters.push(new Filter("ActivePurchasingDocument", "NE", this.exclusionArrayTab1[j], true));
				}
				oFilterData.push(f);
			}
			// else {
			// //	oFilterData = this.oSmFilter.getFilters();
			// 	if (oFilterData.length) {
			// 		oFilterData = oFilterData[0].aFilters;
			// 	} else {
			// 		oFilterData = [];
			// 	}
			// }
			var sUrl = "/C_CntrlPurContrHdrDistr";
			var odataModel = this.getOwnerComponent().getModel();
			odataModel.read(sUrl, {
				filters: oFilterData,
				success: function (oData) {
					that.HeaderDistArray = oData.results;
					that.countHeaderDist = oData.results.length;
					that.countItemdistribution(oEvent2);
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		countItemdistribution: function (oEvent) {
			var that = this;
			var oFilterData = this.oSmFilter.getFilters();

			if (this.oSmTableInnerTab2.isAllSelectableSelected() || this.oSmTableInnerTab2.getSelectedItems().length > 0) {
				if (this.isInclusionTab2) {
					// if (oFilterData.length) {
					// 	oFilterData = oFilterData[0].aFilters;
					// }
					for (var i in this.inclusionArrayTab2) {
						oFilterData.push(new Filter("FormattedPurchaseContractItem", "EQ", this.inclusionArrayTab2[i]));
					}
				} else if (this.isExclusionTab2) {
					var f = new Filter({
						filters: [],
						and: true
					});
					for (var j in this.exclusionArrayTab2) {
						f.aFilters.push(new Filter("FormattedPurchaseContractItem", "NE", this.exclusionArrayTab2[j], true));
					}
					oFilterData.push(f);
				}
				var sUrl = "/C_CntrlPurContrItmDistr/$count";
				oFilterData.push(new Filter("ReferenceHeaderDistributionKey", "EQ", "0000"));
				var odataModel = this.getOwnerComponent().getModel();
				odataModel.read(sUrl, {
					filters: oFilterData,
					success: function (oData) {

						that.countItemDist = oData;
						sap.ui.core.BusyIndicator.hide();
						that.openMassEditDialog(oEvent);
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
					}
				});
			} else {
				sap.ui.core.BusyIndicator.hide();
				this.openMassEditDialog(oEvent);
			}
		},

		onPressEcsButton: function (oEvent) {
			this.onMassEditDialogClose();
			oEvent.resolve();
		},

		resetTables: function (oEvent) {
			if (oEvent === undefined || oEvent.oSmTableTab1 !== undefined || oEvent.oSmTableTab2 !== undefined || oEvent.oSmTableTab3 !==
				undefined || oEvent.oSmTableTab4 !== undefined) {
				this.oSmTableInnerTab1.removeSelections(true);
				this.oSmTableInnerTab2.removeSelections(true);
				this.oSmTableInnerTab3.removeSelections(true);
				this.oSmTableInnerTab4.removeSelections(true);
				this.clearInclusionExclusionVars();
				//Take care of selections after Mass Edit				
				this.editableCheckBoxTab1Tab2();
				this.editableCheckBoxTab3Tab4();
			} else if (oEvent !== undefined && oEvent.getSource() === this.oSmTableTab1) {
				this.oSmTableInnerTab1.removeSelections(true);
				this.isSelectAllTab1 = false;
				this.isExclusionTab1 = false;
				this.isInclusionTab1 = false;
				this.exclusionArrayTab1 = [];
				this.inclusionArrayTab1 = [];
			} else if (oEvent !== undefined && oEvent.getSource() === this.oSmTableTab2) {
				this.oSmTableInnerTab2.removeSelections(true);
				this.isSelectAllTab2 = false;
				this.isExclusionTab2 = false;
				this.isInclusionTab2 = false;
				this.exclusionArrayTab2 = [];
				this.inclusionArrayTab2 = [];
			} else if (oEvent !== undefined && oEvent.getSource() === this.oSmTableTab3) {
				this.oSmTableInnerTab3.removeSelections(true);
				this.isSelectAllTab3 = false;
				this.isExclusionTab3 = false;
				this.isInclusionTab3 = false;
				this.exclusionArrayTab3 = [];
				this.inclusionArrayTab3 = [];
			} else if (oEvent !== undefined && oEvent.getSource() === this.oSmTableTab4) {
				this.oSmTableInnerTab4.removeSelections(true);
				this.isSelectAllTab4 = false;
				this.isExclusionTab4 = false;
				this.isInclusionTab4 = false;
				this.exclusionArrayTab4 = [];
				this.inclusionArrayTab4 = [];
			}
			this.massEditEnableDisable();
		},

		fnCompareProperties: function (propName, propValue) {
			var property;
			var CDSEntity;
			var isHCTR = this.oSmTableInnerTab3.getSelectedItems().length + this.oSmTableInnerTab4.getSelectedItems().length;
			//The new MassEdit Fragment for HCTR has a new CDS Entity now.			
			if (isHCTR) {
				CDSEntity = "C_CntrlPurContrHierItmMassUpdtType";
			} else {
				CDSEntity = "C_PurCntrlContrItmMassUpdtType";
			}
			for (var i = 0; i < this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType.length; i++) {
				if (this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType[i].name ===
					// "C_PurCntrlContrItmMassUpdtType") {
					CDSEntity) {
					for (var j = 0; j < this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType[i].property.length; j++) {
						property = this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType[i].property[j];
						if (propName === property.name) {
							if (propValue === null) {
								if (property.type === "Edm.DateTime") {
									this.oProperties[propName] = new Date(-18000000000000);
								} else if (property.type === "Edm.Decimal") {
									this.oProperties[propName] = "0.0";
								} else if (property.type === "Edm.Boolean") {
									this.oProperties[propName] = false;
								} else {
									this.oProperties[propName] = " ";
								}
							} else {
								if (property.type === "Edm.Decimal") {
									this.oProperties[propName] = propValue.toString();
								} else {
									this.oProperties[propName] = propValue;
								}
							}
						}
					}
				}
			}
			return this.oProperties;
		},

		onPressRestoreButton: function (oEvent) {
			this.resetSetNewValuesForm("MassEditForm-item--Form", "MassEditForm");
			this.getView().byId("MassEditForm").getModel().resetChanges();
		},

		resetSetNewValuesForm: function (EditForm, EditView) {
			var aFormElements;
			var oField;
			//returns the groups within the form
			var aFormContainers = this.getView().byId(EditForm).getFormContainers();
			for (var i = 0; i < aFormContainers.length; i++) {
				//returns all the fields of the group
				if (aFormContainers[i].getVisible() === true) {
					aFormElements = aFormContainers[i].getFormElements();
					for (var j = 0; j < aFormElements.length; j++) {
						//setting every field to initial state
						if (aFormElements[j].getVisible() === true) {
							oField = aFormElements[j].getFields()[0];
							if ((j !== 0 || i !== 1) && (i !== 3 || j !== 0)) {
								oField.setSelectedIndex(0);
							}
						}
					}
				}
			}
			this.getView().byId(EditView).getParent().byId("applyChangesButton").setEnabled(false);
			this.getView().byId(EditView).getParent().byId("restoreButton").setEnabled(false);
		},

		onPressCancelButton: function (oEvent) {
			var oSource = oEvent.getSource().getParent().getId();
			if (oSource ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--MassEditForm"
			) {
				this.onMassEditDialogClose("MassEditForm");
			}
			oEvent.getSource().getParent().close();
			oEvent.getSource().getParent().destroy();
			this.oHeaderDistributionFilters = [];
			this.oItemDistributionFilters = [];
		},

		onMassEditDialogClose: function (Form) {
			var oComponent = this.getOwnerComponent();
			var oSetNewValuesModel = oComponent.getModel();
			var oMultiEditContainer = this.getView().byId(Form).getContent()[1];
			var aContexts = oMultiEditContainer.getContexts();
			var oContext = aContexts[0];
			oSetNewValuesModel.deleteCreatedEntry(oContext);
		},

		onCtrSmartFormCheck: function (oEvent) {
			var oSmartForm = this.getView().byId("MassEditForm-item");
			var fieldId = oEvent.getParameter("id");
			var changedFieldPosition = this.getNewChangedFieldPosition(this.massEditChangeFields, fieldId);
			var changedField;
			if (oEvent.getSource().getSelectedItem().getProperty("key") !== "keep") {
				if (changedFieldPosition === undefined) {
					changedField = {
						fieldId: fieldId
					};
					this.massEditChangeFields.push(changedField);
				}
			} else {
				if (changedFieldPosition !== undefined) {
					this.massEditChangeFields.splice(changedFieldPosition, 1);
				}
			}
			//Condition for Restore Button
			if (this.massEditChangeFields.length > 0) {
				this.getView().byId("MassEditForm").getParent().byId("restoreButton").setEnabled(true);
				if (this.getView().byId("PurgDocNoteTextFld-SmartField-input").getValue().length <= 5000) {
					this.getView().byId("MassEditForm").getParent().byId("applyChangesButton").setEnabled(true);
					this.getView().byId("MassEditForm").getParent().byId("simulateJobButton").setEnabled(true);
				} else {
					this.getView().byId("MassEditForm").getParent().byId("applyChangesButton").setEnabled(false);
					this.getView().byId("MassEditForm").getParent().byId("simulateJobButton").setEnabled(false);
				}
			} else {
				this.getView().byId("MassEditForm").getParent().byId("restoreButton").setEnabled(false);
				this.getView().byId("MassEditForm").getParent().byId("applyChangesButton").setEnabled(false);
				this.getView().byId("MassEditForm").getParent().byId("simulateJobButton").setEnabled(false);
				// 	oSmartForm.getGroups()[4].getFormElements()[0].getFields()[0].getDependents()[0].setEnabled(false);
				// oSmartForm.getGroups()[4].getFormElements()[1].getFields()[0].getDependents()[0].setEnabled(false);
			}
		},

		getNewChangedFieldPosition: function (massEditChangeFields, fieldId) {
			var chnagedField, chnagedFieldPosition;
			for (var iPos = 0; iPos < massEditChangeFields.length; iPos++) {
				chnagedField = massEditChangeFields[iPos];
				if (chnagedField.fieldId === fieldId) {
					chnagedFieldPosition = iPos;
					break;
				}
			}
			return chnagedFieldPosition;
		},

		_fnFindErrors: function (aErrorTokens) {
			var that = this;
			var HCTREdit = this.oSmTableInnerTab3.getSelectedItems().length + this.oSmTableInnerTab4.getSelectedItems().length;
			var DialogId;
			var Form;
			if (HCTREdit) {
				DialogId = this.getView().byId("HrMassEditForm");
				Form = "HrMassEditForm-item--Form";
			} else {
				DialogId = this.getView().byId("MassEditForm");
				Form = "MassEditForm-item--Form";
			}
			var aErrorFields = this.getErrorFields(Form);
			var aError = aErrorTokens.concat(aErrorFields);
			var arrFiltered = aError.filter(function (item, index) {
				return aError.indexOf(item) >= index;
			});
			// var ignoreItem = ["SupplierConfirmationControlKey", "StockType", "TaxCode", "ShippingInstruction"];
			// var ignoreHeader = ["PaymentTerms", "IncotermsClassification", "IncotermsVersion"];
			var ignoreItem = ["MaterialDescription", "TargetQuantity", "PurgDocReleaseOrderQuantity", "NoDaysReminder1", "NoDaysReminder2",
				"NoDaysReminder3", "SupplierConfirmationControlKey",
				"PurgDocOrderAcknNumber", "RequirementTracking", "SupplierMaterialNumber", "IsOrderAcknRqd", "PurgDocEstimatedPrice",
				"PurchasingPriceIsEstimated",
				"PriceIsToBePrinted",
				"UnderdelivTolrtdLmtRatioInPct", "OverdelivTolrtdLmtRatioInPct", "UnlimitedOverdeliveryIsAllowed", "StockType", "TaxCode",
				"ShippingInstruction", "IsInfoAtRegistration",
				"GoodsReceiptIsExpected", "GoodsReceiptIsNonValuated", "InvoiceIsExpected", "InvoiceIsGoodsReceiptBased",
				"EvaldRcptSettlmtIsAllowed", "CntrlPurContrItmDistrPct"
			];

			var ignoreHeader = [
				"ValidityEndDate", "PurchaseContractTargetAmount", "PaymentTerms", "CashDiscount1Days", "CashDiscount1Percent",
				"CashDiscount2Days", "CashDiscount2Percent",
				"NetPaymentDays", "IncotermsClassification", "IncotermsLocation1", "IncotermsLocation2", "IncotermsVersion",
				"QuotationSubmissionDate", "SupplierQuotation",
				"CorrespncExternalReference", "CorrespncInternalReference", "SupplierRespSalesPersonName", "SupplierPhoneNumber",
				"CntrlPurContrDistributionPct", "PurchasingGroup"
			];
			var HdrTab;
			var ItmTab;
			if (HCTREdit) {
				HdrTab =
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab3";
				ItmTab =
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab4";
			} else {
				HdrTab =
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab1";
				ItmTab =
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--listReport-_tab2";
			}
			var oHdrTable = that.getView().byId(HdrTab).getTable();
			var oItmTable = that.getView().byId(ItmTab).getTable();

			var newError = [],
				i;

			if (oHdrTable.getSelectedItems().length === 0) {
				//remove header field
				for (i = 0; i < arrFiltered.length; i++) {
					var index = ignoreHeader.indexOf(arrFiltered[i].getPropertyName());
					if (index === -1) {
						newError.push(arrFiltered[i]);
					}
				}
			} else if (oItmTable.getSelectedItems().length === 0) {
				//remove item fields
				for (i = 0; i < arrFiltered.length; i++) {
					index = ignoreItem.indexOf(arrFiltered[i].getPropertyName());
					if (index === -1) {
						newError.push(arrFiltered[i]);
					}
				}
			} else if (oHdrTable.getSelectedItems().length !== 0 && oItmTable.getSelectedItems().length !== 0) {
				newError = arrFiltered;
			}

			if (newError.length > 0) {
				that.onPressApplyChangesWithErroneousFields(newError);
			} else {

				that.createApplyChangesPopUp(DialogId);
			}
		},

		onPressApplyChangesButton: function (oEvent) {

			var oMultiEditContainer = this.getView().byId("MassEditForm").getContent()[1];
			var oPromise = oMultiEditContainer.getErroneousFieldsAndTokens();
			var that = this;
			if (oEvent.getSource().getId() ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--simulateJobButton"
			) {
				this.isSimulation = true;
			} else {
				this.isSimulation = false;
			}
			oPromise.then(function (data) {
				that._fnFindErrors(data);
			}, function (err) {
				jQuery.sap.log.info("FYI:" + err);
			});

		},

		onPressApplyChangesWithErroneousFields: function (aErrorFields2) {
			var aErroneousFields = {};
			var aErrorMessages = [];
			var sLabel, i;
			var that = this;

			for (i = 0; i < aErrorFields2.length; i++) {
				sLabel = aErrorFields2[i].getLabel().getProperty("text");
				aErroneousFields = {
					"title": that.oBundleText.getText("InvalidEntry", [sLabel])
				};
				aErrorMessages.push(aErroneousFields);
			}
			var oMessageTemplate = new sap.m.MessageItem({
				type: "Error",
				title: "{title}"
			});
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(aErrorMessages);
			var oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: false,
				items: {
					path: "/",
					template: oMessageTemplate
				}
			});
			oMessageView.setModel(oModel);
			that.oDialog = new sap.m.Dialog({
				resizable: true,
				content: oMessageView,
				state: "Error",
				beginButton: new sap.m.Button({
					press: function () {
						this.getParent().close();
					},
					text: "Close"
				}),
				customHeader: new sap.m.Bar({
					contentMiddle: [
						new sap.m.Text({
							text: that.oBundleText.getText("Error")
						})
					]
				}),
				contentHeight: "300px",
				contentWidth: "500px",
				verticalScrolling: false
			});
			that.oDialog.open();
		},

		getErrorFields: function (EditView) {
			//Error Fields with state <Replace Field Value> and value is blank or Numerical Value entered is negative
			var aFormContainers = this.getView().byId(EditView).getFormContainers();
			var aErrorFields = [];
			var chkFields = ["PurchaseContractTargetAmount", "PaymentTerms", "PurchasingGroup", "CashDiscount1Days", "CashDiscount1Percent",
				"CashDiscount2Days", "CashDiscount2Percent", "NetPaymentDays", "CntrlPurContrDistributionPct",
				"TargetQuantity", "PurgDocReleaseOrderQuantity", "NoDaysReminder1", "NoDaysReminder2",
				"NoDaysReminder3",
				"PurgDocOrderAcknNumber", "RequirementTracking", "SupplierMaterialNumber",
				"UnderdelivTolrtdLmtRatioInPct", "OverdelivTolrtdLmtRatioInPct", "CntrlPurContrItmDistrPct"
			];
			var aFormElements, oField, keep;
			for (var i = 0; i < aFormContainers.length; i++) {
				if (aFormContainers[i].getVisible() === true) {
					aFormElements = aFormContainers[i].getFormElements();
					for (var j = 0; j < aFormElements.length; j++) {
						if ((j !== 0 || i !== 1) && (i !== 3 || j !== 0)) {
							if (aFormElements[j].getVisible() === true) {
								oField = aFormElements[j].getFields()[0];
								keep = oField.getSelectedItem().getKey();
								if (keep === "new") {
									if (chkFields.indexOf(oField.getSmartField().getDataProperty().typePath) !== -1) {
										if (oField.getSmartField().getValue().indexOf("-") === 0) {
											oField.getSmartField().setValueState(sap.ui.core.ValueState.Error);
											aErrorFields.push(oField);
										}
									}
									// if (oField.getSmartField().getValue().indexOf("-") === 0) {
									// 	// if (oField.getSmartField().getValue() < 0) {
									// 	oField.getSmartField().setValueState(sap.ui.core.ValueState.Error);
									// 	aErrorFields.push(oField);
									// }
									if (oField.getSmartField().getValue() === "" || !oField.getSmartField().getValue()) {
										oField.getSmartField().setValueState(sap.ui.core.ValueState.Error);
										aErrorFields.push(oField);
									}
								}
							}
						}
					}
				}
			}
			return aErrorFields;
		},

		getMassEditChangedFields: function (EditView) {
			var aFormElements;
			var oField;
			var changedFields = {};
			var aFormContainers = this.getView().byId(EditView).getFormContainers();
			for (var i = 0; i < aFormContainers.length; i++) {
				//returns all the fields of the group
				aFormElements = aFormContainers[i].getFormElements();
				for (var j = 0; j < aFormElements.length; j++) {
					if ((j !== 0 || i !== 1) && (i !== 3 || j !== 0)) {
						oField = aFormElements[j].getFields()[0];
						if (oField.getSelectedItem() !== null) {
							var keep = oField.getSelectedItem().getKey();
							var fName, fValue;
							if (keep !== "keep") {
								if (keep === "blank") {
									fName = oField.getPropertyName();
									fValue = null;
								} else if (keep === "new") {
									fName = oField.getPropertyName();
									if (oField.getDataType() === "Edm.Decimal") {
										fValue = oField.getRawValue()[fName].toString();
									} else {
										fValue = oField.getRawValue()[fName];
									}

									//check when fields have associated UOM field, process them and add them for changed values to send for update
									if (oField.isComposite() === true && oField.getUnitOfMeasure() !== "") {
										changedFields[oField.getUnitOfMeasurePropertyName()] = oField.getUnitOfMeasure();
									}
								} else if (keep === "true") {
									fName = oField.getPropertyName();
									fValue = true;
								} else if (keep === "false") {
									fName = oField.getPropertyName();
									fValue = false;
								}
								changedFields[fName] = fValue;
							}
						}
					}
				}
			}

			return changedFields;
		},

		_filterPoEntryValues: function (oNewValuesObjects) {
			this.oProperties = {};
			var property, poIntermediateFields = {},
				that = this;
			$.each(oNewValuesObjects, function (propName, propValue) {
				poIntermediateFields = that.fnCompareProperties(propName, propValue, property);
			});
			return poIntermediateFields;
		},

		//End MAss Edit Methos

		//Add Header Distribution START

		//Method to form an object for changed fields to be sent to backend for header distribution creation.
		// getAddHdrDistChangedFields: function (smartFormId) {
		// 	var changedAddDistFields = {};
		// 	this.MandateFieldChanged = [];
		// 	this.ValueStateErrorFields = [];
		// 	this.nonMandateFieldChanged = [];
		// 	this.DocumentCategory = "";
		// 	var fieldname, fieldval;
		// 	for (var outerIndex = 0; outerIndex < 2; outerIndex++) {
		// 		for (var innerIndex = 0; innerIndex < 6; innerIndex++) {
		// 			fieldname = this.byId(smartFormId).getGroups()[outerIndex].getGroupElements()[innerIndex].getElements()[0].getBindingInfo(
		// 				"value").parts[0].path;
		// 			fieldval = this.byId(smartFormId).getGroups()[outerIndex].getGroupElements()[innerIndex].getElements()[0].getProperty(
		// 				"value");
		// 			if (fieldval && fieldval !== null && fieldval !== undefined) {
		// 				changedAddDistFields[fieldname] = fieldval;
		// 			}
		// 		}
		// 	}
		// 	return changedAddDistFields;
		// },
		getAddCCTRDistChangedFields: function (smartFormId) {
			var changedAddDistFields = {};
			this.MandateFieldChanged = [];
			this.ValueStateErrorFields = [];
			this.nonMandateFieldChanged = [];
			this.DocumentCategory = "";
			var ProcmtHubPurgDocItmCategory = this.byId(smartFormId).getGroups()[0].getGroupElements()[0].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcmtHubPurgDocItmCategoryvalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[0].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcmtHubPurgDocItmCategory] = ProcmtHubPurgDocItmCategoryvalue;

			var ProcmtHubCompanyCode = this.byId(smartFormId).getGroups()[0].getGroupElements()[1].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcmtHubCompanyCodevalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[1].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcmtHubCompanyCode] = ProcmtHubCompanyCodevalue;

			var ProcmtHubPurchasingOrg = this.byId(smartFormId).getGroups()[0].getGroupElements()[2].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcmtHubPurchasingOrgvalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[2].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcmtHubPurchasingOrg] = ProcmtHubPurchasingOrgvalue;

			var Plant = this.byId(smartFormId).getGroups()[0].getGroupElements()[3].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var Plantvalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[3].getElements()[0].getProperty(
				"value");
			changedAddDistFields[Plant] = Plantvalue;

			var PaymentTerms = this.byId(smartFormId).getGroups()[0].getGroupElements()[4].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PaymentTermsvalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[4].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PaymentTerms] = PaymentTermsvalue;

			var PurchasingDocVersionReasonCode = this.byId(smartFormId).getGroups()[0].getGroupElements()[5].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PurchasingDocVersionReasonCodevalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[5].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PurchasingDocVersionReasonCode] = PurchasingDocVersionReasonCodevalue;

			var PurgDocumentDistributionType = this.byId(smartFormId).getGroups()[1].getGroupElements()[0].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PurgDocumentDistributionTypevalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[0].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PurgDocumentDistributionType] = PurgDocumentDistributionTypevalue;

			var CntrlPurContrDistributionPct = this.byId(smartFormId).getGroups()[1].getGroupElements()[1].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var CntrlPurContrDistributionPctvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[1].getElements()[0].getProperty(
				"value");
			changedAddDistFields[CntrlPurContrDistributionPct] = CntrlPurContrDistributionPctvalue;

			var ProcmtHubPurchasingGroup = this.byId(smartFormId).getGroups()[1].getGroupElements()[2].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcmtHubPurchasingGroupvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[2].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcmtHubPurchasingGroup] = ProcmtHubPurchasingGroupvalue;

			var StorageLocation = this.byId(smartFormId).getGroups()[1].getGroupElements()[3].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var StorageLocationvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[3].getElements()[0].getProperty(
				"value");
			changedAddDistFields[StorageLocation] = StorageLocationvalue;

			var PurchasingInfoRecordUpdateCode = this.byId(smartFormId).getGroups()[1].getGroupElements()[4].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PurchasingInfoRecordUpdateCodevalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[4].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PurchasingInfoRecordUpdateCode] = PurchasingInfoRecordUpdateCodevalue;

			var PurgDocNoteText = this.byId(smartFormId).getGroups()[1].getGroupElements()[5].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PurgDocNoteTextvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[5].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PurgDocNoteText] = PurgDocNoteTextvalue;

			var ProcurementHubSourceSystem = this.byId(smartFormId).getGroups()[1].getGroupElements()[6].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcurementHubSourceSystemvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[6].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcurementHubSourceSystem] = ProcurementHubSourceSystemvalue;

			return changedAddDistFields;
		},
		getHCTRAddDistChangedFields: function (smartFormId) {
			var changedAddDistFields = {};
			this.MandateFieldChanged = [];
			this.ValueStateErrorFields = [];
			this.nonMandateFieldChanged = [];
			this.DocumentCategory = "";
			var ProcmtHubPurgDocItmCategory = this.byId(smartFormId).getGroups()[0].getGroupElements()[0].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcmtHubPurgDocItmCategoryvalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[0].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcmtHubPurgDocItmCategory] = ProcmtHubPurgDocItmCategoryvalue;

			var ProcmtHubCompanyCode = this.byId(smartFormId).getGroups()[0].getGroupElements()[1].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcmtHubCompanyCodevalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[1].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcmtHubCompanyCode] = ProcmtHubCompanyCodevalue;

			var ProcmtHubCompanyCodeGroupingID = this.byId(smartFormId).getGroups()[0].getGroupElements()[2].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcmtHubCompanyCodeGroupingIDvalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[2].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcmtHubCompanyCodeGroupingID] = ProcmtHubCompanyCodeGroupingIDvalue;

			var ProcmtHubPurchasingOrg = this.byId(smartFormId).getGroups()[0].getGroupElements()[3].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcmtHubPurchasingOrgvalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[3].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcmtHubPurchasingOrg] = ProcmtHubPurchasingOrgvalue;

			var Plant = this.byId(smartFormId).getGroups()[0].getGroupElements()[4].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var Plantvalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[4].getElements()[0].getProperty(
				"value");
			changedAddDistFields[Plant] = Plantvalue;

			var PaymentTerms = this.byId(smartFormId).getGroups()[0].getGroupElements()[5].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PaymentTermsvalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[5].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PaymentTerms] = PaymentTermsvalue;

			var PurchasingDocVersionReasonCode = this.byId(smartFormId).getGroups()[0].getGroupElements()[6].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PurchasingDocVersionReasonCodevalue = this.byId(smartFormId).getGroups()[0].getGroupElements()[6].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PurchasingDocVersionReasonCode] = PurchasingDocVersionReasonCodevalue;

			var PurchasingDocumentType = this.byId(smartFormId).getGroups()[1].getGroupElements()[0].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PurchasingDocumentTypevalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[0].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PurchasingDocumentType] = PurchasingDocumentTypevalue;

			var CntrlPurContrDistributionPct = this.byId(smartFormId).getGroups()[1].getGroupElements()[1].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var CntrlPurContrDistributionPctvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[1].getElements()[0].getProperty(
				"value");
			changedAddDistFields[CntrlPurContrDistributionPct] = CntrlPurContrDistributionPctvalue;

			var ProcmtHubPurchasingGroup = this.byId(smartFormId).getGroups()[1].getGroupElements()[2].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcmtHubPurchasingGroupvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[2].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcmtHubPurchasingGroup] = ProcmtHubPurchasingGroupvalue;

			var StorageLocation = this.byId(smartFormId).getGroups()[1].getGroupElements()[3].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var StorageLocationvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[3].getElements()[0].getProperty(
				"value");
			changedAddDistFields[StorageLocation] = StorageLocationvalue;

			var PurchasingInfoRecordUpdateCode = this.byId(smartFormId).getGroups()[1].getGroupElements()[4].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PurchasingInfoRecordUpdateCodevalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[4].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PurchasingInfoRecordUpdateCode] = PurchasingInfoRecordUpdateCodevalue;

			var PurgDocNoteText = this.byId(smartFormId).getGroups()[1].getGroupElements()[5].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var PurgDocNoteTextvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[5].getElements()[0].getProperty(
				"value");
			changedAddDistFields[PurgDocNoteText] = PurgDocNoteTextvalue;

			var ProcurementHubSourceSystem = this.byId(smartFormId).getGroups()[1].getGroupElements()[6].getElements()[0].getBindingInfo(
				"value").parts[0].path;
			var ProcurementHubSourceSystemvalue = this.byId(smartFormId).getGroups()[1].getGroupElements()[6].getElements()[0].getProperty(
				"value");
			changedAddDistFields[ProcurementHubSourceSystem] = ProcurementHubSourceSystemvalue;

			return changedAddDistFields;
		},

		//Creating a binding context for the dialog by creating an entry in the model, also setting the 0 as the default valye for distribution percentage
		onMetadataLoadedOfSetNewValueHeaderModel: function (oSetNewValuesDialog) {
			var oComponent = this.getOwnerComponent();
			var oSetNewValuesModel = oComponent.getModel();
			var oModelContext;
			if ((oSetNewValuesDialog && oSetNewValuesDialog.getId() ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--MassEditForm"
				)) {
				oModelContext = oSetNewValuesModel.createEntry("/C_PurCntrlContrItmMassUpdt", {
					groupId: "changes"
				});
				oSetNewValuesDialog.getContent()[1].setContexts([oModelContext]);
			} else if ((oSetNewValuesDialog && oSetNewValuesDialog.getId() ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--HrMassEditForm"
				)) {
				oModelContext = oSetNewValuesModel.createEntry("/C_CntrlPurContrHierItmMassUpdt", {
					groupId: "changes"
				});
				oSetNewValuesDialog.getContent()[1].setContexts([oModelContext]);
			} else if (oSetNewValuesDialog && oSetNewValuesDialog.getId() ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--AddHeaderDistribution"
			) {
				oModelContext = oSetNewValuesModel.createEntry("/C_CntrlPurContrHdrDistr", {
					groupId: "changes"
				});
				oSetNewValuesDialog.setBindingContext(oModelContext);
				this.getView().byId("CntrlPurContrDistributionPct").setValue(parseFloat(Number(0)).toFixed(3));
				this.getView().byId("CntrlPurContrDistributionPct").setValueState("None");
			} else if (oSetNewValuesDialog && oSetNewValuesDialog.getId() ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--AddItemDistribution"
			) {
				oModelContext = oSetNewValuesModel.createEntry("/C_CntrlPurContrItmDistr", {
					groupId: "changes"
				});
				oSetNewValuesDialog.setBindingContext(oModelContext);
				this.getView().byId("CntrlPurContrDistributionPct").setValue(parseFloat(Number(0)).toFixed(3));
				this.getView().byId("CntrlPurContrDistributionPct").setValueState("None");

			} else if (oSetNewValuesDialog && oSetNewValuesDialog.getId() ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--AddHCTRItemDistribution"
			) {
				oModelContext = oSetNewValuesModel.createEntry("/C_CPurConHierItmDistrMassUpdt", {
					groupId: "changes"
				});
				oSetNewValuesDialog.setBindingContext(oModelContext);
				this.getView().byId("CntrlPurContrDistributionPct").setValue(parseFloat(Number(0)).toFixed(3));
				this.getView().byId("CntrlPurContrDistributionPct").setValueState("None");

			} else if (oSetNewValuesDialog && oSetNewValuesDialog.getId() ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--AddHCTRHeaderDistribution"
			) {
				oModelContext = oSetNewValuesModel.createEntry("/C_CPurConHierHdrDistrMassUpdt", {
					groupId: "changes"
				});
				oSetNewValuesDialog.setBindingContext(oModelContext);
				this.getView().byId("CntrlPurContrDistributionPct").setValue(parseFloat(Number(0)).toFixed(3));
				this.getView().byId("CntrlPurContrDistributionPct").setValueState("None");

			}

		},

		//Add Header Distribution Ends Here

		//Canvas Page START here
		onItemDistributionLinkPress: function (oEvent) {
			var oExtensionAPI = this.extensionAPI;
			var oNavigationController = oExtensionAPI.getNavigationController();
			this.passSelectedItemKeysToCanvasPage();
			var itemKey = this.itemKeys;
			//itemkeys will have inclusion,exclusion and select all, along with filters in the form of string
			oNavigationController.navigateInternal(itemKey, {
				routeName: "to_DetailItem"
			});
		},
		onHierItemDistributionLinkPress: function (oEvent) {
			var oExtensionAPI = this.extensionAPI;
			var oNavigationController = oExtensionAPI.getNavigationController();
			this.passSelectedHierItemKeysToCanvasPage();
			var itemKey = this.itemKeys;
			//itemkeys will have inclusion,exclusion and select all, along with filters in the form of string
			oNavigationController.navigateInternal(itemKey, {
				routeName: "to_DetailHierItem"
			});
		},

		onHeaderDistributionLinkPress: function (oEvent) {
			var oExtensionAPI = this.extensionAPI;
			var oNavigationController = oExtensionAPI.getNavigationController();
			this.passSelectedHeaderKeysToCanvasPage();
			//itemkeys will have inclusion,exclusion and select all, along with filters in the form of string
			var itemKey = this.itemKeys;
			oNavigationController.navigateInternal(itemKey, {
				routeName: "to_Detail"
			});
		},

		onHierHeaderDistributionLinkPress: function (oEvent) {
			var oExtensionAPI = this.extensionAPI;
			var oNavigationController = oExtensionAPI.getNavigationController();
			this.passSelectedHierHeaderKeysToCanvasPage();
			//itemkeys will have inclusion,exclusion and select all, along with filters in the form of string
			var itemKey = this.itemKeys;
			oNavigationController.navigateInternal(itemKey, {
				routeName: "to_HierHeadDistr"
			});
		},

		passSelectedHeaderKeysToCanvasPage: function () {
			//filters are stingified and also contracts from inclusion or excluion are added to itemkeys string
			this.aFilter = [];
			this.itemKeys = "";
			this.strFilter = "";
			var aSelectedIndices = [];
			if (this.isInclusionTab1) {
				aSelectedIndices = this.inclusionArrayTab1;
				this.itemKeys = "EQ";
			} else if (this.isExclusionTab1) {
				aSelectedIndices = this.exclusionArrayTab1;
				this.itemKeys = "NE";
			} else if (this.isSelectAllTab1) {
				aSelectedIndices = "";
				this.itemKeys = "X";
			}
			var sEntityKey;
			this.oPGIBindingContextKeys = [];
			this.itemKeys = this.itemKeys.concat("*");
			this.itemKeys = this.itemKeys.concat(aSelectedIndices.length);
			for (var i = 0; i < aSelectedIndices.length; i++) {
				sEntityKey = aSelectedIndices[i];
				if (this.itemKeys === "") {
					this.itemKeys = sEntityKey;
				} else if (this.itemKeys !== "" && sEntityKey !== undefined) {
					this.itemKeys = this.itemKeys.concat("*");
					this.itemKeys = this.itemKeys.concat(sEntityKey);
				}
			}
			if (!this.isInclusionTab1) {
				var aDefFilters = this.getView().byId("listReportFilter").getFilters();
				if (aDefFilters.length > 0) {
					this.strFilter = JSON.stringify(aDefFilters);
					this.itemKeys = this.itemKeys.concat("*");
					this.itemKeys = this.itemKeys.concat(this.strFilter);
				}
			}
		},

		passSelectedHierHeaderKeysToCanvasPage: function () {
			//filters are stingified and also contracts from inclusion or excluion are added to itemkeys string
			this.aFilter = [];
			this.itemKeys = "";
			this.strFilter = "";
			var aSelectedIndices = [];
			if (this.isInclusionTab3) {
				aSelectedIndices = this.inclusionArrayTab3;
				this.itemKeys = "EQ";
			} else if (this.isExclusionTab3) {
				aSelectedIndices = this.exclusionArrayTab3;
				this.itemKeys = "NE";
			} else if (this.isSelectAllTab3) {
				aSelectedIndices = "";
				this.itemKeys = "X";
			}
			var sEntityKey;
			this.oPGIBindingContextKeys = [];
			this.itemKeys = this.itemKeys.concat("*");
			this.itemKeys = this.itemKeys.concat(aSelectedIndices.length);
			for (var i = 0; i < aSelectedIndices.length; i++) {
				sEntityKey = aSelectedIndices[i];
				if (this.itemKeys === "") {
					this.itemKeys = sEntityKey;
				} else if (this.itemKeys !== "" && sEntityKey !== undefined) {
					this.itemKeys = this.itemKeys.concat("*");
					this.itemKeys = this.itemKeys.concat(sEntityKey);
				}
			}
			if (!this.isInclusionTab3) {
				var aDefFilters = this.getView().byId("listReportFilter").getFilters();
				if (aDefFilters.length > 0) {
					this.strFilter = JSON.stringify(aDefFilters);
					this.itemKeys = this.itemKeys.concat("*");
					this.itemKeys = this.itemKeys.concat(this.strFilter);
				}
			}
		},

		passSelectedItemKeysToCanvasPage: function () {
			//filters are stingified and also contract items from inclusion or excluion are added to itemkeys string
			this.aFilter = [];
			this.itemKeys = "";
			this.strFilter = "";
			var aSelectedIndices = [];
			if (this.isInclusionTab2) {
				aSelectedIndices = this.inclusionArrayTab2;
				this.itemKeys = "EQ";
			} else if (this.isExclusionTab2) {
				aSelectedIndices = this.exclusionArrayTab2;
				this.itemKeys = "NE";
			} else if (this.isSelectAllTab2) {
				aSelectedIndices = "";
				this.itemKeys = "X";
			}
			var sEntityKey;
			this.oPGIBindingContextKeys = [];
			this.itemKeys = this.itemKeys.concat("*");
			this.itemKeys = this.itemKeys.concat(aSelectedIndices.length);
			for (var i = 0; i < aSelectedIndices.length; i++) {
				sEntityKey = aSelectedIndices[i];
				if (this.itemKeys === "") {
					this.itemKeys = sEntityKey;
				} else if (this.itemKeys !== "" && sEntityKey !== undefined) {
					this.itemKeys = this.itemKeys.concat("*");
					this.itemKeys = this.itemKeys.concat(sEntityKey);
				}
			}
			if (!this.isInclusionTab2) {
				var aDefFilters = this.getView().byId("listReportFilter").getFilters();
				if (aDefFilters.length > 0) {
					this.strFilter = JSON.stringify(aDefFilters);
					this.itemKeys = this.itemKeys.concat("*");
					this.itemKeys = this.itemKeys.concat(this.strFilter);
				}
			}
			this.itemKeys = this.itemKeys.replace(/\//g, "#");
		},
		passSelectedHierItemKeysToCanvasPage: function () {
			//filters are stingified and also contract items from inclusion or excluion are added to itemkeys string
			this.aFilter = [];
			this.itemKeys = "";
			this.strFilter = "";
			var aSelectedIndices = [];
			if (this.isInclusionTab4) {
				aSelectedIndices = this.inclusionArrayTab4;
				this.itemKeys = "EQ";
			} else if (this.isExclusionTab4) {
				aSelectedIndices = this.exclusionArrayTab4;
				this.itemKeys = "NE";
			} else if (this.isSelectAllTab4) {
				aSelectedIndices = "";
				this.itemKeys = "X";
			}
			var sEntityKey;
			this.oPGIBindingContextKeys = [];
			this.itemKeys = this.itemKeys.concat("*");
			this.itemKeys = this.itemKeys.concat(aSelectedIndices.length);
			for (var i = 0; i < aSelectedIndices.length; i++) {
				sEntityKey = aSelectedIndices[i];
				if (this.itemKeys === "") {
					this.itemKeys = sEntityKey;
				} else if (this.itemKeys !== "" && sEntityKey !== undefined) {
					this.itemKeys = this.itemKeys.concat("*");
					this.itemKeys = this.itemKeys.concat(sEntityKey);
				}
			}
			if (!this.isInclusionTab4) {
				var aDefFilters = this.getView().byId("listReportFilter").getFilters();
				if (aDefFilters.length > 0) {
					this.strFilter = JSON.stringify(aDefFilters);
					this.itemKeys = this.itemKeys.concat("*");
					this.itemKeys = this.itemKeys.concat(this.strFilter);
				}
			}
			this.itemKeys = this.itemKeys.replace(/\//g, "#");
		},
		//canvas page method END here
		OnPressHierCentralLink: function (oEvent) {
			var vCentralPurchaseContract = oEvent.getSource().getBindingContext().getObject().CentralPurchaseContract;
			var vComplete_url = window.location.href;
			var vUrlParts = vComplete_url.indexOf("#CentralPurchaseContract");
			var vRequiredURL = vComplete_url.slice(0, vUrlParts);
			var vSemanticObjandAction = "#CentralPurchaseContract-manage&/C_CntrlPurContrHierHdrTP";
			var vDraftContractHierarchy = "(CentralPurchaseContract='" + vCentralPurchaseContract +
				"',DraftUUID=guid'00000000-0000-0000-0000-000000000000";
			var vActiveEntity = "',IsActiveEntity=true)";
			vRequiredURL = (vRequiredURL + vSemanticObjandAction + vDraftContractHierarchy + vActiveEntity);
			sap.m.URLHelper.redirect(vRequiredURL, false);

		},
		OnPressHierCentralItemLink: function (oEvent) {
			var vCentralPurchaseContract = oEvent.getSource().getBindingContext().getObject().CentralPurchaseContract;
			var vCentralPurchaseContractItem = oEvent.getSource().getBindingContext().getObject().CentralPurchaseContractItem;
			var vComplete_urlItem = window.location.href;
			var vUrlPartsitem = vComplete_urlItem.indexOf("#CentralPurchaseContract");
			var vRequiredURLItem = vComplete_urlItem.slice(0, vUrlPartsitem);
			var vSemanticObjandActionItem = "#CentralPurchaseContract-manage&/C_CntrlPurContrHierHdrTP";
			var vDraftContractHierarchyItem = "(CentralPurchaseContract='" + vCentralPurchaseContract +
				"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)/to_CntrlPurchaseContractItemTP(CentralPurchaseContractItem='" +
				vCentralPurchaseContractItem + "',CentralPurchaseContract='" + vCentralPurchaseContract +
				"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)";
			vRequiredURLItem = (vRequiredURLItem + vSemanticObjandActionItem + vDraftContractHierarchyItem);
			sap.m.URLHelper.redirect(vRequiredURLItem, false);

		},
		//Begin of new functions introduced for HCTR Mass Edit Feature---

		onPressHCTRRestoreButton: function (oEvent) {
			this.resetSetNewValuesForm("HrMassEditForm-item--Form", "HrMassEditForm");
			this.getView().byId("HrMassEditForm").getModel().resetChanges();
		},

		onPressHCTRCancelButton: function (oEvent) {
			var oSource = oEvent.getSource().getParent().getId();
			if (oSource ===
				"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--HrMassEditForm"
			) {
				this.onMassEditDialogClose("HrMassEditForm");
			}
			oEvent.getSource().getParent().close();
			oEvent.getSource().getParent().destroy();
			this.oHeaderDistributionFilters = [];
			this.oItemDistributionFilters = [];
		},

		onHCtrSmartFormCheck: function (oEvent) {
			var fieldId = oEvent.getParameter("id");
			var changedFieldPosition = this.getNewChangedFieldPosition(this.massEditChangeFields, fieldId);
			var changedField;
			if (oEvent.getSource().getSelectedItem().getProperty("key") !== "keep") {
				if (changedFieldPosition === undefined) {
					changedField = {
						fieldId: fieldId
					};
					this.massEditChangeFields.push(changedField);
				}
			} else {
				if (changedFieldPosition !== undefined) {
					this.massEditChangeFields.splice(changedFieldPosition, 1);
				}
			}
			//Condition for Restore Button
			if (this.massEditChangeFields.length > 0) {
				this.getView().byId("HrMassEditForm").getParent().byId("restoreButton").setEnabled(true);
				if (this.getView().byId("PurgDocNoteTextFld-SmartField-input").getValue().length <= 5000) {
					this.getView().byId("HrMassEditForm").getParent().byId("applyChangesButton").setEnabled(true);
					this.getView().byId("HrMassEditForm").getParent().byId("simulateJobButton").setEnabled(true);
				} else {
					this.getView().byId("HrMassEditForm").getParent().byId("applyChangesButton").setEnabled(false);
					this.getView().byId("HrMassEditForm").getParent().byId("simulateJobButton").setEnabled(false);
				}
			} else {
				this.getView().byId("HrMassEditForm").getParent().byId("restoreButton").setEnabled(false);
				this.getView().byId("HrMassEditForm").getParent().byId("applyChangesButton").setEnabled(false);
				this.getView().byId("HrMassEditForm").getParent().byId("simulateJobButton").setEnabled(false);
			}
		},

		onPressHCTRApplyChangesButton: function (oEvent) {

				var oMultiEditContainer = this.getView().byId("HrMassEditForm").getContent()[1];
				var oPromise = oMultiEditContainer.getErroneousFieldsAndTokens();
				var that = this;
				if (oEvent.getSource().getId() ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.ListReport.view.ListReport::C_PurCntrlContrItmMassUpdt--simulateJobButton"
				) {
					this.isSimulation = true;
				} else {
					this.isSimulation = false;
				}
				oPromise.then(function (data) {
					that._fnFindErrors(data);
				}, function (err) {
					jQuery.sap.log.info("FYI:" + err);
				});
			}
			//End of HCTR Mass Edit Changes
	});
});