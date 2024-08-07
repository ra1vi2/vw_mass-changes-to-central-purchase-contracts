/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/generic/app/navigation/service/NavigationHandler","sap/ui/model/Filter","sap/ui/model/json/JSONModel","sap/ui/model/FilterOperator","ui/s2p/mm/cntrl/ctrmass/update/HeaderDistribution/model/formatter","sap/m/MessageBox","sap/ui/core/routing/History"],function(N,F,J,a,f,M,H){"use strict";this.oHeaderDistributionFilters=[];return sap.ui.controller("ui.s2p.mm.cntrl.ctrmass.update.HeaderDistribution.controller.HeaderDistribution",{formatter:f,AffectedContractsOnAddHdrDist:[],AffectedContractsHdrDistCount:undefined,onInit:function(){var t=this;var c=this.getOwnerComponent();var C=c.getComponentModel();C.setProperty("/View",this.getView());this.newData=[];this.validationErrFields=[];this.smartFieldChanged=[];this.nonMandateFieldChanged=[];this.changedContract=[];this.updateContracts=[];this.getView().byId("HdrDistTable").attachDataReceived(null,function(e){if(e&&e.getParameters()&&e.getParameters().getParameters()&&e.getParameters().getParameters().data&&e.getParameters().getParameters().data.results){var d=e.getParameters().getParameters().data.results.length;}if(d<=0){t.getView().byId("EditHdrDist").setEnabled(false);}else{t.getView().byId("EditHdrDist").setEnabled(true);}});},enableSimulationFeature:function(){this.getView().byId("SimulateBtn").setVisible(true);},HeaderfilterBarSearch:function(e){var q,c;this.oHeaderDistributionFilters=[];var C=this.getOwnerComponent();var o=C.getComponentModel();var s=this.getView().byId("HeaderSearchFld");q=s.getValue();if(e.getId()==="search"){q=e.getParameter("query");}if(q!==undefined&&q!==null&&q.length>0){c=new F({path:"ActivePurchasingDocument",operator:a.Contains,value1:q,bAnd:true});this.oHeaderDistributionFilters.push(c);o.setProperty("/searchFlag",true);}else{o.setProperty("/searchFlag",false);}this.getView().byId("HdrDistTable").rebindTable();},handleFilters:function(){var c=this.getOwnerComponent();var s=this.getView().byId("HdrDistTable");var C=c.getComponentModel();if(C.getProperty("/searchFlag")===false&&C.getProperty("/searchFlag")!==undefined){s.getToolbar().getAggregation("content")[2].setProperty("value","");this.oHeaderDistributionFilters={};}this.ahdrDistFilt=[];var g=[];var O=this.itemKeys[0];var p=parseInt(this.itemKeys[1])+1;if(this.itemKeys.length>p+1){g=JSON.parse(this.itemKeys[p+1]);}if(O==="NE"){var e=new F({filters:[],and:true});for(var j=2;j<=p;j++){e.aFilters.push(new F("ActivePurchasingDocument","NE",this.itemKeys[j],true));}this.ahdrDistFilt=new F(g,true);this.ahdrDistFilt=this.ahdrDistFilt.aFilters;this.ahdrDistFilt.push(e);if(this.oHeaderDistributionFilters&&this.oHeaderDistributionFilters.length>0){this.ahdrDistFilt.push(this.oHeaderDistributionFilters[0]);}}else if(O==="EQ"){for(var i=2;i<=p;i++){var b=this.itemKeys[i];var d=new sap.ui.model.Filter({path:"ActivePurchasingDocument",operator:O,value1:b});this.ahdrDistFilt.push(d);}if(this.oHeaderDistributionFilters&&this.oHeaderDistributionFilters.length>0){var h=new F(this.oHeaderDistributionFilters,true);this.ahdrDistFilt.push(h);}}else if(O==="X"){if(g.length>0){this.ahdrDistFilt=new F(g,true);this.ahdrDistFilt=this.ahdrDistFilt.aFilters;}if(this.oHeaderDistributionFilters&&this.oHeaderDistributionFilters.length>0){this.ahdrDistFilt.push(this.oHeaderDistributionFilters[0]);}}return this.ahdrDistFilt;},onBeforeDocumentsTableRebind:function(e){var t=this;var v=this.getView();var d=this.getView().byId("HdrDistMTable");var s=this.getView().byId("HdrDistTable");var b=e.getParameter("bindingParams");var S=b.sorter[0];this.deriveItemKeys();b.filters=this.handleFilters();this.aPGISorters=[];this.oBundleText=v.getModel("i18n").getResourceBundle();this.mGroupFunctions={ActivePurchasingDocument:function(c){var g=c.getProperty("ActivePurchasingDocument");var h=c.getProperty("CntrlPurContrFlxblDistrIsAllwd");var i=t.oBundleText.getText("FlexibleContracts");var C=t.oBundleText.getText("CentralPurchaseContract");if(h){return{key:g,text:C+": "+g+" "+i};}else{return{key:g,text:C+": "+g};}}};if(!S){S=new sap.ui.model.Sorter("ActivePurchasingDocument",false,true);S.fnGroup=this.mGroupFunctions[S.sPath].bind(t);this.aPGISorters.push(S);b.sorter=b.sorter.concat(this.aPGISorters);}d.setVisible(false);s.setVisible(true);this.getView().byId("CancelBtn").setEnabled(false);this.getView().byId("ApplyBtn").setEnabled(false);this.getView().byId("SimulateBtn").setEnabled(false);this.getView().byId("ResetBtn").setEnabled(false);this.enableSimulationFeature();},deriveItemKeys:function(e){var c=this.getOwnerComponent();var C=c.getComponentModel();this.itemKeys=C.getProperty("/itemKeys");if(this.itemKeys!==undefined){this.itemKeys=this.itemKeys.split("*");}},editHdrDist:function(e){var d=[];if(this.getView().getModel("HdrDistModel")!==undefined){this.getView().getModel("HdrDistModel").setData({modelData:d});}var t=this;var v=this.getView();this.oBundleText=v.getModel("i18n").getResourceBundle();var p=this.getView().byId("HdrDistTable");var D=this.getView().byId("HdrDistMTable");var b=t.oBundleText.getText("HeaderDistribution")+" ("+p._getRowCount()+")";D.getExtension()[0].getAggregation("content")[0].getAggregation("content")[2].setEnabled(false);var s=p.getAggregation("items")[0].getAggregation("content")[2].getProperty("value");D.getExtension()[0].getAggregation("content")[0].getAggregation("content")[2].setValue(s);this.getView().byId("EditHdrDistMtable").setEnabled(false);p.setVisible(false);D.setVisible(true);D.getColumns()[2].attachEvent(t.formatter.fndecimalLocalized(""));D.attachRowsUpdated(null,function(E){D.focus();});this.getView().byId("CancelBtn").setEnabled(true);var u="/C_CntrlPurContrHdrDistr";var o=this.getOwnerComponent().getModel();sap.ui.core.BusyIndicator.show();o.read(u,{filters:this.ahdrDistFilt,sorters:[new sap.ui.model.Sorter("ActivePurchasingDocument",false,false)],success:function(c){t.newData=t.addTotalRow(c);var h=new J();h.setData({modelData:t.newData});t.getView().setModel(h,"HdrDistModel");D.getExtension()[0].getAggregation("content")[0].getAggregation("content")[0].setText(b);if(t.newData.length<10){D.setVisibleRowCountMode("Fixed");D.setVisibleRowCount(t.newData.length);}else{D.setVisibleRowCountMode("Auto");}t.mGroupFunctions={ActivePurchasingDocument:function(C){var g=C.getProperty("ActivePurchasingDocument");var i=C.getProperty("CntrlPurContrFlxblDistrIsAllwd");var j=t.oBundleText.getText("FlexibleContracts");var k=t.oBundleText.getText("CentralPurchaseContract");if(i){return{key:g,text:k+": "+g+" "+j};}else{return{key:g,text:k+": "+g};}}};var S=new sap.ui.model.Sorter("ActivePurchasingDocument",false,true);S.fnGroup=t.mGroupFunctions[S.sPath].bind(t);D.getBinding("rows").sort(S);sap.ui.core.BusyIndicator.hide();},error:function(E){sap.ui.core.BusyIndicator.hide();}});},onChange:function(e){var d=sap.ui.core.format.NumberFormat.getFloatInstance();var b=d.oFormatOptions.decimalSeparator;var c,C;var v=this.getView();this.oBundleText=v.getModel("i18n").getResourceBundle();c=e.getParameter("newValue");var g=c;var t=0;var h=0;var k;var r=/^[0-9]{0,3}(\,[0-9]{0,3})?$/;var l=/^[0-9]{0,3}(\.[0-9]{0,3})?$/;if(r.test(g)||l.test(g)){c=c.replace(",",".");if(c!==""&&parseFloat(c)<=100){k=parseFloat(c).toFixed(3);this.getView().byId("ApplyBtn").setEnabled(false);this.getView().byId("SimulateBtn").setEnabled(false);this.getView().byId("ResetBtn").setEnabled(true);var m=e.getSource().getParent().getParent().getParent().getIndex();if((b==="."&&g.indexOf(",")>0)||b==="."){this.newData[m].CntrlPurContrDistributionPct=k;}else if((b===","&&g.indexOf(".")>0)||b===","){this.newData[m].CntrlPurContrDistributionPct=k.replace(".",",");}var n=this.newData[m].CentralPurchaseContract;var o=this.newData[m].DistributionKey;var p=n+"*"+o;var q=parseFloat(c)-parseFloat(this.newData[m].CntrlPurContrItmDistrPct);this.newData[m].CntrlPurContrGRConsumptionPct=q;var s="/C_CntrlPurContrHdrDistr(CentralPurchaseContract='"+n+"',DistributionKey='"+o+"')";var T=this.getView().byId("HdrDistMTable");var u=T.getModel().getProperty(s);T.getModel().setProperty(u.CntrlPurContrDistributionPct,"60",T.getModel().mContexts[s]);if(this.changedContract.indexOf(p)===-1){this.changedContract.push(p.replace("%20"," "));this.getView().byId("ApplyBtn").setEnabled(true);this.getView().byId("SimulateBtn").setEnabled(true);}else{this.getView().byId("ApplyBtn").setEnabled(true);this.getView().byId("SimulateBtn").setEnabled(true);if(parseFloat(c)===parseFloat(this.newData[m].CntrlPurContrItmDistrPct)){var w=this.changedContract.indexOf(p);this.changedContract.splice(w,1);}}for(var i=0;i<this.newData.length;i++){if(this.newData[i].hasOwnProperty("__metadata")===true){if(this.newData[i].CentralPurchaseContract===n){C=i;break;}}}for(var j=i;j<this.newData.length;j++){if(this.newData[j].hasOwnProperty("__metadata")){var x;if(b===","){x=this.newData[j].CntrlPurContrDistributionPct.replace(".","");x=x.replace(",",".");}else{x=parseFloat(this.newData[j].CntrlPurContrDistributionPct).toFixed(3);}var y=x;if(isNaN(x)){this.newData[j].CntrlPurContrDistributionPct="";y=0;this.newData[j].CntrlPurContrGRConsumptionPct=0-this.newData[j].CntrlPurContrItmDistrPct;}t=t+parseFloat(y);h=h+parseFloat(this.newData[j].CntrlPurContrGRConsumptionPct);}else{break;}}t=parseFloat(t).toFixed(3);this.newData[j].CntrlPurContrDistributionPct=t;this.newData[j].CntrlPurContrGRConsumptionPct=h;for(var z=0;z<this.newData.length;z++){if(this.newData[z].hasOwnProperty("__metadata")===true){if(parseInt(this.newData[z].CntrlPurContrDistributionPct)===parseInt(this.newData[z].CntrlPurContrItmDistrPct)){this.getView().byId("ApplyBtn").setEnabled(false);this.getView().byId("SimulateBtn").setEnabled(false);this.getView().byId("ResetBtn").setEnabled(false);}else{this.getView().byId("ApplyBtn").setEnabled(true);this.getView().byId("SimulateBtn").setEnabled(true);this.getView().byId("ResetBtn").setEnabled(true);break;}}}if(this.getView().byId("ApplyBtn").getEnabled()===true||this.getView().byId("SimulateBtn").getEnabled()===true){for(var i=0;i<this.newData.length;i++){if(this.newData[i].hasOwnProperty("__metadata")===false){if(isNaN(this.newData[i].CntrlPurContrDistributionPct)){this.newData[i].CntrlPurContrDistributionPct=0;}if((this.newData[i].CntrlPurContrFlxblDistrIsAllwd===false||this.newData[i].CntrlPurContrFlxblDistrIsAllwd==="")&&parseFloat(this.newData[i].CntrlPurContrGRConsumptionPct)!==0){this.getView().byId("ApplyBtn").setEnabled(false);this.getView().byId("SimulateBtn").setEnabled(false);break;}else{this.getView().byId("ApplyBtn").setEnabled(true);this.getView().byId("SimulateBtn").setEnabled(true);}}}}if(!this.getView().byId("ResetBtn").getEnabled()){this.getView().byId("HdrDistMTable").getModel().resetChanges();}}else{this.getView().byId("ApplyBtn").setEnabled(false);this.getView().byId("SimulateBtn").setEnabled(false);this.getView().byId("ResetBtn").setEnabled(true);}}else{this.getView().byId("ApplyBtn").setEnabled(false);this.getView().byId("SimulateBtn").setEnabled(false);this.getView().byId("ResetBtn").setEnabled(true);}var A=this.getView().byId("HdrDistMTable").getBindingInfo("rows").binding.oList.length;for(var B=0;B<A;B++){if(this.getView().byId("HdrDistMTable").getBindingInfo("rows").binding.oList[B].GroupHeaderReference!==1&&this.getView().byId("HdrDistMTable").getBindingInfo("rows").binding.oList[B].ReferenceHeaderDistributionKey!==-1){if(this.getView().byId("HdrDistMTable").getBindingInfo("rows").binding.oList[B].CntrlPurContrDistributionPct>100||this.getView().byId("HdrDistMTable").getBindingInfo("rows").binding.oList[B].CntrlPurContrDistributionPct===""){this.getView().byId("ApplyBtn").setEnabled(false);this.getView().byId("SimulateBtn").setEnabled(false);break;}}}},addTotalRow:function(d){var b;this.newData=[];var v=this.getView();this.oBundleText=v.getModel("i18n").getResourceBundle();var t=this;var n=d.results.length;var c=parseFloat(d.results[0].CntrlPurContrDistributionPct);var e=d.results[0].ActivePurchasingDocument;var g=d.results[0].CntrlPurContrFlxblDistrIsAllwd;var o=d.results[0].CntrlPurContrItmDistrPct;var h=d.results[0].CntrlPurContrGRConsumptionPct;var R=-1;var G=1;var j;if(d.results[0].CntrlPurContrFlxblDistrIsAllwd){j=e+" (Flexible Contract)";}else{j=e;}var k={ActivePurchasingDocument:e,GroupHeaderReference:G,CntrlPurContrDistributionPct:0,CntrlPurContrItmDistrPct:0,CntrlPurContrGRConsumptionPct:0,HeaderText:j};t.newData.push(k);t.newData[1]=d.results[0];t.newData[1].CntrlPurContrDistributionPct=t.formatter.fndecimalLocalized(t.newData[1].CntrlPurContrDistributionPct);var l;for(var i=1;i<n;i++){var m=d.results[i].ActivePurchasingDocument;var p=d.results[i].CntrlPurContrFlxblDistrIsAllwd;var q=d.results[i].CntrlPurContrItmDistrPct;var r=d.results[i].CntrlPurContrGRConsumptionPct;if(e===m){b=t.newData.push(d.results[i]);t.newData[b-1].CntrlPurContrDistributionPct=t.formatter.fndecimalLocalized(t.newData[b-1].CntrlPurContrDistributionPct);c=c+parseFloat(d.results[i].CntrlPurContrDistributionPct);}else{k={ActivePurchasingDocument:e,CntrlPurContrDistributionPct:parseFloat(c).toFixed(3),CntrlPurContrFlxblDistrIsAllwd:g,CntrlPurContrItmDistrPct:parseFloat(c).toFixed(3),CntrlPurContrGRConsumptionPct:h,ReferenceHeaderDistributionKey:R};l=t.newData.push(k);if(d.results[i].CntrlPurContrFlxblDistrIsAllwd){j=d.results[i].ActivePurchasingDocument+" (Flexible Contract)";}else{j=d.results[i].ActivePurchasingDocument;}k={ActivePurchasingDocument:d.results[i].ActivePurchasingDocument,GroupHeaderReference:G,CntrlPurContrDistributionPct:0,CntrlPurContrItmDistrPct:0,CntrlPurContrGRConsumptionPct:0,HeaderText:j};t.newData.push(k);b=t.newData.push(d.results[i]);t.newData[b-1].CntrlPurContrDistributionPct=t.formatter.fndecimalLocalized(t.newData[b-1].CntrlPurContrDistributionPct);e=m;g=p;o=q;h=r;c=parseFloat(d.results[i].CntrlPurContrDistributionPct);}}k={ActivePurchasingDocument:e,CntrlPurContrDistributionPct:parseFloat(c).toFixed(3),CntrlPurContrFlxblDistrIsAllwd:g,CntrlPurContrItmDistrPct:parseFloat(c).toFixed(3),CntrlPurContrGRConsumptionPct:h,ReferenceHeaderDistributionKey:R};l=t.newData.push(k);return t.newData;},onCancel:function(e){var d=[];this.getView().byId("HdrDistMTable").getModel().resetChanges();var p=this.getView().byId("HdrDistTable");var D=this.getView().byId("HdrDistMTable");p.setVisible(true);D.setVisible(false);this.getView().byId("CancelBtn").setEnabled(false);this.getView().byId("ApplyBtn").setEnabled(false);this.getView().byId("SimulateBtn").setEnabled(false);this.getView().byId("ResetBtn").setEnabled(false);this.getView().getModel("HdrDistModel").setData({modelData:d});},handlePopoverPress:function(e){var v=this.getView();this.oBundleText=v.getModel("i18n").getResourceBundle();var t=this;var p=t.oBundleText.getText("popOverNonFlexlessText");var b=t.oBundleText.getText("popOverNonflexSumGreaterText");var d=e.getSource().getParent().getParent().getAggregation("items")[0].getAggregation("items")[0].getProperty("text");var c=parseFloat(d.slice(1,-1));if(c>0){var g=b;}else{g=p;}var P=new sap.m.Popover({content:[new sap.m.Text({text:g}).addStyleClass("sapUiSmallMargin")]}).addStyleClass("sapUiMediumMargin");P.setShowHeader(false);P.openBy(e.getSource());},onReset:function(e){var d=sap.ui.core.format.NumberFormat.getFloatInstance();var b=d.oFormatOptions.decimalSeparator;var v=this.getView();v.byId("HdrDistMTable").getModel().resetChanges();v.byId("ApplyBtn").setEnabled(false);v.byId("SimulateBtn").setEnabled(false);v.byId("ResetBtn").setEnabled(false);var t=v.byId("HdrDistMTable");var n=this.newData.length;for(var i=0;i<n;i++){if(b===","&&this.newData[i].hasOwnProperty("__metadata")){this.newData[i].CntrlPurContrDistributionPct=this.newData[i].CntrlPurContrItmDistrPct.replace(".",",");this.newData[i].CntrlPurContrGRConsumptionPct=parseFloat(0).toFixed(3);}else{this.newData[i].CntrlPurContrDistributionPct=this.newData[i].CntrlPurContrItmDistrPct;this.newData[i].CntrlPurContrGRConsumptionPct=parseFloat(0).toFixed(3);}}t.getModel("HdrDistModel").refresh(true);},ApplyChange:function(e){var v=this.getView();var d;this.oBundleText=v.getModel("@i18n").getResourceBundle();if(!d){d=sap.ui.xmlfragment(v.getId(),"ui.s2p.mm.cntrl.ctrmass.update.HeaderDistribution.fragment.HdrDistrApplyChangesDialog",this);var m=new J({buttonId:"ApplyBtn",dialogTitle:this.oBundleText.getText("applyChangesConfTitle"),Confirmation:this.oBundleText.getText("applyChangesConfirmation"),JobDescription:this.oBundleText.getText("massJobDescription"),CommentBox:this.oBundleText.getText("massChangeJobCommentBox"),Button:this.oBundleText.getText("applyChangesConfirmationApply")});this.getView().setModel(m,"dialog");v.addDependent(d);}this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoadedOfApplyChangesDialog.bind(this,d));d.getContent()[1].getGroups()[0].getGroupElements()[1].setLabel(this.oBundleText.getText("PurchaserNote"));d.open();},Simulate:function(e){var v=this.getView();var d;this.oBundleText=v.getModel("@i18n").getResourceBundle();if(!d){d=sap.ui.xmlfragment(v.getId(),"ui.s2p.mm.cntrl.ctrmass.update.HeaderDistribution.fragment.HdrDistrApplyChangesDialog",this);var m=new J({buttonId:"SimulateBtn",dialogTitle:this.oBundleText.getText("simulateConfTitle"),Confirmation:this.oBundleText.getText("simulateChangesConfirmation"),JobDescription:this.oBundleText.getText("simulateJobDescription"),CommentBox:this.oBundleText.getText("simulateJobCommentBox"),Button:this.oBundleText.getText("simulateJobConfirmationSimulate")});this.getView().setModel(m,"dialog");v.addDependent(d);}this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoadedOfApplyChangesDialog.bind(this,d));d.getContent()[1].getGroups()[0].getGroupElements()[1].setLabel(this.oBundleText.getText("PurchaserNote"));d.open();},onJobDescriptionChange:function(e){if(e.getParameter("value")===""){this.getView().byId("CanvasHdrupdateJobConfirmationBtn").setEnabled(false);this.validationErrFields.push("JobDescription");}else{var V=this.validationErrFields.indexOf("JobDescription");if(V>-1){this.validationErrFields.splice(V,1);}if(this.validationErrFields.length<1){this.getView().byId("CanvasHdrupdateJobConfirmationBtn").setEnabled(true);}}},onMetadataLoadedOfApplyChangesDialog:function(s){var c=this.getOwnerComponent();var S=c.getModel();var m;if(s&&s.getId().indexOf("HdrDistApplyChangesDialog")>-1){m=S.createEntry("/C_CntrlPurContrHdrDistr",{groupId:"changes"});}s.setBindingContext(m);},validatePurchaserNote:function(e){if(e.getParameters().value.length>5000){e.getSource().setValueState("Error");e.getSource().setValueStateText(this.oBundleText.getText("PurchaserNoteMaxLength"));this.getView().byId("CanvasHdrupdateJobConfirmationBtn").setEnabled(false);var V=this.ValueStateErrorFields.indexOf("PurgDocNoteText");if(V<0){this.ValueStateErrorFields.push("PurgDocNoteText");}}else{e.getSource().setValueState("None");e.getSource().setValueStateText("");var V=this.validationErrFields.indexOf("PurgDocNoteText");if(V>-1){this.validationErrFields.splice(V,1);}if(this.validationErrFields.length<1){this.getView().byId("CanvasHdrupdateJobConfirmationBtn").setEnabled(true);}}},validateReasonCode:function(e){var n=e.getParameters().newValue;var v=this.getView().byId("CanvasHdrPurchasingDocVersionReasonCode-comboBoxEdit").getValue();if(n===""&&v!==""){this.getView().byId("CanvasHdrPurchasingDocVersionReasonCode").setValueState("Error");this.getView().byId("PurchasingDocVersionReasonCode").setValueStateText(this.oBundleText.getText("ReasonCodeErrText"));this.getView().byId("CanvasHdrupdateJobConfirmationBtn").setEnabled(false);this.validationErrFields.push("PurchasingDocVersionReasonCode");}else{this.getView().byId("CanvasHdrPurchasingDocVersionReasonCode").setValueState("None");this.getView().byId("PurchasingDocVersionReasonCode").setValueStateText("");var V=this.validationErrFields.indexOf("PurchasingDocVersionReasonCode");if(V>-1){this.validationErrFields.splice(V,1);}if(this.validationErrFields.length<1){this.getView().byId("CanvasHdrupdateJobConfirmationBtn").setEnabled(true);}}},onClickMassChangeJobs:function(e){var c=this.getOwnerComponent();var p={"JobCatalogEntryName":"SAP_MM_PUR_MASSCCTRBG_J"};var n=c.oExtensionAPI.getNavigationController();n.navigateExternal("CtrApplicationJob",p);},onPressCancelButton:function(){this.validationErrFields=[];var c=this.getOwnerComponent();var s=c.getModel();var C=this.getView().byId("HdrDistApplyChangesDialog").getContent()[0].getBindingContext();s.deleteCreatedEntry(C);this.getView().byId("HdrDistApplyChangesDialog").close();this.getView().byId("HdrDistApplyChangesDialog").destroy();},onSubmitChnges:function(e){sap.ui.core.BusyIndicator.show(5);var d=sap.ui.core.format.NumberFormat.getFloatInstance();var b=d.oFormatOptions.decimalSeparator;var R=this.getView().byId("CanvasHdrPurchasingDocVersionReasonCode").getValue();var P=this.getView().byId("CanvasHdrPurgDocNoteText").getValue();var c=this.getView().byId("HdrDistApplyChangesDialogmassChangeJobCommentBox").getValue();this.getView().byId("HdrDistMTable").getModel().resetChanges();this.onPressCancelButton();this.updateContracts=[];var t=this;this.newModel=[];for(var i=0;i<this.newData.length;i++){if(this.newData[i].hasOwnProperty("__metadata")===true){var g=this.newData[i].CentralPurchaseContract+"*"+this.newData[i].DistributionKey;if(this.changedContract.indexOf(g)!==-1){this.updateContracts.push(this.newData[i]);}}}var m=this.getView().getModel();m.setDeferredGroups(["DEFAULT"]);var h=this.getView().getModel("dialog").getData().buttonId;if(h==="SimulateBtn"){m.setHeaders({"MassAddition":"","Simulation":"X"});}else{m.setHeaders({"MassAddition":"","Simulation":""});}var j=this.updateContracts;if(b===","){for(var k=0;k<j.length;k++){j[k].CntrlPurContrDistributionPct=j[k].CntrlPurContrDistributionPct.replace(",",".");}}this.changedContract=[];var l={};var n=[];k=0;$.each(j,function(){l[k]={CentralPurchaseContract:this.ActivePurchasingDocument,DistributionKey:this.DistributionKey,CntrlPurContrDistributionPct:this.CntrlPurContrDistributionPct,InternalComment:c};if(R){l[k].PurchasingDocVersionReasonCode=R;}if(P){l[k].PurgDocNoteText=P;}n.push(l[k]);k++;});for(i=0;i<this.updateContracts.length;i++){var r=n[i];var u=this.updateContracts[i].__metadata.id;var o=u.search("/C_CntrlPurContrHdrDistr");var p=u.substring(o);m.update(p,r,{groupId:"DEFAULT",changeSetId:"myId"});}m.submitChanges({groupId:"DEFAULT",success:function(q){var s,v,w,x;if(q&&q.__batchResponses&&q.__batchResponses[0]&&q.__batchResponses[0].__changeResponses&&q.__batchResponses[0].__changeResponses[0]&&q.__batchResponses[0].__changeResponses[0].headers&&q.__batchResponses[0].__changeResponses[0].headers.hasOwnProperty("sap-message")){var y=JSON.parse(q.__batchResponses[0].__changeResponses[0].headers["sap-message"]);if(y.severity==="success"){v=JSON.parse(q.__batchResponses[0].__changeResponses[0].headers["sap-message"]).message.split(" ")[1];}}if(v!==undefined&&v!==null){w=t.oBundleText.getText("jobDescription",[c]);x=t.oBundleText.getText("jobCreatedText",[c]);s=new sap.m.Text("sJobScheduledText",{text:x.replace(w,'"'+w+'"')});var z=new sap.m.Dialog({title:t.oBundleText.getText("success"),type:"Message",state:"Success",content:s,beginButton:new sap.m.Button({text:t.oBundleText.getText("viewJobButtonText"),press:function(){t.onClickMassChangeJobs(t);z.close();}}),endButton:new sap.m.Button({text:t.oBundleText.getText("closeButtonText"),press:function(){z.close();z.getParent().byId("HdrDistMTable").setVisible(false);z.getParent().byId("HdrDistTable").setVisible(true);z.getParent().byId("ApplyBtn").setEnabled(false);z.getParent().byId("SimulateBtn").setEnabled(false);z.getParent().byId("CancelBtn").setEnabled(false);z.getParent().byId("ResetBtn").setEnabled(false);z.getParent().byId("HdrDistTable").getModel().refresh();}}),afterClose:function(){z.destroy();}});t.getView().addDependent(z);sap.ui.core.BusyIndicator.hide();z.open();}else{t.getView().byId("HdrDistMTable").setVisible(false);t.getView().byId("HdrDistTable").setVisible(true);t.getView().byId("ApplyBtn").setEnabled(false);t.getView().byId("SimulateBtn").setEnabled(false);t.getView().byId("CancelBtn").setEnabled(false);t.getView().byId("ResetBtn").setEnabled(false);t.getView().byId("HdrDistTable").getModel().refresh();s=t.oBundleText.getText("jobFailedText");sap.ui.core.BusyIndicator.hide();M.error(s);}},error:function(q){t.getView().byId("HdrDistMTable").setVisible(false);t.getView().byId("HdrDistTable").setVisible(true);t.getView().byId("ApplyBtn").setEnabled(false);t.getView().byId("SimulateBtn").setEnabled(false);t.getView().byId("CancelBtn").setEnabled(false);t.getView().byId("ResetBtn").setEnabled(false);t.getView().byId("HdrDistTable").getModel().refresh();var s=t.oBundleText.getText("errorOccured");sap.ui.core.BusyIndicator.hide();M.error(s);}});}});});
