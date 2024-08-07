/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
], function () {
	"use strict";
	var formatter = {
		mandatePlant: function (itemCategory) {
			if (itemCategory === "L") {
				return true;
			} else {
				return false;
			}

		}
	};
	return formatter;
});