/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/util/MockServer"],function(m){"use strict";return{init:function(){var p="localService/mockdata/";var M="/sap/opu/odata";var o=new m({rootUri:M});var r=o.getRequests();r.push({method:"GET",path:new RegExp(".*CA_FM_FEATURE_TOGGLE_STATUS_SRV/ToggleStatusSet.*"),response:function(x,u){var f=jQuery.sap.getModulePath(p)+"/GetFeaturesAsync.json";var R=jQuery.sap.sjax({url:f});var a=R.data;x.respondJSON(200,{},a);return true;}});o.setRequests(r);o.start();}};});
