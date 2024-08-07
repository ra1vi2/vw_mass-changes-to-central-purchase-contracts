/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
		"sap/ui/generic/app/navigation/service/NavigationHandler",
		"sap/ui/model/Filter",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/FilterOperator",
		"ui/s2p/mm/cntrl/ctrmass/update/HierarchyHeaderDistribution/model/formatter",
		"sap/m/MessageBox",
		"sap/ui/core/routing/History"
	],

	function (NavigationHandler, Filter, JSONModel, FilterOperator, formatter, MessageBox, History) {
		"use strict";
		this.oHeaderDistributionFilters = [];

		return sap.ui.controller("ui.s2p.mm.cntrl.ctrmass.update.HierarchyHeaderDistribution.controller.HeaderDistribution", {
			formatter: formatter,
			AffectedContractsOnAddHdrDist: [],
			AffectedContractsHdrDistCount: undefined,

			onInit: function () {
				var that = this;
				var oComponent = this.getOwnerComponent();
				var oComponentModel = oComponent.getComponentModel();
				oComponentModel.setProperty("/View", this.getView());
				this.newData = [];
				this.validationErrFields = [];
				this.smartFieldChanged = [];
				this.nonMandateFieldChanged = [];
				//holds the combination of changed contract and distribution
				this.changedContract = [];
				this.updateContracts = [];
				this.getView().byId("HierHdrDistTable").attachDataReceived(null,
					function (oEvt) {
						if (oEvt && oEvt.getParameters() && oEvt.getParameters().getParameters() && oEvt.getParameters().getParameters().data &&
							oEvt.getParameters().getParameters().data.results) {
							var dataCount = oEvt.getParameters().getParameters().data.results.length;
						}
						if (dataCount <= 0) {
							that.getView().byId("EditHierHdrDist").setEnabled(false);

						} else {
							that.getView().byId("EditHierHdrDist").setEnabled(true);

						}
					});

			},
			
			// Simulate option using Feature Toggle
			enableSimulationFeature: function () {
				this.getView().byId("HierHdrSimulateBtn").setVisible(true);
/*				var p = sap.s4h.cfnd.featuretoggle.lib.featuresAsync();
				p.then(function (features) {
						this.SimulateToggleStatus = features.getFeatureStatus("MM_PUR_MASS_UPDATE_HCTR");
						if (this.SimulateToggleStatus === true) {
							this.getView().byId("HierHdrSimulateBtn").setVisible(true);
						}
					}.bind(this))
					.catch(function (oError) {
						// Promise has been rejected since Service is unavailable
						// console.log("An Error occurred, unable to load the feature toggle status");
					}.bind(this));*/
			},			

			HeaderfilterBarSearch: function (oEvent) {
				var sQuery, oCentralContractFilter;
				this.oHeaderDistributionFilters = [];
				var oComponent = this.getOwnerComponent();
				var oComponentModel = oComponent.getComponentModel();
				var oSearchField = this.getView().byId("HierHeaderSearchFld");
				sQuery = oSearchField.getValue();
				if (oEvent.getId() === "search") {
					sQuery = oEvent.getParameter("query");
				}
				if (sQuery !== undefined && sQuery !== null && sQuery.length > 0) {
					oCentralContractFilter = new Filter({
						//search done on active purchasing doument instead of centrla purchase contract
						path: "ActivePurchasingDocument",
						operator: FilterOperator.Contains,
						value1: sQuery,
						bAnd: true
					});
					this.oHeaderDistributionFilters.push(oCentralContractFilter);
					oComponentModel.setProperty("/searchFlag", true);
				} else {
					oComponentModel.setProperty("/searchFlag", false);
				}
				this.getView().byId("HierHdrDistTable").rebindTable();
			},

			handleFilters: function () {
				// the obtained itemkeys from the list report are parsed to form the filter object
				var oComponent = this.getOwnerComponent();
				var smrtDistTable = this.getView().byId("HierHdrDistTable");
				var oComponentModel = oComponent.getComponentModel();
				if (oComponentModel.getProperty("/searchFlag") === false && oComponentModel.getProperty("/searchFlag") !== undefined) {
					smrtDistTable.getToolbar().getAggregation("content")[2].setProperty("value", "");
					this.oHeaderDistributionFilters = {};
				}
				this.ahdrDistFilt = [];
				var aGlobalFilter = [];
				var Operator = this.itemKeys[0];
				var pos = parseInt(this.itemKeys[1]) + 1;
				if (this.itemKeys.length > pos + 1) {
					aGlobalFilter = JSON.parse(this.itemKeys[pos + 1]);
				}
				if (Operator === "NE") {
					var exclusionFilter = new Filter({
						filters: [],
						and: true
					});
					for (var j = 2; j <= pos; j++) {
						//constructing the exclsuion filter for Active Purchasing document
						exclusionFilter.aFilters.push(new Filter("ActivePurchasingDocument", "NE", this.itemKeys[j], true));
					}
					this.ahdrDistFilt = new Filter(aGlobalFilter, true);
					this.ahdrDistFilt = this.ahdrDistFilt.aFilters;
					this.ahdrDistFilt.push(exclusionFilter);
					if (this.oHeaderDistributionFilters && this.oHeaderDistributionFilters.length > 0) {

						this.ahdrDistFilt.push(this.oHeaderDistributionFilters[0]);

					}
					//            oBindingParams.filters = this.ahdrDistFilt;
					//constructing the inclusion filter for Active Purchasing document
				} else if (Operator === "EQ") {
					for (var index = 2; index <= pos; index++) {
						var cntrlCtr = this.itemKeys[index];
						var cntrlCtrFilter = new sap.ui.model.Filter({
							path: "ActivePurchasingDocument",
							operator: Operator,
							value1: cntrlCtr
						});
						this.ahdrDistFilt.push(cntrlCtrFilter);
					}
					if (this.oHeaderDistributionFilters && this.oHeaderDistributionFilters.length > 0) {

						var ahdrSearchFilt = new Filter(this.oHeaderDistributionFilters, true);
						this.ahdrDistFilt.push(ahdrSearchFilt);

					}
					// if (this.ahdrDistFilt !== null) {
					//            //            oBindingParams.filters = this.ahdrDistFilt;
					// }
				} else if (Operator === "X") {
					if (aGlobalFilter.length > 0) {
						this.ahdrDistFilt = new Filter(aGlobalFilter, true);
						this.ahdrDistFilt = this.ahdrDistFilt.aFilters;
					}

					if (this.oHeaderDistributionFilters && this.oHeaderDistributionFilters.length > 0) {
						this.ahdrDistFilt.push(this.oHeaderDistributionFilters[0]);
					}
					//            oBindingParams.filters = this.ahdrDistFilt;
				}
				return this.ahdrDistFilt;
			},

			onBeforeDocumentsTableRebind: function (oEvent) {
				var that = this;
				var oView = this.getView();
				var mDistTable = this.getView().byId("HierHdrDistMTable");
				var smrtDistTable = this.getView().byId("HierHdrDistTable");
				var oBindingParams = oEvent.getParameter("bindingParams");
				var oSorter = oBindingParams.sorter[0];
				this.deriveItemKeys();
				oBindingParams.filters = this.handleFilters();
				this.aPGISorters = [];
				this.oBundleText = oView.getModel("i18n").getResourceBundle();
				this.mGroupFunctions = {
					//grouping data on active purchasing document
					ActivePurchasingDocument: function (oContext) {
						var cntrlCtrNumber = oContext.getProperty("ActivePurchasingDocument");
						var distType = oContext.getProperty("CntrlPurContrFlxblDistrIsAllwd");
						var FlexCntrCtrText = that.oBundleText.getText("FlexibleContracts");
						var CntrlPurchaseCtrText = that.oBundleText.getText("CentralPurchaseContract");
						if (distType) {
							return {
								key: cntrlCtrNumber,
								text: CntrlPurchaseCtrText + ": " + cntrlCtrNumber + " " + FlexCntrCtrText
							};
						} else {
							return {
								key: cntrlCtrNumber,
								text: CntrlPurchaseCtrText + ": " + cntrlCtrNumber
							};
						}
					}
				};
				if (!oSorter) {
					oSorter = new sap.ui.model.Sorter("ActivePurchasingDocument", false, true);
					oSorter.fnGroup = this.mGroupFunctions[oSorter.sPath].bind(that);
					this.aPGISorters.push(oSorter);
					oBindingParams.sorter = oBindingParams.sorter.concat(this.aPGISorters);
				}
				mDistTable.setVisible(false);
				smrtDistTable.setVisible(true);
				this.getView().byId("HierHdrCancelBtn").setEnabled(false);
				this.getView().byId("HierHdrApplyBtn").setEnabled(false);
				this.getView().byId("HierHdrSimulateBtn").setEnabled(false);
				this.getView().byId("HierHdrResetBtn").setEnabled(false);
				this.enableSimulationFeature();
			},

			deriveItemKeys: function (oEvent) {
				//itemskeys is split based on * in order to extract the filters and incluion or exclsuion contracts which will futher be parsed in
				//handleFilters function
				//            this.hdrDistFilt = [];
				var oComponent = this.getOwnerComponent();
				var oComponentModel = oComponent.getComponentModel();
				this.itemKeys = oComponentModel.getProperty("/itemKeys");
				if (this.itemKeys !== undefined) {
					this.itemKeys = this.itemKeys.split("*");
				}
				// if (this.itemKeys !== undefined) {
				//            for (var index = 0; index < this.itemKeys.length; index++) {
				//                           this.hdrDistFilt.push(this.itemKeys[index]);
				//            }
				// }
			},

			editHdrDist: function (oEvent) {
				//the obtained data from the read call is converted to json model 
				var dataArray = [];
				if (this.getView().getModel("HdrDistModel") !== undefined) {
					this.getView().getModel("HdrDistModel").setData({
						modelData: dataArray
					});
				}
				var that = this;
				var oView = this.getView();
				this.oBundleText = oView.getModel("i18n").getResourceBundle();
				var oPGISmartRespTable = this.getView().byId("HierHdrDistTable");
				var mDistTable = this.getView().byId("HierHdrDistMTable");
				var Header = that.oBundleText.getText("HeaderDistribution") + " (" + oPGISmartRespTable._getRowCount() + ")";
				mDistTable.getExtension()[0].getAggregation("content")[0].getAggregation("content")[2].setEnabled(false);
				var searchFilterValue = oPGISmartRespTable.getAggregation("items")[0].getAggregation("content")[2].getProperty("value");
				mDistTable.getExtension()[0].getAggregation("content")[0].getAggregation("content")[2].setValue(searchFilterValue);
				this.getView().byId("EditHierHdrDistMtable").setEnabled(false);
				// mDistTable.getAggregation("headerToolbar").getAggregation("content")[0].setProperty("text", Header);
				// var searchFilterValue = oPGISmartRespTable.getAggregation("items")[0].getAggregation("content")[2].getProperty("value");
				// mDistTable.getAggregation("headerToolbar").getAggregation("content")[2].setProperty("value", searchFilterValue);
				// mDistTable.getAggregation("headerToolbar").getAggregation("content")[2].setEnabled(false);
				oPGISmartRespTable.setVisible(false);
				mDistTable.setVisible(true);
				mDistTable.getColumns()[2].attachEvent(that.formatter.fndecimalLocalized(""));
				//            mDistTable.setProperty("headerText", Header);
				mDistTable.attachRowsUpdated(null,
					function (oEvt) {
						mDistTable.focus();
					});
				this.getView().byId("HierHdrCancelBtn").setEnabled(true);
				var sUrl = "/C_CPurConHierHdrDistrMassUpdt";
				var odataModel = this.getOwnerComponent().getModel();
				sap.ui.core.BusyIndicator.show();
				odataModel.read(sUrl, {
					filters: this.ahdrDistFilt,
					//sorting the data on activepurchasing document in the grid table
					sorters: [new sap.ui.model.Sorter("ActivePurchasingDocument", false, false)],
					success: function (oData) {
						// data obtained from addTotalRow function has total row added for each contracts
						that.newData = that.addTotalRow(oData);
						var oHdrDistModel = new JSONModel();
						oHdrDistModel.setData({
							modelData: that.newData
						});
						that.getView().setModel(oHdrDistModel, "HdrDistModel");
						mDistTable.getExtension()[0].getAggregation("content")[0].getAggregation("content")[0].setText(Header);
						if (that.newData.length < 10) {
							mDistTable.setVisibleRowCountMode("Fixed");
							mDistTable.setVisibleRowCount(that.newData.length);
						} else {
							mDistTable.setVisibleRowCountMode("Auto");
						}
						//grouping data on active purchasing document in grid table
						that.mGroupFunctions = {
							ActivePurchasingDocument: function (oContext) {
								var CentrlCtrNumber = oContext.getProperty("ActivePurchasingDocument");
								var distType = oContext.getProperty("CntrlPurContrFlxblDistrIsAllwd");
								var FlexCtrText = that.oBundleText.getText("FlexibleContracts");
								var CntrlPurchaseCtrText = that.oBundleText.getText("CentralPurchaseContract");
								if (distType) {
									return {
										key: CentrlCtrNumber,
										text: CntrlPurchaseCtrText + ": " + CentrlCtrNumber + " " + FlexCtrText

									};
								} else {
									return {
										key: CentrlCtrNumber,
										text: CntrlPurchaseCtrText + ": " + CentrlCtrNumber
									};
								}
							}
						};
						var oSorter = new sap.ui.model.Sorter("ActivePurchasingDocument", false, true);
						oSorter.fnGroup = that.mGroupFunctions[
							oSorter.sPath].bind(that);
						mDistTable.getBinding("rows").sort(oSorter);

						sap.ui.core.BusyIndicator.hide();
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
					}
				});
			},

			onChange: function (oEvent) {
				//triggerred when value in the input field for ditribution percentage is changed
				var decimalNotation = sap.ui.core.format.NumberFormat.getFloatInstance();
				// get the user locale -->decimal separator
				var decimalSeperator = decimalNotation.oFormatOptions.decimalSeparator;
				var inputVal, ContractIndex;
				var oView = this.getView();
				this.oBundleText = oView.getModel("i18n").getResourceBundle();
				inputVal = oEvent.getParameter("newValue");
				var checkVal = inputVal;
				var totalcount = 0;
				var deltaCount = 0;
				var valueWithDecimalAppended;
				// var m=oEvent.getSource().getParent()._getPropertiesToPropagate().oBindingContexts.HdrDistModel.sPath;
				var regExpCom = /^[0-9]{0,3}(\,[0-9]{0,3})?$/;
				var regExpDot = /^[0-9]{0,3}(\.[0-9]{0,3})?$/;
				if (regExpCom.test(checkVal) || regExpDot.test(checkVal)) {
					//replace "," with "." so that the value can be converted to float and used for further validation
					inputVal = inputVal.replace(",", ".");
					if (inputVal !== "" && parseFloat(inputVal) <= 100) {
						valueWithDecimalAppended = parseFloat(inputVal).toFixed(3);
						this.getView().byId("HierHdrApplyBtn").setEnabled(false);
						this.getView().byId("HierHdrSimulateBtn").setEnabled(false);
						this.getView().byId("HierHdrResetBtn").setEnabled(true);
						var changedIndex = oEvent.getSource().getParent().getParent().getParent().getIndex();
						// parseInt(oEvent.getSource().getParent()._getPropertiesToPropagate()["oBindingContexts"].HdrDistModel.sPath.split(
						// 	"/")[
						// 	2]);
						// if the decimal separator was "." and user enters "," as the decimal separator then "," is replaced by "."
						if ((decimalSeperator === "." && checkVal.indexOf(",") > 0) || decimalSeperator === ".") {
							this.newData[changedIndex].CntrlPurContrDistributionPct = valueWithDecimalAppended;
						}
						// if the decimal separator was "," and user enters "." as the decimal separator then "." is replaced by ","
						else if ((decimalSeperator === "," && checkVal.indexOf(".") > 0) || decimalSeperator === ",") {
							this.newData[changedIndex].CntrlPurContrDistributionPct = valueWithDecimalAppended.replace(".", ",");
						}

						var changedContract = this.newData[changedIndex].CentralPurchaseContract;
						var changedDistribution = this.newData[changedIndex].PurgDocItemDistributionKey;
						var changedctrDist = changedContract + "*" + changedDistribution;
						var changedPercentage = parseFloat(inputVal) - parseFloat(this.newData[
							changedIndex].CntrlPurContrItmDistrPct);
						this.newData[changedIndex].CntrlPurContrGRConsumptionPct = changedPercentage;

						//Code to dirty the odata model to get warning pop-up when user clicks on back without saving the changes
						var changeString = "/C_CPurConHierHdrDistrMassUpdt(CentralPurchaseContract='" + changedContract +
							"',PurgDocItemDistributionKey='" +
							changedDistribution + "')";
						var oTable = this.getView().byId("HierHdrDistMTable");
						var myprop = oTable.getModel().getProperty(changeString);
						oTable.getModel().setProperty(myprop.CntrlPurContrDistributionPct, "60", oTable.getModel().mContexts[changeString]);
						if (this.changedContract.indexOf(changedctrDist) === -1) {
							this.changedContract.push(changedctrDist.replace("%20", " "));
							this.getView().byId("HierHdrApplyBtn").setEnabled(true);
							this.getView().byId("HierHdrSimulateBtn").setEnabled(true);
						} else {
							this.getView().byId("HierHdrApplyBtn").setEnabled(true);
							this.getView().byId("HierHdrSimulateBtn").setEnabled(true);
							if (parseFloat(inputVal) === parseFloat(this.newData[changedIndex].CntrlPurContrItmDistrPct)) {
								var sameindex = this.changedContract.indexOf(changedctrDist);
								this.changedContract.splice(sameindex, 1);
							}
						}
						for (var i = 0; i < this.newData.length; i++) {
							if (this.newData[i].hasOwnProperty("__metadata") === true) {
								if (this.newData[i].CentralPurchaseContract === changedContract) {
									ContractIndex = i;
									break;
								}
							}
						}
						for (var j = i; j < this.newData.length; j++) {
							if (this.newData[j].hasOwnProperty("__metadata")) {

								var distPercent;
								if (decimalSeperator === ",") {
									distPercent = this.newData[j].CntrlPurContrDistributionPct.replace(".", "");
									distPercent = distPercent.replace(",", ".");
								} else {
									distPercent = parseFloat(this.newData[j].CntrlPurContrDistributionPct).toFixed(3);
								}
								// this.newData[j].CntrlPurContrDistributionPct = parseFloat(this.newData[j].CntrlPurContrDistributionPct).toFixed(3);
								var temp = distPercent;
								if (isNaN(distPercent)) {
									this.newData[j].CntrlPurContrDistributionPct = "";
									temp = 0;
									this.newData[j].CntrlPurContrGRConsumptionPct = 0 - this.newData[j].CntrlPurContrItmDistrPct;
								}
								//            totalcount = totalcount + parseFloat(this.newData[j].CntrlPurContrDistributionPct);
								totalcount = totalcount + parseFloat(temp);
								deltaCount = deltaCount + parseFloat(this.newData[j].CntrlPurContrGRConsumptionPct);
							} else {
								break;
							}
						}
						totalcount = parseFloat(totalcount).toFixed(3);
						this.newData[j].CntrlPurContrDistributionPct = totalcount;
						this.newData[j].CntrlPurContrGRConsumptionPct = deltaCount;

						for (var index = 0; index < this.newData.length; index++) {
							if (this.newData[index].hasOwnProperty("__metadata") === true) {
								if (parseInt(this.newData[index].CntrlPurContrDistributionPct) === parseInt(this.newData[index].CntrlPurContrItmDistrPct)) {
									this.getView().byId("HierHdrApplyBtn").setEnabled(false);
									this.getView().byId("HierHdrSimulateBtn").setEnabled(false);
									this.getView().byId("HierHdrResetBtn").setEnabled(false);
								} else {
									this.getView().byId("HierHdrApplyBtn").setEnabled(true);
									this.getView().byId("HierHdrSimulateBtn").setEnabled(true);
									this.getView().byId("HierHdrResetBtn").setEnabled(true);
									break;
								}
							}
						}
						if (this.getView().byId("HierHdrApplyBtn").getEnabled() === true || this.getView().byId("HierHdrSimulateBtn").getEnabled() ===
							true) {
							for (var i = 0; i < this.newData.length; i++) {
								if (this.newData[i].hasOwnProperty("__metadata") === false) {
									if (isNaN(this.newData[i].CntrlPurContrDistributionPct)) {
										this.newData[i].CntrlPurContrDistributionPct = 0;
									}
									if (
										(this.newData[i].CntrlPurContrFlxblDistrIsAllwd === false || this.newData[i].CntrlPurContrFlxblDistrIsAllwd === "") &&
										parseFloat(this.newData[i].CntrlPurContrGRConsumptionPct) !== 0) {
										this.getView().byId("HierHdrApplyBtn").setEnabled(false);
										this.getView().byId("HierHdrSimulateBtn").setEnabled(false);
										break;
									} else {
										this.getView().byId("HierHdrApplyBtn").setEnabled(true);
										this.getView().byId("HierHdrSimulateBtn").setEnabled(true);
									}
								}
							}
						}
						// if (this.changedContract < 1)
						//                this.getView().byId("HierHdrApplyBtn").setEnabled(false);
						if (!this.getView().byId("HierHdrResetBtn").getEnabled()) {
							this.getView().byId("HierHdrDistMTable").getModel().resetChanges();
						}
					} else {
						this.getView().byId("HierHdrApplyBtn").setEnabled(false);
						this.getView().byId("HierHdrSimulateBtn").setEnabled(false);
						this.getView().byId("HierHdrResetBtn").setEnabled(true);
					}

				} else {
					this.getView().byId("HierHdrApplyBtn").setEnabled(false);
					this.getView().byId("HierHdrSimulateBtn").setEnabled(false);
					this.getView().byId("HierHdrResetBtn").setEnabled(true);
				}
				var tablelength = this.getView().byId("HierHdrDistMTable").getBindingInfo("rows").binding.oList.length;
				for (var tabindex = 0; tabindex < tablelength; tabindex++) {
					if (this.getView().byId("HierHdrDistMTable").getBindingInfo("rows").binding.oList[tabindex].GroupHeaderReference !== 1 && this.getView()
						.byId("HierHdrDistMTable").getBindingInfo("rows").binding.oList[tabindex].ReferenceHeaderDistributionKey !== -1) {
						if (this.getView().byId("HierHdrDistMTable").getBindingInfo("rows").binding.oList[tabindex].CntrlPurContrDistributionPct > 100 ||
							this.getView().byId("HierHdrDistMTable").getBindingInfo("rows").binding.oList[tabindex].CntrlPurContrDistributionPct === "") {
							this.getView().byId("HierHdrApplyBtn").setEnabled(false);
							this.getView().byId("HierHdrSimulateBtn").setEnabled(false);
							break;
						}
					}
				}
			},

			addTotalRow: function (data) {
				//a new row is added in the model for each contract which will have aggregation of distribution percentage
				var index;
				this.newData = [];
				var oView = this.getView();
				this.oBundleText = oView.getModel("i18n").getResourceBundle();
				var that = this;
				// var nonflexText = that.oBundleText.getText("nonflexText");
				var nlength = data.results.length;
				var totalcount = parseFloat(data.results[0].CntrlPurContrDistributionPct);
				var currentContract = data.results[0].ActivePurchasingDocument;
				var flexibleIndicator = data.results[0].CntrlPurContrFlxblDistrIsAllwd;
				var oldDistributionPct = data.results[0].CntrlPurContrItmDistrPct;
				var diffdistPct = data.results[0].CntrlPurContrGRConsumptionPct;
				var ReferenceHeaderDistributionKey = -1;

				var GroupHeaderReference = 1;
				var HeaderText;
				if (data.results[0].CntrlPurContrFlxblDistrIsAllwd) {
					HeaderText = currentContract + " (Flexible Contract)";
				} else {
					HeaderText = currentContract;
				}

				var oNewObject = {
					ActivePurchasingDocument: currentContract,
					GroupHeaderReference: GroupHeaderReference,
					CntrlPurContrDistributionPct: 0,
					CntrlPurContrItmDistrPct: 0,
					CntrlPurContrGRConsumptionPct: 0,
					HeaderText: HeaderText
				};
				that.newData.push(oNewObject);
				that.newData[1] = data.results[0];
				// localization of the percentage using formatter
				that.newData[1].CntrlPurContrDistributionPct = that.formatter.fndecimalLocalized(that.newData[1].CntrlPurContrDistributionPct);
				var totalIndex;

				for (var i = 1; i < nlength; i++) {
					var contract = data.results[i].ActivePurchasingDocument;
					var currentdist = data.results[i].CntrlPurContrFlxblDistrIsAllwd;
					var olddist = data.results[i].CntrlPurContrItmDistrPct;
					var diffdist = data.results[i].CntrlPurContrGRConsumptionPct;
					if (currentContract === contract) {
						index = that.newData.push(data.results[i]);
						that.newData[index - 1].CntrlPurContrDistributionPct = that.formatter.fndecimalLocalized(that.newData[index - 1].CntrlPurContrDistributionPct);
						totalcount = totalcount + parseFloat(data.results[i].CntrlPurContrDistributionPct);
					} else {
						oNewObject = {
							ActivePurchasingDocument: currentContract,
							//               ProcmtHubPurgDocItmCategory: nonflexText,
							CntrlPurContrDistributionPct: parseFloat(totalcount).toFixed(3),
							CntrlPurContrFlxblDistrIsAllwd: flexibleIndicator,
							CntrlPurContrItmDistrPct: parseFloat(totalcount).toFixed(3),
							CntrlPurContrGRConsumptionPct: diffdistPct,
							ReferenceHeaderDistributionKey: ReferenceHeaderDistributionKey
						};
						totalIndex = that.newData.push(oNewObject);

						if (data.results[i].CntrlPurContrFlxblDistrIsAllwd) {
							HeaderText = data.results[i].ActivePurchasingDocument + " (Flexible Contract)";
						} else {
							HeaderText = data.results[i].ActivePurchasingDocument;
						}
						oNewObject = {
							ActivePurchasingDocument: data.results[i].ActivePurchasingDocument,
							GroupHeaderReference: GroupHeaderReference,
							CntrlPurContrDistributionPct: 0,
							CntrlPurContrItmDistrPct: 0,
							CntrlPurContrGRConsumptionPct: 0,
							HeaderText: HeaderText
						};
						that.newData.push(oNewObject);
						index = that.newData.push(data.results[i]);
						that.newData[index - 1].CntrlPurContrDistributionPct = that.formatter.fndecimalLocalized(that.newData[index - 1].CntrlPurContrDistributionPct);
						currentContract = contract;
						flexibleIndicator = currentdist;
						oldDistributionPct = olddist;
						diffdistPct = diffdist;
						totalcount = parseFloat(data.results[i].CntrlPurContrDistributionPct);
					}
				}
				oNewObject = {
					ActivePurchasingDocument: currentContract,
					//            ProcmtHubPurgDocItmCategory: nonflexText,
					CntrlPurContrDistributionPct: parseFloat(totalcount).toFixed(3),
					CntrlPurContrFlxblDistrIsAllwd: flexibleIndicator,
					CntrlPurContrItmDistrPct: parseFloat(totalcount).toFixed(3),
					CntrlPurContrGRConsumptionPct: diffdistPct,
					ReferenceHeaderDistributionKey: ReferenceHeaderDistributionKey
						//            HeaderText: text
				};
				totalIndex = that.newData.push(oNewObject);
				return that.newData;
			},

			onCancel: function (oEvent) {
				var dataArray = [];
				this.getView().byId("HierHdrDistMTable").getModel().resetChanges();
				var oPGISmartRespTable = this.getView().byId("HierHdrDistTable");
				var mDistTable = this.getView().byId("HierHdrDistMTable");
				oPGISmartRespTable.setVisible(true);
				mDistTable.setVisible(false);
				this.getView().byId("HierHdrCancelBtn").setEnabled(false);
				this.getView().byId("HierHdrApplyBtn").setEnabled(false);
				this.getView().byId("HierHdrSimulateBtn").setEnabled(false);
				this.getView().byId("HierHdrResetBtn").setEnabled(false);
				this.getView().getModel("HdrDistModel").setData({
					modelData: dataArray
				});
			},

			handlePopoverPress: function (oEvent) {
				var oView = this.getView();
				this.oBundleText = oView.getModel("i18n").getResourceBundle();
				var that = this;
				var popOverNonFlexlessText = that.oBundleText.getText("popOverNonFlexlessText");
				var popOverNonflexSumGreaterText = that.oBundleText.getText("popOverNonflexSumGreaterText");
				var difference = oEvent.getSource().getParent().getParent().getAggregation("items")[0].getAggregation("items")[0].getProperty(
					"text");
				var diffvalue = parseFloat(difference.slice(1, -1));
				if (diffvalue > 0) {
					var displayText = popOverNonflexSumGreaterText;
				} else {
					displayText = popOverNonFlexlessText;
				}
				var oPopover = new sap.m.Popover({
					content: [
						new sap.m.Text({
							text: displayText
						}).addStyleClass("sapUiSmallMargin")
					]
				}).addStyleClass("sapUiMediumMargin");
				oPopover.setShowHeader(false);
				oPopover.openBy(oEvent.getSource());
			},

			onReset: function (oEvent) {
				var decimalNotation = sap.ui.core.format.NumberFormat.getFloatInstance();
				var decimalSeperator = decimalNotation.oFormatOptions.decimalSeparator;
				var oView = this.getView();

				oView.byId("HierHdrDistMTable").getModel().resetChanges();
				oView.byId("HierHdrApplyBtn").setEnabled(false);
				oView.byId("HierHdrSimulateBtn").setEnabled(false);
				oView.byId("HierHdrResetBtn").setEnabled(false);
				var oTable = oView.byId("HierHdrDistMTable");
				var nlength = this.newData.length;
				for (var i = 0; i < nlength; i++) {
					if (decimalSeperator === "," && this.newData[i].hasOwnProperty("__metadata")) {
						this.newData[i].CntrlPurContrDistributionPct = this.newData[i].CntrlPurContrItmDistrPct.replace(".", ",");
						this.newData[i].CntrlPurContrGRConsumptionPct = parseFloat(0).toFixed(3);
					} else {
						this.newData[i].CntrlPurContrDistributionPct = this.newData[i].CntrlPurContrItmDistrPct;
						this.newData[i].CntrlPurContrGRConsumptionPct = parseFloat(0).toFixed(3);
					}
				}
				oTable.getModel("HdrDistModel").refresh(true);

			},

			//method called when Apply Mass Changes button is clicked
			ApplyChange: function (oEvent) {
				var oView = this.getView();
				var oDialog;
				this.oBundleText = oView.getModel("@i18n").getResourceBundle();
				//dialog containing job description, Purchaser Note and Reason code is rendered
				if (!oDialog) {
					oDialog = sap.ui.xmlfragment(oView.getId(),
						"ui.s2p.mm.cntrl.ctrmass.update.HierarchyHeaderDistribution.fragment.HdrDistrApplyChangesDialog", this);
					var oModel = new JSONModel({
						buttonId: "HierHdrApplyBtn",
						dialogTitle: this.oBundleText.getText("applyChangesConfTitle"),
						Confirmation: this.oBundleText.getText("applyChangesConfirmation"),
						JobDescription: this.oBundleText.getText("massJobDescription"),
						CommentBox: this.oBundleText.getText("massChangeJobCommentBox"),
						Button: this.oBundleText.getText("applyChangesConfirmationApply")
					});
					this.getView().setModel(oModel, "dialog");
					oView.addDependent(oDialog);
				}
				this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoadedOfApplyChangesDialog.bind(this,
					oDialog));
				//adding the label for Purchaser Note Text Area
				oDialog.getContent()[1].getGroups()[0].getGroupElements()[1].setLabel(this.oBundleText.getText("PurchaserNote"));
				oDialog.open();
			},

			//method called when Simulate button is clicked
			Simulate: function (oEvent) {
				var oView = this.getView();
				var oDialog;
				this.oBundleText = oView.getModel("@i18n").getResourceBundle();
				//dialog containing job description, Purchaser Note and Reason code is rendered
				if (!oDialog) {
					oDialog = sap.ui.xmlfragment(oView.getId(),
						"ui.s2p.mm.cntrl.ctrmass.update.HierarchyHeaderDistribution.fragment.HdrDistrApplyChangesDialog", this);
					var oModel = new JSONModel({
						buttonId: "HierHdrSimulateBtn",
						dialogTitle: this.oBundleText.getText("simulateConfTitle"),
						Confirmation: this.oBundleText.getText("simulateChangesConfirmation"),
						JobDescription: this.oBundleText.getText("simulateJobDescription"),
						CommentBox: this.oBundleText.getText("simulateJobCommentBox"),
						Button: this.oBundleText.getText("simulateJobConfirmationSimulate")
					});
					this.getView().setModel(oModel, "dialog");
					oView.addDependent(oDialog);
				}
				this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoadedOfApplyChangesDialog.bind(this,
					oDialog));
				//adding the label for Purchaser Note Text Area
				oDialog.getContent()[1].getGroups()[0].getGroupElements()[1].setLabel(this.oBundleText.getText("PurchaserNote"));
				oDialog.open();
			},

			//method triggered when the job description is changed	
			onJobDescriptionChange: function (oEvent) {
				//diable the apply button when the job description is blank
				if (oEvent.getParameter("value") === "") {
					this.getView().byId("CanvasHierHdrupdateJobConfirmationBtn").setEnabled(false);
					this.validationErrFields.push("JobDescription");
				} else {
					//enable apply button when the job description is entered
					var ValueStateIndex = this.validationErrFields.indexOf("JobDescription");
					if (ValueStateIndex > -1) {
						this.validationErrFields.splice(ValueStateIndex, 1);
					}
					if (this.validationErrFields.length < 1) {
						this.getView().byId("CanvasHierHdrupdateJobConfirmationBtn").setEnabled(true);
					}

				}
			},

			//appending the header distribution model to the dialog to display the Purchaser Note and Reason Code fields
			onMetadataLoadedOfApplyChangesDialog: function (oSetNewValuesDialog) {
				var oComponent = this.getOwnerComponent();
				var oSetNewValuesModel = oComponent.getModel();
				var oModelContext;
				if (oSetNewValuesDialog && oSetNewValuesDialog.getId().indexOf("HierHdrDistApplyChangesDialog") > -1) {
					oModelContext = oSetNewValuesModel.createEntry("/C_CPurConHierHdrDistrMassUpdt", {
						groupId: "changes"
					});
				}
				oSetNewValuesDialog.setBindingContext(oModelContext);
			},

			// Method triggered when Purchaser Note is changed
			validatePurchaserNote: function (oEvent) {
				//check for maximum of 5000 characters
				if (oEvent.getParameters().value.length > 5000) {
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText(this.oBundleText.getText("PurchaserNoteMaxLength"));
					this.getView().byId("CanvasHierHdrupdateJobConfirmationBtn").setEnabled(false);
					var ValueStateIndex = this.ValueStateErrorFields.indexOf("PurgDocNoteText");
					if (ValueStateIndex < 0) {
						this.ValueStateErrorFields.push("PurgDocNoteText");
					}

				} else {
					oEvent.getSource().setValueState("None");
					oEvent.getSource().setValueStateText("");
					var ValueStateIndex = this.validationErrFields.indexOf("PurgDocNoteText");
					if (ValueStateIndex > -1) {
						this.validationErrFields.splice(ValueStateIndex, 1);
					}
					//if the entered value is correct for the job description,purchaser note and reason code
					if (this.validationErrFields.length < 1) {
						this.getView().byId("CanvasHierHdrupdateJobConfirmationBtn").setEnabled(true);
					}

				}
			},

			// Method triggered when Purchaser Note is changed
			validateReasonCode: function (oEvent) {
				var newValue = oEvent.getParameters().newValue;
				//check from the combo box the value entered , here when an invalid value is entered the value in the combo box hold the entred value and the smartfield hold teh value as blank
				//hence it is possible to differentiate between clearing teh value and wrong value entered
				var valueFromComboBox = this.getView().byId("CanvasHierHdrPurchasingDocVersionReasonCode-comboBoxEdit").getValue();
				if (newValue === "" && valueFromComboBox !== "") {
					this.getView().byId("CanvasHierHdrPurchasingDocVersionReasonCode").setValueState("Error");
					this.getView().byId("CanvasHierHdrPurchasingDocVersionReasonCode").setValueStateText(this.oBundleText.getText("ReasonCodeErrText"));
					this.getView().byId("CanvasHierHdrupdateJobConfirmationBtn").setEnabled(false);
					this.validationErrFields.push("PurchasingDocVersionReasonCode");
				} else {
					this.getView().byId("CanvasHierHdrPurchasingDocVersionReasonCode").setValueState("None");
					this.getView().byId("CanvasHierHdrPurchasingDocVersionReasonCode").setValueStateText("");
					var ValueStateIndex = this.validationErrFields.indexOf("PurchasingDocVersionReasonCode");
					if (ValueStateIndex > -1) {
						this.validationErrFields.splice(ValueStateIndex, 1);
					}
					//if the entered value is correct for the job description,purchaser note and reason code
					if (this.validationErrFields.length < 1) {
						this.getView().byId("CanvasHierHdrupdateJobConfirmationBtn").setEnabled(true);
					}
				}
			},

			onClickMassChangeJobs: function (oEvent) {
				var oComponent = this.getOwnerComponent();
				var params = {
					"JobCatalogEntryName": "SAP_MM_PUR_MASSCCTRBG_J"
				};
				var oNavigationController = oComponent.oExtensionAPI.getNavigationController();
				oNavigationController.navigateExternal("CtrApplicationJob", params);
			},

			// on click of cancel from Apply Mass Changes Dialog
			onPressCancelButton: function () {
				//delete the newly created entry for the dialog in the model
				this.validationErrFields = [];
				var oComponent = this.getOwnerComponent();
				var oSetNewValuesModel = oComponent.getModel();
				var aContext = this.getView().byId("HierHdrDistApplyChangesDialog").getContent()[0].getBindingContext();
				oSetNewValuesModel.deleteCreatedEntry(aContext);
				//close and destroy the dialog
				this.getView().byId("HierHdrDistApplyChangesDialog").close();
				this.getView().byId("HierHdrDistApplyChangesDialog").destroy();
			},

			//On click of apply from apply mass changes dialog
			onSubmitChnges: function (oEvent) {
				sap.ui.core.BusyIndicator.show(5);
				var decimalNotation = sap.ui.core.format.NumberFormat.getFloatInstance();
				var decimalSeperator = decimalNotation.oFormatOptions.decimalSeparator;
				//fetching the value for reason code from the apply mass changes dialog
				var ReasonCodeValue = this.getView().byId("CanvasHierHdrPurchasingDocVersionReasonCode").getValue();
				//fetching the value for Purchaser Note from the apply mass changes dialog
				var PurchaserNoteValue = this.getView().byId("CanvasHierHdrPurgDocNoteText").getValue();
				//fetching the value for Job Description from the apply mass changes dialog
				var sComment = this.getView().byId("HierHdrDistApplyChangesDialogmassChangeJobCommentBox").getValue();
				this.getView().byId("HierHdrDistMTable").getModel().resetChanges();
				this.onPressCancelButton();
				this.updateContracts = [];
				var that = this;
				this.newModel = [];

				// var currentRowContext;
				//changeset call is sent only for those contract whose distribtuion percentage is changed and this is obtained from the array changedContract
				for (var i = 0; i < this.newData.length; i++) {
					if (this.newData[i].hasOwnProperty("__metadata") === true) {
						var chngdCtrDist = this.newData[i].CentralPurchaseContract + "*" + this.newData[i].PurgDocItemDistributionKey;
						if (this.changedContract.indexOf(chngdCtrDist) !== -1) {
							this.updateContracts.push(this.newData[i]);
						}
					}
				}
				var oModel = this.getView().getModel();
				oModel.setDeferredGroups(["DEFAULT"]);
				// Simulation Flag
				var buttonId = this.getView().getModel("dialog").getData().buttonId;
				if (buttonId === "HierHdrSimulateBtn") {
					oModel.setHeaders({
						"MassAddition": "",
						"Simulation": "X"
					});
				} else {
					oModel.setHeaders({
						"MassAddition": "",
						"Simulation": ""
					});
				}
				var data = this.updateContracts;
				if (decimalSeperator === ",") {
					for (var index = 0; index < data.length; index++) {
						data[index].CntrlPurContrDistributionPct = data[index].CntrlPurContrDistributionPct.replace(",", ".");
					}
				}
				this.changedContract = [];
				var columns = {};
				var finalArray = [];
				index = 0;
				$.each(data, function () {
					columns[index] = {
						// __metadata: this.__metadata,
						CentralPurchaseContract: this.ActivePurchasingDocument,
						PurgDocItemDistributionKey: this.PurgDocItemDistributionKey,
						CntrlPurContrDistributionPct: this.CntrlPurContrDistributionPct,
						InternalComment: sComment
					};
					//if the reason code is entred the append the value in the changeset
					if (ReasonCodeValue) {
						columns[index].PurchasingDocVersionReasonCode = ReasonCodeValue;
					}
					//if the Purchaser Note is entred the append the value in the changeset
					if (PurchaserNoteValue) {
						columns[index].PurgDocNoteText = PurchaserNoteValue;
					}
					finalArray.push(columns[index]);
					index++;
				});
				for (i = 0; i < this.updateContracts.length; i++) {
					//	currentRowContext = finalArray[i];
					var oRowContextObject = finalArray[i];
					var url = this.updateContracts[i].__metadata.id;
					var ctrIndex = url.search("/C_CPurConHierHdrDistrMassUpdt");
					var sPath = url.substring(ctrIndex);
					oModel.update(sPath, oRowContextObject, {
						groupId: "DEFAULT",
						changeSetId: "myId"
					});
				}
				oModel.submitChanges({
					groupId: "DEFAULT",
					success: function (response) {
						var sMsg, jobId, sJobDescription, sJobScheduledText;
						if (response && response.__batchResponses && response.__batchResponses[0] && response.__batchResponses[0].__changeResponses &&
							response.__batchResponses[0].__changeResponses[0] && response.__batchResponses[0].__changeResponses[0].headers && response.__batchResponses[
								0].__changeResponses[0].headers.hasOwnProperty("sap-message")) {
							var parsedResponse = JSON.parse(response.__batchResponses[0].__changeResponses[0].headers["sap-message"]);
							if (parsedResponse.severity === "success") {
								jobId = JSON.parse(response.__batchResponses[0].__changeResponses[0].headers["sap-message"]).message.split(" ")[1];
							}
						}
						if (jobId !== undefined && jobId !== null) {
							sJobDescription = that.oBundleText.getText("jobDescription", [sComment]);
							sJobScheduledText = that.oBundleText.getText("jobCreatedText", [sComment]);
							sMsg = new sap.m.Text("sJobScheduledText", {
								text: sJobScheduledText.replace(sJobDescription, '"' + sJobDescription + '"')
							});
							var dialog = new sap.m.Dialog({
								title: that.oBundleText.getText("success"),
								type: "Message",
								state: "Success",
								content: sMsg,
								beginButton: new sap.m.Button({
									text: that.oBundleText.getText("viewJobButtonText"),
									press: function () {
										that.onClickMassChangeJobs(that);
										dialog.close();
									}
								}),
								endButton: new sap.m.Button({
									text: that.oBundleText.getText("closeButtonText"),
									press: function () {
										dialog.close();
										dialog.getParent().byId("HierHdrDistMTable").setVisible(false);
										dialog.getParent().byId("HierHdrDistTable").setVisible(true);
										dialog.getParent().byId("HierHdrApplyBtn").setEnabled(false);
										dialog.getParent().byId("HierHdrSimulateBtn").setEnabled(false);
										dialog.getParent().byId("HierHdrCancelBtn").setEnabled(false);
										dialog.getParent().byId("HierHdrResetBtn").setEnabled(false);
										dialog.getParent().byId("HierHdrDistTable").getModel().refresh();
									}
								}),
								afterClose: function () {
									dialog.destroy();
								}
							});
							that.getView().addDependent(dialog);
							sap.ui.core.BusyIndicator.hide();
							dialog.open();

						} else {
							that.getView().byId("HierHdrDistMTable").setVisible(false);
							that.getView().byId("HierHdrDistTable").setVisible(true);
							that.getView().byId("HierHdrApplyBtn").setEnabled(false);
							that.getView().byId("HierHdrSimulateBtn").setEnabled(false);
							that.getView().byId("HierHdrCancelBtn").setEnabled(false);
							that.getView().byId("HierHdrResetBtn").setEnabled(false);
							that.getView().byId("HierHdrDistTable").getModel().refresh();
							sMsg = that.oBundleText.getText("jobFailedText");
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(sMsg);

						}
					},
					error: function (err) {
						that.getView().byId("HierHdrDistMTable").setVisible(false);
						that.getView().byId("HierHdrDistTable").setVisible(true);
						that.getView().byId("HierHdrApplyBtn").setEnabled(false);
						that.getView().byId("HierHdrSimulateBtn").setEnabled(false);
						that.getView().byId("HierHdrCancelBtn").setEnabled(false);
						that.getView().byId("HierHdrResetBtn").setEnabled(false);
						that.getView().byId("HierHdrDistTable").getModel().refresh();
						var sMsg = that.oBundleText.getText("errorOccured");
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(sMsg);

					}
				});
			}
		});
	});