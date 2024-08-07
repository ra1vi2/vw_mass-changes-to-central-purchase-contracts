/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/UIComponent",
		"sap/suite/ui/generic/template/extensionAPI/ReuseComponentSupport"
	],
	function (UIComponent, ReuseComponentSupport) {
		"use strict";

		/* Private static methods used in the domain specific logic of this reuse component */
		function fnPropagateFeaturesOfExtensionAPI(oExtensionAPI, oTargetModel) {
			var sFeatures = "";
			for (var sFunctionName in oExtensionAPI) {
				if (oExtensionAPI.hasOwnProperty(sFunctionName)) {
					sFeatures += sFunctionName + "\n";
				}
			}
			oTargetModel.setProperty("/extensionAPI", sFeatures);
		}
		/* End of domain specific private static methods */

		/* Definition of the reuse component */
		return UIComponent.extend("ui.s2p.mm.cntrl.ctrmass.update.HierItemDistribution.Component", {
			metadata: {
				manifest: "json",
				library: "ui.s2p.mm.cntrl.ctrmass.update.HierItemDistribution",
				properties: {
					/* Standard properties for reuse components */

					/* UI mode accross fiori applications so the component knows in what mode the application is running 
					 * Defined in sap/suite/ui/generic/template/extensionAPI/UIMode
					 */
					uiMode: {
						type: "string",
						group: "standard"
					},
					semanticObject: {
						type: "string",
						group: "standard"
					},
					stIsAreaVisible: {
						type: "boolean",
						group: "standard"
					},
					/* Component specific properties */

					/* This is a property set for the specific use case of the response component.
					 * We assume in this example that the property must be set before the reuse component can do
					 * something meaningful.
					 */
					demoPropertyString: {
						type: "string",
						group: "specific",
						defaultValue: ""
					}
				}
			},

			// Standard life time event of a component. Used to transform this component into a reuse component for smart templates and do some initialization
			init: function () {
				ReuseComponentSupport.mixInto(this, "component");
				// Defensive call of init of the super class:
				(UIComponent.prototype.init || jQuery.noop).apply(this, arguments);
			},

			/* Override some setter-methods for properties defined for this component. This is done, since we want to programmatically react on changes of
			/* these properties.
			/* Important: Do not forget to call this.setProperty for the corresponding property to ensure that the property is really updated */

			setDemoPropertyString: function (value) {
				if (value && value !== this.getDemoPropertyString()) {
					this.setProperty("demoPropertyString", value);
				}
			},

			/* End of overridden setter-methods */

			/* Implementation of lifetime events specific for smart template components */
			/* Note that these methods are called because this component has been transformed into a reuse component */
			/* Check jsdoc of sap.suite.ui.generic.template.extensionAPI.ReuseComponentSupport for details */

			stStart: function (oModel, oBindingContext, oExtensionAPI) {
				if (this.getId() ===
					"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.Canvas.view.Canvas::to_DetailHierItem--template::ImplementingComponentContent"
				) {
					var oComponentModel = this.getComponentModel();
					oExtensionAPI.attachPageDataLoaded(this.pageLoaded.bind(this));
						this.oExtensionAPI = oExtensionAPI;
					oComponentModel.setProperty("/itemKeys", oExtensionAPI.getNavigationController().getCurrentKeys()[1]);
					this.setDemoPropertyString(oExtensionAPI.getNavigationController().getCurrentKeys()[1]);
					var canvasview = oComponentModel.getProperty("/View");
					var oSTable = canvasview.byId("HierItmDistTable");
					oSTable.rebindTable(true);
					fnPropagateFeaturesOfExtensionAPI(oExtensionAPI, oComponentModel);
				}
			},
			pageLoaded: function (oEvent) {
				var oComponentModel = this.getComponentModel();
				var canvasview = oComponentModel.getProperty("/View");
				var oSTable = canvasview.byId("HierItmDistTable");
				oSTable.getToolbar().getAggregation("content")[2].setProperty("value","");  
				oComponentModel.setProperty("/searchFlag",false);
				oSTable.rebindTable(true);
			},
			stRefresh: function (oModel, oBindingContext, oExtensionAPI) {
					if (this.getId() ===
						"ui.s2p.mm.cntrl.ctrmass.update::sap.suite.ui.generic.template.Canvas.view.Canvas::to_DetailHierItem--template::ImplementingComponentContent"
					) {
						var oComponentModel = this.getComponentModel();
						oComponentModel.setProperty("/itemKeys", oExtensionAPI.getNavigationController().getCurrentKeys()[1]);
						this.setDemoPropertyString(oExtensionAPI.getNavigationController().getCurrentKeys()[1]);
						var canvasview = oComponentModel.getProperty("/View");
						var oSTable = canvasview.byId("HierItmDistTable");
						oSTable.rebindTable(true);
					}
				}
				/* End of implementation of lifetime events specific for smart template components */
		});
	});