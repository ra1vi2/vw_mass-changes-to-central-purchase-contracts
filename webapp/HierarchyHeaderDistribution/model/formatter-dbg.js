/*
 * Copyright (C) 2009-2021 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/format/DateFormat"
], function (NumberFormat, DateFormat) {
	"use strict";
	var decimalSeparator = NumberFormat.getFloatInstance().oFormatOptions.decimalSeparator;
	var groupingSeparator = NumberFormat.getFloatInstance().oFormatOptions.groupingSeparator;
	var oNumberFormat = NumberFormat.getFloatInstance({
		maxFractionDigits: 3,
		minFractionDigits: 3,
		groupingSeparator: groupingSeparator,
		decimalSeparator: decimalSeparator
	});

	var formatter = {
		fnToggleTotalFieldBox1: function (field) {
			if (field === -1) {
				return true;
			} else {
				return false;
			}
		},
		fnTogglePercentage: function (ind, distLevel) {
			if (ind !== this.oBundleText.getText("referenceHeaderKey") && ind !== -1) {
				return false;
			} else {
				return true;
			}
		},
		
		showDocCat: function (cat, groupheader) {
			if (cat === -1 || groupheader === 1) {
				return false;
			} else {
				return true;
			}
		},
		showTotal: function (totalind) {
			if (totalind === -1) {
				return true;
			} else {
				return false;
			}
		},
		fnTogggleHeadergreyout: function (ctgry, ind, groupheader) {
			if (groupheader === 1) {
				return false;
			} else if ((ind !== -1 && ind !== this.oBundleText.getText("referenceHeaderKey"))) {
				return true;
			} else {
				return false;
			}
		},
		fnToggleTotalFieldBoxVis: function (field, delta, disttype, groupheader) {
			if (groupheader === 1) {
				return false;
			} else if (field === -1) {
				if (!disttype) {
					if (delta !== this.oBundleText.getText("delta") && delta !== 0) {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
		fnToggleTotalFieldBox2itm: function (field, ind) {
			if (ind === -1) {
				return false;
			} else if (ind !== this.oBundleText.getText("referenceHeaderKey")) {
				return false;
			} else {
				return true;
			}
		},
		fnToggleTotalFieldBox2: function (field, groupheader) {
			if (groupheader === 1) {
				return false;
			} else if (field === -1) {
				return false;
			} else if (field !== this.oBundleText.getText("referenceHeaderKey")) {
				return false;
			} else {
				return true;
			}

			// if (groupheader === 1) {
			// 	return false;
			// }	
			// else if (field === -1) {
			// 	return false;
			// } else { return true; }
		},
		fnTotalError: function (totalind, delta, flexind) {
			if (this.formatter.fnToggleTotalFieldBox1(totalind)) {
				if (!flexind) {
					if (delta !== this.oBundleText.getText("delta") && delta !== 0) {
						return "Error";
					}
				}
			}
			return "None";
		},
		fnTotalBold: function (totalind, delta, flexind, groupheader) {
			if (groupheader === 1) {
				return false;
			} else if (this.formatter.fnToggleTotalFieldBox1(totalind)) {
				if (!flexind) {
					if (delta !== this.oBundleText.getText("delta") && delta !== 0) {
						return false;
					} else {
						return true;
					}
				} else {
					return true;
				}
			}
			return false;
		},
		fnconcatIdText: function (totalind, id, text, groupheader) {
			if (totalind === -1) {
				return " ";
			} else if (groupheader === 1) {
				return " ";
			} else {
				if (text === "") {
					return id;
				} else if (id === "") {
					return text;
				} else {
					return text + " (" + id + ")";
				}
			}
		},
		fnconcatIdTextCat: function (totalind, id, text) {
			if (totalind === -1) {
				return id;
			} else if (text === "") {
				return id;
			} else if (id !== "") {
				return text + " (" + id + ")";
			} else {
				return "";
			}

		},
		fnBoldTotalField: function (field) {
			if (field === -1) {
				return "Bold";
			} else {
				return "Standard";
			}
		},

		fndecimalVisible: function (d) {
			if (d === this.oBundleText.getText("delta") || d === 0) {
				return false;
			} else {
				return true; // if value is string
			}
		},
		fnoldDistBold: function (totalind) {
			if (this.formatter.fnToggleTotalFieldBox1(totalind)) {
				return "Bold";
			} else {
				return "Standard";
			}
		},
		fndecimalwithpercent: function (d) {
			return oNumberFormat.format(d) + "%";
			//	return parseFloat(d).toFixed(3) + "%"; // if value is string
		},
		fndecimal: function (d) {
			if (d === this.oBundleText.getText("delta") || d === 0) {
				return null;
			} else if (d > 0) {
				return "(+" + oNumberFormat.format(d) + ")";
			} else {
				return "(" + oNumberFormat.format(d) + ")"; // if value is string
			}
		},
		fndecimalLocalized: function (d) {
			return oNumberFormat.format(d);
		},
		fnValidateInput: function (oldDistPerc, distype) {
			var regExpCom = /^[0-9]{0,3}(\,[0-9]{0,3})?$/;
			var regExpDot = /^[0-9]{0,3}(\.[0-9]{0,3})?$/;
			if (oldDistPerc === "") {
				return "Error";
			} else if ((regExpCom.test(oldDistPerc)) || (regExpDot.test(oldDistPerc))) {
				oldDistPerc = oldDistPerc.toString();
				oldDistPerc = oldDistPerc.replace(",", ".");
				if (parseFloat(oldDistPerc) > 100) {
					return "Error";
				} else {
					return "None";
				}

			} else {
				return "Error";
			}
		},

		fnValueStateText: function (oldDistPerc, distype) {
			var regIntCom = /^[0-9]{0,3}(\,)/;
			var regDecCom = /(\,)([0-9]{0,3})?$/;
			var regIntDot = /^[0-9]{0,3}(\.)/;
			var regDecDot = /(\.)([0-9]{0,3})?$/;
			var oldDistPercCheck;
			if (oldDistPerc) {
				oldDistPercCheck = oldDistPerc.toString();
				oldDistPercCheck = oldDistPercCheck.replace(",", ".");
			}
			if (oldDistPerc === "") {
				return this.oBundleText.getText("clearInputText");
			} else if (!(regIntCom.test(oldDistPerc) || regIntDot.test(oldDistPerc))) {
				if (parseFloat(oldDistPercCheck) > 100) {
					return this.oBundleText.getText("popOverNonflexgreaterText");
				} else {
					return this.oBundleText.getText("ErrorTextInteger");
				}
			} else if (!(regDecCom.test(oldDistPerc) || regDecDot.test(oldDistPerc))) {
				if (parseFloat(oldDistPercCheck) > 100) {
					return this.oBundleText.getText("popOverNonflexgreaterText");
				} else {
					return this.oBundleText.getText("ErrorTextDecimal");
				}
			} else if (parseFloat(oldDistPercCheck) > 100) {
				return this.oBundleText.getText("popOverNonflexgreaterText");
			} else {
				return "";
			}

		},
		fnPressActive: function (totalind, diffval, flexind) {
			if (this.formatter.fnToggleTotalFieldBox1(totalind)) {
				if (!flexind) {
					if (diffval !== this.oBundleText.getText("delta") && diffval !== 0) {
						return true;
					}
				}
				return false;
			}
			return false;

		},
		fnValueStateErrorDelta: function (totalind, val, distype) {
			if (totalind === -1) {
				if (!distype) {
					if (val === this.oBundleText.getText("delta") || val === 0) {
						return "None";
					} else {
						return "Error";
					}
				} else {
					return "None";
				}
			} else {
				return "None";
			}

		},
		
		fnToggleTotalFieldBoxVisItem: function (field, distPct, disttype) {
			if (field === -1) {
				if (!disttype) {
					if (distPct !== this.oBundleText.getText("validTotal") && distPct !== 100) {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		fnTotalErrorItem: function (totalind, distPct, flexind) {
			if (this.formatter.fnToggleTotalFieldBox1(totalind)) {
				if (!flexind) {
					if (distPct !== this.oBundleText.getText("validTotal") && distPct !== 100) {
						return "Error";
					}
				} else {
					
						return "None";

				}
			}
			return "None";
		},
		fnTotalBoldItem: function (totalind, distPct, flexind) {
			if (this.formatter.fnToggleTotalFieldBox1(totalind)) {
				if (!flexind) {
					if (distPct !== this.oBundleText.getText("validTotal") && distPct !== 100) {
						return false;
					} else {
						return true;
					}
				} else {
						return true;
				}

			}
			return false;
		},
		fnValidateInputItem: function (oldDistPerc, distype) {
			var regExpCom = /^[0-9]{0,3}(\,[0-9]{0,3})?$/;
			var regExpDot = /^[0-9]{0,3}(\.[0-9]{0,3})?$/;
			if (oldDistPerc === "") {
				return "Error";
			} else if (regExpCom.test(oldDistPerc) || regExpDot.test(oldDistPerc)) {
				oldDistPerc = oldDistPerc.toString();
				oldDistPerc = oldDistPerc.replace(",", ".");
				if (parseFloat(oldDistPerc) > 100) {
					return "Error";
				} else {
					return "None";
				}

			} else {
				return "Error";
			}

		},
		fnPressActiveItem: function (totalind, distPct, flexind) {
			if (this.formatter.fnToggleTotalFieldBox1(totalind)) {
				if (!flexind) {
					if (distPct !== this.oBundleText.getText("validTotal") && distPct !== 100) {
						return true;
					} else {
						return false;
					}
				} else {
					if (distPct < this.oBundleText.getText("validTotal") || distPct < 100) {
						return true;
					} else {
						return false;
					}
				}

			}
			return false;

		},

		fnValueStateErrorDeltaItem: function (totalind, distPct, distype) {
			if (totalind === -1) {
				if (!distype) {
					if (distPct === this.oBundleText.getText("validTotal") || distPct === 100) {
						return "None";
					} else {
						return "Error";
					}
				}
				else {
				return "None";
			}
			} else {
				return "None";
			}

		},

		fnValueStateTextItem: function (oldDistPerc, distype) {
			var regIntCom = /^[0-9]{0,3}(\,)/;
			var regDecCom = /(\,)([0-9]{0,3})?$/;
			var regIntDot = /^[0-9]{0,3}(\.)/;
			var regDecDot = /(\.)([0-9]{0,3})?$/;
			var oldDistPercCheck;
			if (oldDistPerc) {
				oldDistPercCheck = oldDistPerc.toString();
				oldDistPercCheck = oldDistPercCheck.replace(",", ".");
			}
			if (oldDistPerc === "") {
				return this.oBundleText.getText("clearInputText");
			} else if (!(regIntCom.test(oldDistPerc) || regIntDot.test(oldDistPerc))) {
				if (parseFloat(oldDistPercCheck) > 100) {
					return this.oBundleText.getText("popOverNonflexgreaterText");
				} else {
					return this.oBundleText.getText("ErrorTextInteger");
				}
			} else if (!(regDecCom.test(oldDistPerc) || regDecDot.test(oldDistPerc))) {
				if (parseFloat(oldDistPercCheck) > 100) {
					return this.oBundleText.getText("popOverNonflexgreaterText");
				} else {
					return this.oBundleText.getText("ErrorTextDecimal");
				}
			} else if (parseFloat(oldDistPercCheck) > 100) {
				return this.oBundleText.getText("popOverNonflexgreaterText");
			} else {
				return "";
			}

		},
		showTotalinGrpHdrColum: function (totalInd) {
			if (totalInd === -1) {
				return false;
			} else {
				return true;
			}
		},
		groupheaderVisible: function (groupheader) {
			if (groupheader === 1) {
				return false;
			} else {
				return true;
			}

		},
		groupheaderRowVisible: function (groupheader) {
			if (groupheader === 1) {
				return true;
			} else {
				return false;
			}
		}
	};
	return formatter;
});