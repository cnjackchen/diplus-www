"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*
基于: flatpickr v2.0, @license MIT 
https://flatpickr.js.org/
*/
function Flatpickr(element, config) {
	var self = this;

	function init() {
		self.element = element;
		self.originalData = element.value; // 保存原始数据用于后面判断日期时间是否被修改
		self.instanceConfig = config || {};

		self.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

		setupFormats();

		parseConfig();
		setupInputs();
		setupDates();

		setupHelperFunctions();

		self.changeMonth = changeMonth;
		self.clear = clear;
		self.close = close;
		self.destroy = destroy;
		self.formatDate = formatDate;
		self.jumpToDate = jumpToDate;
		self.open = open;
		self.parseDate = parseDate;
		self.redraw = redraw;
		self.set = set;
		self.setDate = setDate;
		self.toggle = toggle;

		if (self.isMobile && !self.config.disableMobile) {
			bind();
			setupMobile();
		} else {
			build();
			bind();
		}

		if (self.selectedDateObj) updateValue();

		triggerEvent("Ready");
	}

	function updateTime(e) {
		timeWrapper(e);
		updateValue(e);
	}

	function bind() {
		if (self.config.wrap) {
			["open", "close", "toggle", "clear"].forEach(function (el) {
				try {
					self.element.querySelector("[data-" + el + "]").addEventListener("click", self[el]);
				} catch (e) {
					//
				}
			});
		}

		if (self.isMobile && !self.config.disableMobile) return;

		document.addEventListener("keydown", onKeyDown);
		window.addEventListener("resize", debounce(onResize, 300));

		document.addEventListener("click", documentClick);
		document.addEventListener("blur", documentClick);

		if (self.config.clickOpens) (self.altInput || self.input).addEventListener("focus", open);

		if (!self.config.noCalendar) {
			self.prevMonthNav.addEventListener("click", function () {
				return changeMonth(-1);
			});
			self.nextMonthNav.addEventListener("click", function () {
				return changeMonth(1);
			});

			self.currentYearElement.addEventListener("wheel", yearScroll);
			self.currentYearElement.addEventListener("focus", function () {
				self.currentYearElement.select();
			});

			self.currentYearElement.addEventListener("input", function (event) {
				if (event.target.value.length === 4) self.currentYearElement.blur();

				self.currentYear = parseInt(event.target.value, 10) || self.currentYear;
				self.redraw();
			});

			self.days.addEventListener("click", selectDate);
		}

		if (self.config.enableTime) {
			self.timeContainer.addEventListener("wheel", updateTime);
			self.timeContainer.addEventListener("wheel", debounce(function () {
				return triggerEvent("Change");
			}, 1000));
			self.timeContainer.addEventListener("input", updateTime);

			self.hourElement.addEventListener("focus", function () {
				return self.hourElement.select();
			});
			self.minuteElement.addEventListener("focus", function () {
				return self.minuteElement.select();
			});

			if (self.secondElement) self.secondElement.addEventListener("focus", function () {
				return self.secondElement.select();
			});

			if (self.amPM) self.amPM.addEventListener("click", updateTime);
		}
	}

	function jumpToDate(jumpDate) {
		jumpDate = jumpDate ? parseDate(jumpDate) : self.selectedDateObj || self.config.defaultDate || self.config.minDate || self.now;

		self.currentYear = jumpDate.getFullYear();
		self.currentMonth = jumpDate.getMonth();
		self.redraw();
	}

	function build() {
		var fragment = document.createDocumentFragment();
		self.calendarContainer = createElement("div", "flatpickr-calendar");

		if (!self.config.noCalendar) {
			fragment.appendChild(buildMonthNav());

			if (self.config.weekNumbers) fragment.appendChild(buildWeeks());

			self.rContainer = createElement("div", "flatpickr-rContainer");
			self.rContainer.appendChild(buildWeekdays());
			self.rContainer.appendChild(buildDays());
			fragment.appendChild(self.rContainer);
		}

		if (self.config.enableTime) fragment.appendChild(buildTime());

		fragment.appendChild(buildButton());

		self.calendarContainer.appendChild(fragment);

		if (self.config.inline || self.config.static) {
			self.calendarContainer.classList.add(self.config.inline ? "inline" : "static");
			positionCalendar();
			self.element.parentNode.appendChild(self.calendarContainer);
		} else document.body.appendChild(self.calendarContainer);
	}

	function buildDays() {
		if (!self.days) {
			self.days = createElement("div", "flatpickr-days");
			self.days.tabIndex = -1;
		}

		var firstOfMonth = (new Date(self.currentYear, self.currentMonth, 1).getDay() - Flatpickr.l10n.firstDayOfWeek + 7) % 7,
		    daysInMonth = self.utils.getDaysinMonth(),
		    prevMonthDays = self.utils.getDaysinMonth((self.currentMonth - 1 + 12) % 12),
		    days = document.createDocumentFragment();

		var dayNumber = prevMonthDays + 1 - firstOfMonth,
		    currentDate = void 0,
		    dateIsDisabled = void 0;

		if (self.config.weekNumbers) self.weekNumbers.innerHTML = "";

		self.days.innerHTML = "";

		// prepend days from the ending of previous month
		for (; dayNumber <= prevMonthDays; dayNumber++) {
			var curDate = new Date(self.currentYear, self.currentMonth - 1, dayNumber, 0, 0, 0, 0, 0),
			    dateIsEnabled = isEnabled(curDate),
			    dayElem = createElement("span", "flatpickr-day prevMonthDay" + (dateIsEnabled ? "" : " disabled"), dayNumber);

			if (dateIsEnabled) dayElem.tabIndex = 0;

			days.appendChild(dayElem);
		}

		// Start at 1 since there is no 0th day
		for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
			currentDate = new Date(self.currentYear, self.currentMonth, dayNumber, 0, 0, 0, 0, 0);

			if (self.config.weekNumbers && dayNumber % 7 === 1) {
				self.weekNumbers.insertAdjacentHTML("beforeend", "<span class='disabled flatpickr-day'>" + self.getWeek(currentDate) + "</span>");
			}

			dateIsDisabled = !isEnabled(currentDate);

			var dayElement = createElement("span", dateIsDisabled ? "flatpickr-day disabled" : "flatpickr-day", dayNumber);

			if (!dateIsDisabled) {
				dayElement.tabIndex = 0;

				if (equalDates(currentDate, new Date())) dayElement.classList.add("today");

				if (self.selectedDateObj && equalDates(currentDate, self.selectedDateObj)) {
					dayElement.classList.add("selected");
					self.selectedDateElem = dayElement;
				}
			}

			days.appendChild(dayElement);
		}

		// append days from the next month
		for (var dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth; dayNum++) {
			var _curDate = new Date(self.currentYear, self.currentMonth + 1, dayNum % daysInMonth, 0, 0, 0, 0, 0),
			    _dateIsEnabled = isEnabled(_curDate),
			    _dayElement = createElement("span", "flatpickr-day nextMonthDay" + (_dateIsEnabled ? "" : " disabled"), dayNum % daysInMonth);

			if (self.config.weekNumbers && dayNum % 7 === 1) {
				self.weekNumbers.insertAdjacentHTML("beforeend", "<span class='disabled flatpickr-day'>" + self.getWeek(_curDate) + "</span>");
			}

			if (_dateIsEnabled) _dayElement.tabIndex = 0;

			days.appendChild(_dayElement);
		}
		self.days.appendChild(days);
		return self.days;
	}

	function buildMonthNav() {
		var monthNavFragment = document.createDocumentFragment();
		self.monthNav = createElement("div", "flatpickr-month");

		self.prevMonthNav = createElement("span", "flatpickr-prev-month");
		self.prevMonthNav.innerHTML = self.config.prevArrow;

		self.currentMonthElement = createElement("span", "cur_month");

		self.currentYearElement = createElement("input", "cur_year");
		self.currentYearElement.type = "number";
		self.currentYearElement.title = Flatpickr.l10n.scrollTitle;

		self.nextMonthNav = createElement("span", "flatpickr-next-month");
		self.nextMonthNav.innerHTML = self.config.nextArrow;

		self.navigationCurrentMonth = createElement("span", "flatpickr-current-month");
		self.navigationCurrentMonth.appendChild(self.currentMonthElement);
		self.navigationCurrentMonth.appendChild(self.currentYearElement);

		monthNavFragment.appendChild(self.prevMonthNav);
		monthNavFragment.appendChild(self.navigationCurrentMonth);
		monthNavFragment.appendChild(self.nextMonthNav);
		self.monthNav.appendChild(monthNavFragment);

		updateNavigationCurrentMonth();

		return self.monthNav;
	}

	function buildTime() {
		self.calendarContainer.classList.add("hasTime");
		self.timeContainer = createElement("div", "flatpickr-time");
		self.timeContainer.tabIndex = -1;
		var separator = createElement("span", "flatpickr-time-separator", ":");

		self.hourElement = createElement("input", "flatpickr-hour");
		self.minuteElement = createElement("input", "flatpickr-minute");

		self.hourElement.tabIndex = self.minuteElement.tabIndex = 0;
		self.hourElement.type = self.minuteElement.type = "number";

		self.hourElement.value = self.selectedDateObj ? pad(self.selectedDateObj.getHours()) : 12;

		self.minuteElement.value = self.selectedDateObj ? pad(self.selectedDateObj.getMinutes()) : "00";

		self.hourElement.step = self.config.hourIncrement;
		self.minuteElement.step = self.config.minuteIncrement;

		self.hourElement.min = -1;
		self.hourElement.max = 24;

		self.minuteElement.min = -self.minuteElement.step;
		self.minuteElement.max = 60;

		self.hourElement.title = self.minuteElement.title = Flatpickr.l10n.scrollTitle;

		self.timeContainer.appendChild(self.hourElement);
		self.timeContainer.appendChild(separator);
		self.timeContainer.appendChild(self.minuteElement);

		if (self.config.enableSeconds) {
			self.timeContainer.classList.add("has-seconds");

			self.secondElement = createElement("input", "flatpickr-second");
			self.secondElement.type = "number";
			self.secondElement.value = self.selectedDateObj ? pad(self.selectedDateObj.getSeconds()) : "00";

			self.secondElement.step = self.minuteElement.step;
			self.secondElement.min = self.minuteElement.min;
			self.secondElement.max = self.minuteElement.max;

			self.timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
			self.timeContainer.appendChild(self.secondElement);
		}

		return self.timeContainer;
	}
	// 增加 清空/今天/关闭 按钮
	function buildButton() {
		self.buttonContainer = createElement("div", "flatpickr-button");
		self.buttonContainer.tabIndex = -1;
		self.buttonContainer.style.padding  = "5px";
		self.buttonContainer.style.borderTop  = "1px solid #eee";
		self.buttonContainer.style.display  = "flex";
		self.buttonContainer.style.justifyContent  = "space-between";
		
		self.clearInput = createElement("span", "flatpickr-clear");
		self.clearInput.style.color = "blue";
		self.clearInput.style.cursor = "pointer";
		self.clearInput.innerHTML = Flatpickr.l10n.clearInput;
		self.clearInput.onclick = function(){clear();close()};
		self.buttonContainer.appendChild(self.clearInput);

		self.setToday = createElement("span", "flatpickr-today");
		self.setToday.style.color = "orangered";
		self.setToday.style.fontWeight = "bold";
		self.setToday.style.cursor = "pointer";
		self.setToday.innerHTML = Flatpickr.l10n.setToday;
		self.setToday.onclick = function(){setDate(new Date())};
		self.buttonContainer.appendChild(self.setToday);

		self.closeMe = createElement("span", "flatpickr-close");
		self.closeMe.style.color = "blue";
		self.closeMe.style.cursor = "pointer";
		self.closeMe.innerHTML = Flatpickr.l10n.closeMe;
		self.closeMe.onclick = function(){close()};
		self.buttonContainer.appendChild(self.closeMe);

		return self.buttonContainer;
	}

	function buildWeekdays() {
		if (!self.weekdayContainer) self.weekdayContainer = createElement("div", "flatpickr-weekdays");

		var firstDayOfWeek = Flatpickr.l10n.firstDayOfWeek;
		var weekdays = Flatpickr.l10n.weekdays.shorthand.slice();

		if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
			weekdays = [].concat(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
		}

		self.weekdayContainer.innerHTML = "<span class=flatpickr-weekday>" + weekdays.join("</span><span class=flatpickr-weekday>") + "</span>";

		return self.weekdayContainer;
	}

	function buildWeeks() {
		self.calendarContainer.classList.add("hasWeeks");
		self.weekWrapper = createElement("div", "flatpickr-weekwrapper");
		self.weekWrapper.appendChild(createElement("span", "flatpickr-weekday", Flatpickr.l10n.weekAbbreviation));
		self.weekNumbers = createElement("div", "flatpickr-weeks");
		self.weekWrapper.appendChild(self.weekNumbers);
		return self.weekWrapper;
	}

	function changeMonth(offset) {
		self.currentMonth += offset;

		handleYearChange();
		updateNavigationCurrentMonth();
		buildDays();
		(self.config.noCalendar ? self.timeContainer : self.days).focus();
	}

	function clear() {
		self.input.value = "";

		if (self.altInput) self.altInput.value = "";

		self.selectedDateObj = null;

		triggerEvent("Change");
		jumpToDate(self.now);
	}

	function close() {
		self.isOpen = false;
		self.calendarContainer.classList.remove("open");
		(self.altInput || self.input).classList.remove("active");
		if (self.input.value != self.originalData) { // 关闭后数据有变化则触发 change 事件
			__fireEvent(self.input, "change");
		}
		triggerEvent("Close");
	}

	// 触发事件 click/change/update等
	function __fireEvent(element, evtName) {
		if ("createEvent" in document) {
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(evtName, false, true);
			element.dispatchEvent(evt);
		} else {
			element.fireEvent("on" + evtName);
		}
	}

	function destroy() {
		self.calendarContainer.parentNode.removeChild(self.calendarContainer);
		self.input.value = "";
		if (self.altInput) {
			self.input.type = "text";
			self.altInput.parentNode.removeChild(self.altInput);
		}

		document.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("resize", onResize);

		document.removeEventListener("click", documentClick);
		document.removeEventListener("blur", documentClick);

		delete self.input._flatpickr;
	}

	function documentClick(e) {
		var isCalendarElement = self.calendarContainer.contains(e.target),
		    isInput = self.element.contains(e.target) || e.target === self.altInput;

		if (self.isOpen && !isCalendarElement && !isInput) self.close();
	}

	function formatDate(frmt, dateObj) {
		var chars = frmt.split("");
		return chars.map(function (c, i) {
			return self.formats[c] && chars[i - 1] !== "\\" ? self.formats[c](dateObj) : c !== "\\" ? c : "";
		}).join("");
	}

	function handleYearChange() {
		if (self.currentMonth < 0 || self.currentMonth > 11) {
			self.currentYear += self.currentMonth % 11;
			self.currentMonth = (self.currentMonth + 12) % 12;
		}
	}

	function isEnabled(dateToCheck) {
		if (self.config.minDate && dateToCheck < self.config.minDate || self.config.maxDate && dateToCheck > self.config.maxDate) return false;

		if (!self.config.enable.length && !self.config.disable.length) return true;

		dateToCheck = parseDate(dateToCheck, true); // timeless

		var bool = self.config.enable.length > 0,
		    array = bool ? self.config.enable : self.config.disable;

		var d = void 0;

		for (var i = 0; i < array.length; i++) {
			d = array[i];

			if (d instanceof Function && d(dateToCheck)) // disabled by function
				return bool;else if ((d instanceof Date || typeof d === "string") && parseDate(d, true).getTime() === dateToCheck.getTime())
				// disabled by date string
				return bool;else if ( // disabled by range
			(typeof d === "undefined" ? "undefined" : _typeof(d)) === "object" && d.hasOwnProperty("from") && dateToCheck >= parseDate(d.from) && dateToCheck <= parseDate(d.to)) return bool;
		}

		return !bool;
	}

	function onKeyDown(e) {
		if (!self.isOpen) return;

		switch (e.which) {
			case 13:
				if (self.timeContainer && self.timeContainer.contains(e.target)) updateValue(e);else selectDate(e);

				break;

			case 27:
				self.close();
				break;

			case 37:
				if (e.target !== self.input & e.target !== self.altInput) changeMonth(-1);
				break;

			case 38:
				e.preventDefault();

				if (self.timeContainer.contains(e.target)) updateTime(e);else {
					self.currentYear++;
					self.redraw();
				}

				break;

			case 39:
				if (e.target !== self.input & e.target !== self.altInput) changeMonth(1);
				break;

			case 40:
				e.preventDefault();
				if (self.timeContainer.contains(e.target)) updateTime(e);else {
					self.currentYear--;
					self.redraw();
				}

				break;

			default:
				break;
		}
	}

	function onResize() {
		if (self.isOpen && !self.config.inline && !self.config.static) positionCalendar();
	}

	function open(e) {
		self.originalData = self.input.value; // 每次打开时保存原始数据
		if (self.isMobile && !self.config.disableMobile) {
			e.preventDefault();
			e.target.blur();

			setTimeout(function () {
				self.mobileInput.click();
			}, 0);

			triggerEvent("Open");
			return;
		} else if (self.isOpen || (self.altInput || self.input).disabled || self.config.inline) return;

		self.calendarContainer.classList.add("open");

		if (!self.config.static) positionCalendar();

		self.isOpen = true;

		if (!self.config.allowInput) {
			(self.altInput || self.input).blur();
			(self.config.noCalendar ? self.timeContainer : self.selectedDateObj ? self.selectedDateElem : self.days).focus();
		}

		(self.altInput || self.input).classList.add("active");
		triggerEvent("Open");
	}

	function pad(number) {
		return ("0" + number).slice(-2);
	}

	function parseConfig() {
		self.config = self.instanceConfig;

		Object.keys(self.element.dataset).forEach(function (k) {
			return self.config[k] = typeof Flatpickr.defaultConfig[k] === "boolean" ? self.element.dataset[k] !== "false" : self.element.dataset[k];
		});

		if (!self.config.dateFormat && self.config.enableTime) {
			self.config.dateFormat = Flatpickr.defaultConfig.dateFormat;
			if (self.config.noCalendar) {
				// time picker
				self.config.dateFormat = "H:i" + (self.config.enableSeconds ? ":S" : "");
				self.config.altFormat = "h:i" + (self.config.enableSeconds ? ":S K" : " K");
			} else {
				self.config.dateFormat += " H:i" + (self.config.enableSeconds ? ":S" : "");
				self.config.altFormat = "h:i" + (self.config.enableSeconds ? ":S" : "") + " K";
			}
		}
		Object.keys(Flatpickr.defaultConfig).forEach(function (k) {
			return self.config[k] = typeof self.config[k] !== "undefined" ? self.config[k] : Flatpickr.defaultConfig[k];
		});
	}

	function parseDate(date) {
		var timeless = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		if (typeof date === "string") {
			date = date.trim();

			if (date === "today") {
				date = new Date();
				timeless = true;
			} else if (self.config.parseDate) date = self.config.parseDate(date);else if (/^\d\d:\d\d/.test(date)) {
				// time picker
				var m = date.match(/^(\d{1,2})[:\s]?(\d\d)?[:\s]?(\d\d)?/);
				date = new Date();
				date.setHours(m[1], m[2] || 0, m[2] || 0);
			} else if (/Z$/.test(date) || /GMT$/.test(date)) // datestrings w/ timezone
				date = new Date(date);else if (/(\d+)/g.test(date)) {
				var d = date.match(/(\d+)/g);
				date = new Date(d[0] + "/" + (d[1] || 1) + "/" + (d[2] || 1) + " " + (d[3] || 0) + ":" + (d[4] || 0) + ":" + (d[5] || 0));
			}
		}

		if (!(date instanceof Date) || !date.getTime()) {
			console.warn("flatpickr: invalid date " + date);
			console.info(self.element);
			return null;
		}

		if (self.config.utc && !date.fp_isUTC) date = date.fp_toUTC();

		if (timeless) date.setHours(0, 0, 0, 0);

		return date;
	}

	function positionCalendar() {
		var calendarHeight = self.calendarContainer.offsetHeight,
		    input = self.altInput || self.input,
		    inputBounds = input.getBoundingClientRect(),
		    distanceFromBottom = window.innerHeight - inputBounds.bottom + input.offsetHeight;

		var top = void 0,
		    left = window.pageXOffset + inputBounds.left;

		if (distanceFromBottom < calendarHeight) {
			top = window.pageYOffset - calendarHeight + inputBounds.top - 2;
			self.calendarContainer.classList.remove("arrowTop");
			self.calendarContainer.classList.add("arrowBottom");
		} else {
			top = window.pageYOffset + input.offsetHeight + inputBounds.top + 2;
			self.calendarContainer.classList.remove("arrowBottom");
			self.calendarContainer.classList.add("arrowTop");
		}

		if (!self.config.inline) {
			self.calendarContainer.style.top = top + "px";
			self.calendarContainer.style.left = left + "px";
		}
	}

	function redraw() {
		if (self.config.noCalendar || self.isMobile && !self.config.disableMobile) return;

		buildWeekdays();
		updateNavigationCurrentMonth();
		buildDays();
	}

	function selectDate(e) {
		e.preventDefault();
		e.stopPropagation();

		if (self.config.allowInput && (e.target === self.altInput || e.target === self.input) && e.which === 13) self.setDate((self.altInput || self.input).value);else if (e.target.classList.contains("flatpickr-day") && !e.target.classList.contains("disabled")) {
			var isPrevMonthDay = e.target.classList.contains("prevMonthDay"),
			    isNextMonthDay = e.target.classList.contains("nextMonthDay");

			if (isPrevMonthDay || isNextMonthDay) changeMonth(+isNextMonthDay - isPrevMonthDay);

			self.selectedDateObj = parseDate(new Date(self.currentYear, self.currentMonth, e.target.innerHTML));

			updateValue(e);
			buildDays();
			triggerEvent("Change");

			if (!self.config.enableTime) self.close();
		}
	}

	function set(option, value) {
		self.config[option] = value;
		jumpToDate();
	}

	function setDate(date, triggerChange) {
		date = parseDate(date);
		if (date instanceof Date && date.getTime()) {
			self.selectedDateObj = date;
			jumpToDate(self.selectedDateObj);
			updateValue(false);

			if (triggerChange) triggerEvent("Change");
		} else (self.altInput || self.input).value = "";
	}

	function setupDates() {
		self.now = new Date();

		if (self.config.defaultDate || self.input.value) self.selectedDateObj = parseDate(self.config.defaultDate || self.input.value);

		if (self.config.minDate) self.config.minDate = parseDate(self.config.minDate, true);

		if (self.config.maxDate) self.config.maxDate = parseDate(self.config.maxDate, true);

		var initialDate = self.selectedDateObj || self.config.defaultDate || self.config.minDate || new Date();

		self.currentYear = initialDate.getFullYear();
		self.currentMonth = initialDate.getMonth();
	}

	function setupFormats() {
		self.formats = {
			// weekday name, short, e.g. Thu
			D: function D(date) {
				return Flatpickr.l10n.weekdays.shorthand[self.formats.w(date)];
			},

			// full month name e.g. January
			F: function F(date) {
				return self.utils.monthToStr(self.formats.n(date) - 1, false);
			},

			// hours with leading zero e.g. 03
			H: function H(date) {
				return pad(date.getHours());
			},

			// day (1-30) with ordinal suffix e.g. 1st, 2nd
			J: function J(date) {
				return date.getDate() + Flatpickr.l10n.ordinal(date.getDate());
			},

			// AM/PM
			K: function K(date) {
				return date.getHours() > 11 ? "PM" : "AM";
			},

			// shorthand month e.g. Jan, Sep, Oct, etc
			M: function M(date) {
				return self.utils.monthToStr(date.getMonth(), true);
			},

			// seconds 00-59
			S: function S(date) {
				return pad(date.getSeconds());
			},

			// unix timestamp
			U: function U(date) {
				return date.getTime() / 1000;
			},

			// full year e.g. 2016
			Y: function Y(date) {
				return date.getFullYear();
			},

			// day in month, padded (01-30)
			d: function d(date) {
				return pad(self.formats.j(date));
			},

			// hour from 1-12 (am/pm)
			h: function h(date) {
				return date.getHours() % 12 ? date.getHours() % 12 : 12;
			},

			// minutes, padded with leading zero e.g. 09
			i: function i(date) {
				return pad(date.getMinutes());
			},

			// day in month (1-30)
			j: function j(date) {
				return date.getDate();
			},

			// weekday name, full, e.g. Thursday
			l: function l(date) {
				return Flatpickr.l10n.weekdays.longhand[self.formats.w(date)];
			},

			// padded month number (01-12)
			m: function m(date) {
				return pad(self.formats.n(date));
			},

			// the month number (1-12)
			n: function n(date) {
				return date.getMonth() + 1;
			},

			// seconds 0-59
			s: function s(date) {
				return date.getSeconds();
			},

			// number of the day of the week
			w: function w(date) {
				return date.getDay();
			},

			// last two digits of year e.g. 16 for 2016
			y: function y(date) {
				return String(self.formats.Y(date)).substring(2);
			}
		};
	}

	function setupHelperFunctions() {
		self.utils = {
			getDaysinMonth: function getDaysinMonth() {
				var month = arguments.length <= 0 || arguments[0] === undefined ? self.currentMonth : arguments[0];
				var yr = arguments.length <= 1 || arguments[1] === undefined ? self.currentYear : arguments[1];

				if (month === 1 && yr % 4 === 0 && yr % 100 !== 0 || yr % 400 === 0) return 29;
				return Flatpickr.l10n.daysInMonth[month];
			},

			monthToStr: function monthToStr(monthNumber) {
				var short = arguments.length <= 1 || arguments[1] === undefined ? self.config.shorthandCurrentMonth : arguments[1];
				return Flatpickr.l10n.months[(short ? "short" : "long") + "hand"][monthNumber];
			}
		};
	}

	function setupInputs() {
		self.input = self.config.wrap ? self.element.querySelector("[data-input]") : self.element;

		self.input.classList.add("flatpickr-input");
		if (self.config.altInput) {
			// replicate self.element
			self.altInput = createElement(self.input.nodeName, "flatpickr-input " + self.config.altInputClass);
			self.altInput.placeholder = self.input.placeholder;
			self.altInput.type = "text";

			self.input.type = "hidden";
			self.input.parentNode.insertBefore(self.altInput, self.input.nextSibling);
		}

		if (!self.config.allowInput) (self.altInput || self.input).setAttribute("readonly", "readonly");
	}

	function setupMobile() {
		var inputType = self.config.enableTime ? self.config.noCalendar ? "time" : "datetime-local" : "date";

		self.mobileInput = createElement("input", "flatpickr-input");
		self.mobileInput.step = "any";
		self.mobileInput.tabIndex = -1;
		self.mobileInput.type = inputType;

		if (self.selectedDateObj) {
			var formatStr = inputType === "datetime-local" ? "Y-m-d\\TH:i:S" : inputType === "date" ? "Y-m-d" : "H:i:S";
			var mobileFormattedDate = formatDate(formatStr, self.selectedDateObj);
			self.mobileInput.defaultValue = self.mobileInput.value = mobileFormattedDate;
		}

		if (self.config.minDate) self.mobileInput.min = formatDate("Y-m-d", self.config.minDate);

		if (self.config.maxDate) self.mobileInput.max = formatDate("Y-m-d", self.config.maxDate);

		self.input.type = "hidden";
		if (self.config.altInput) self.altInput.type = "hidden";

		try {
			self.input.parentNode.insertBefore(self.mobileInput, self.input.nextSibling);
		} catch (e) {
			//
		}

		self.mobileInput.addEventListener("change", function (e) {
			self.setDate(e.target.value);
			triggerEvent("Change");
			triggerEvent("Close");
		});
	}

	function toggle() {
		if (self.isOpen) self.close();else self.open();
	}

	function triggerEvent(event) {
		if (self.config["on" + event])
			window[self.config["on" + event]](self.selectedDateObj, self.input.value, self);
	}

	function updateNavigationCurrentMonth() {
		self.currentMonthElement.textContent = self.utils.monthToStr(self.currentMonth) + " ";
		self.currentYearElement.value = self.currentYear;
	}

	function updateValue() {
		var readTimeInput = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

		if (self.config.noCalendar && !self.selectedDateObj)
			// picking time only and method triggered from picker
			self.selectedDateObj = new Date();else if (!self.selectedDateObj) return;

		if (self.config.enableTime && !self.isMobile) {
			var hours = void 0,
			    minutes = void 0,
			    seconds = void 0;

			if (readTimeInput) {
				// update time
				hours = parseInt(self.hourElement.value, 10) || 0;

				minutes = (60 + (parseInt(self.minuteElement.value, 10) || 0)) % 60;

				if (self.config.enableSeconds) seconds = (60 + parseInt(self.secondElement.value, 10) || 0) % 60;

				self.selectedDateObj.setHours(hours, minutes, seconds || 0, 0);
			} else {
				hours = self.selectedDateObj.getHours();
				minutes = self.selectedDateObj.getMinutes();
				seconds = self.selectedDateObj.getSeconds();
			}

			self.hourElement.value = pad(hours);
			self.minuteElement.value = pad(minutes);

			if (self.secondElement !== undefined) self.secondElement.value = pad(seconds);
		}

		self.input.value = formatDate(self.config.dateFormat, self.selectedDateObj);

		if (self.altInput) self.altInput.value = formatDate(self.config.altFormat, self.selectedDateObj);

		triggerEvent("ValueUpdate");
	}

	function yearScroll(e) {
		e.preventDefault();

		var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.deltaY));
		self.currentYear = e.target.value = parseInt(e.target.value, 10) + delta;
		self.redraw();
	}

	function createElement(tag) {
		var className = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];
		var content = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];

		var e = document.createElement(tag);
		e.className = className;

		if (content) e.textContent = content;

		return e;
	}

	function debounce(func, wait, immediate) {
		var timeout = void 0;
		return function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var context = this;
			var later = function later() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (immediate && !timeout) func.apply(context, args);
		};
	}

	function equalDates(date1, date2) {
		return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
	}

	function timeWrapper(e) {
		e.preventDefault();

		//if (e && e.type !== "keydown") e.target.blur();

		if (e.target.className === "flatpickr-am-pm") {
			e.target.textContent = ["AM", "PM"][e.target.textContent === "AM" | 0];
			e.stopPropagation();
			return;
		}

		var min = parseInt(e.target.min, 10),
		    max = parseInt(e.target.max, 10),
		    step = parseInt(e.target.step, 10),
		    value = parseInt(e.target.value, 10);

		var newValue = value;

		if (e.type === "wheel") newValue = value + step * Math.max(-1, Math.min(1, e.wheelDelta || -e.deltaY));else if (e.type === "keydown") newValue = value + step * (e.which === 38 ? 1 : -1);

		if (newValue <= min) newValue = max - step;else if (newValue >= max) newValue = min + step;

		e.target.value = pad(newValue);
	}

	init();
	return self;
}

Flatpickr.defaultConfig = {
	/* if true, dates will be parsed, formatted, and displayed in UTC.
 preloading date strings w/ timezones is recommended but not necessary */
	utc: false,

	// wrap: see https://chmln.github.io/flatpickr/#strap
	wrap: false,

	// enables week numbers
	weekNumbers: false,

	allowInput: false,

	/*
 	clicking on input opens the date(time)picker.
 	disable if you wish to open the calendar manually with .open()
 */
	clickOpens: true,

	// enables the time picker functionality
	enableTime: false,

	// noCalendar: true will hide the calendar. use for a time picker along w/ enableTime
	noCalendar: false,

	// more date format chars at https://chmln.github.io/flatpickr/#dateformat
	dateFormat: "Y-m-d",

	// altInput - see https://chmln.github.io/flatpickr/#altinput
	altInput: null,

	// the created altInput element will have this class.
	altInputClass: "",

	// same as dateFormat, but for altInput
	altFormat: "F j, Y", // defaults to e.g. June 10, 2016

	// defaultDate - either a datestring or a date object. used for datetimepicker"s initial value
	defaultDate: null,

	// the minimum date that user can pick (inclusive)
	minDate: null,

	// the maximum date that user can pick (inclusive)
	maxDate: null,

	// dateparser that transforms a given string to a date object
	parseDate: null,

	// see https://chmln.github.io/flatpickr/#disable
	enable: [],

	// see https://chmln.github.io/flatpickr/#disable
	disable: [],

	// display the short version of month names - e.g. Sep instead of September
	shorthandCurrentMonth: false,

	// displays calendar inline. see https://chmln.github.io/flatpickr/#inline-calendar
	inline: false,

	// position calendar inside wrapper and next to the input element
	// leave at false unless you know what you"re doing
	static: false,

	// code for previous/next icons. this is where you put your custom icon code e.g. fontawesome
	prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
	nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",

	// enables seconds in the time picker
	enableSeconds: false,

	// step size used when scrolling/incrementing the hour element
	hourIncrement: 1,

	// step size used when scrolling/incrementing the minute element
	minuteIncrement: 5,

	// disable native mobile datetime input support
	disableMobile: false,

	// onChange callback when user selects a date or time
	onChange: null, // function (dateObj, dateStr) {}

	// called every time calendar is opened
	onOpen: null, // function (dateObj, dateStr) {}

	// called every time calendar is closed
	onClose: null, // function (dateObj, dateStr) {}

	// called after calendar is ready
	onReady: null, // function (dateObj, dateStr) {}

	onValueUpdate: null
};

Flatpickr.l10n = {
	weekdays: {
		shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		longhand: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	},
	months: {
		shorthand: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		longhand: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
	},
	daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
	firstDayOfWeek: 0,
	ordinal: function ordinal(nth) {
		var s = nth % 100;
		if (s > 3 && s < 21) return "th";
		switch (s % 10) {
			case 1:
				return "st";
			case 2:
				return "nd";
			case 3:
				return "rd";
			default:
				return "th";
		}
	},
	weekAbbreviation: "Wk",
	scrollTitle: "Scroll to increment",
	toggleTitle: "Click to toggle",
	clearInput: "Clear",
	setToday: "Today",
	closeMe: "Close"
};

Flatpickr.localize = function (l10n) {
	Object.keys(l10n).forEach(function (k) {
		return Flatpickr.l10n[k] = l10n[k];
	});
};

function _flatpickr(nodeList, config) {
	var instances = [];
	for (var i = 0; i < nodeList.length; i++) {
		if (nodeList[i]._flatpickr) nodeList[i]._flatpickr.destroy();

		try {
			nodeList[i]._flatpickr = new Flatpickr(nodeList[i], config || {});
			instances.push(nodeList[i]._flatpickr);
		} catch (e) {
			console.warn(e, e.stack);
		}
	}

	return instances.length === 1 ? instances[0] : instances;
}

HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function (config) {
	return _flatpickr(this, config);
};

HTMLElement.prototype.flatpickr = function (config) {
	return _flatpickr([this], config);
};

if (typeof jQuery !== "undefined") {
	jQuery.fn.flatpickr = function (config) {
		return _flatpickr(this, config);
	};
}

Date.prototype.fp_incr = function (days) {
	return new Date(this.getFullYear(), this.getMonth(), this.getDate() + parseInt(days, 10));
};

Date.prototype.fp_isUTC = false;
Date.prototype.fp_toUTC = function () {
	var newDate = new Date(this.getTime() + this.getTimezoneOffset() * 60000);
	newDate.fp_isUTC = true;

	return newDate;
};

Flatpickr.prototype.getWeek = function (givenDate) {
	var date = new Date(givenDate.getTime());
	date.setHours(0, 0, 0, 0);

	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

// IE9 classList polyfill
if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== "undefined") {
	Object.defineProperty(HTMLElement.prototype, "classList", {
		get: function get() {
			var self = this;
			function update(fn) {
				return function (value) {
					var classes = self.className.split(/\s+/),
					    index = classes.indexOf(value);

					fn(classes, index, value);
					self.className = classes.join(" ");
				};
			}

			var ret = {
				add: update(function (classes, index, value) {
					~index || classes.push(value);
				}),

				remove: update(function (classes, index) {
					~index && classes.splice(index, 1);
				}),

				toggle: update(function (classes, index, value) {
					~index ? classes.splice(index, 1) : classes.push(value);
				}),

				contains: function contains(value) {
					return !!~self.className.split(/\s+/).indexOf(value);
				},

				item: function item(i) {
					return self.className.split(/\s+/)[i] || null;
				}
			};

			Object.defineProperty(ret, "length", {
				get: function get() {
					return self.className.split(/\s+/).length;
				}
			});

			return ret;
		}
	});
}

if (typeof module !== "undefined") module.exports = Flatpickr;

/*
将原css文件集成到js文件中
*/
__flatpickr_appendCss();
function __flatpickr_appendCss() {
	var css = ".flatpickr-input{cursor:pointer;z-index:1}.flatpickr-mobileInput{opacity:0;visibility:hidden;position:absolute;width:0;height:0;box-sizing:border-box;padding:0}.flatpickr-calendar{background:#fff;display:none;text-align:center;padding:0;border:1px solid #e6e6e6;font-size:90%;border-radius:3px;position:absolute;min-width:200px}.flatpickr-calendar.open{opacity:1;z-index:99999;display:inline-block}.flatpickr-calendar.inline{max-width:19rem;display:table;margin-top:2px;position:relative}.flatpickr-calendar:after,.flatpickr-calendar:before{position:absolute;display:block;pointer-events:none;border:solid transparent;content:'';height:0;width:0;left:22px}.flatpickr-month,.flatpickr-next-month i,.flatpickr-prev-month i{position:relative}.flatpickr-calendar:before{border-width:5px;margin:0 -5px}.flatpickr-calendar:after{border-width:4px;margin:0 -4px}.flatpickr-calendar.arrowTop:after,.flatpickr-calendar.arrowTop:before{bottom:100%}.flatpickr-calendar.arrowTop:before{border-bottom-color:#e6e6e6}.flatpickr-calendar.arrowTop:after{border-bottom-color:#fff}.flatpickr-calendar.arrowBottom:after,.flatpickr-calendar.arrowBottom:before{top:100%}.flatpickr-calendar.arrowBottom:before{border-top-color:#e6e6e6}.flatpickr-calendar.arrowBottom:after{border-top-color:#fff}.flatpickr-month{background:0 0;color:rgba(0,0,0,.9);fill:rgba(0,0,0,.9);padding:4px 0 0;text-align:center}.flatpickr-next-month,.flatpickr-prev-month{text-decoration:none;cursor:pointer}.flatpickr-next-month svg,.flatpickr-prev-month svg{width:14px;position:absolute;top:9px}.flatpickr-next-month svg path,.flatpickr-prev-month svg path{fill:inherit}.flatpickr-next-month svg:hover,.flatpickr-prev-month svg:hover{fill:#f99595}.flatpickr-next-month:hover,.flatpickr-prev-month:hover{color:#f99595}.flatpickr-prev-month svg{left:5px}.flatpickr-next-month svg{right:5px}.flatpickr-current-month{font-size:135%;font-weight:300;color:inherit;position:relative;display:inline-block}.flatpickr-current-month .cur_month{font-weight:700;color:inherit}.flatpickr-current-month .cur_year{background:0 0;box-sizing:border-box;color:inherit;cursor:default;padding:0;margin:0;width:3.2em;display:inline;font-size:inherit;font-weight:300;line-height:inherit;height:initial;border:0}.flatpickr-current-month .cur_year:hover{background:rgba(0,0,0,.05)}.flatpickr-weekdays{background:0 0;text-align:center;overflow:hidden}.flatpickr-days{padding-top:1px;outline:0}.flatpickr-day{background:0 0;border:1px solid transparent;border-radius:150px;box-sizing:border-box;color:#393939;cursor:pointer;display:inline-block;font-weight:300;width:35px;height:35px;line-height:35px;margin:0;text-align:center}.flatpickr-day.nextMonthDay:focus,.flatpickr-day.nextMonthDay:hover,.flatpickr-day.prevMonthDay:focus,.flatpickr-day.prevMonthDay:hover,.flatpickr-day:focus,.flatpickr-day:hover{cursor:pointer;outline:0;background:#e6e6e6;border-color:#e6e6e6}.flatpickr-day.today{border-color:#f99595}.flatpickr-day.today:focus,.flatpickr-day.today:hover{border-color:#f99595;background:#f99595;color:#fff}.flatpickr-day.selected,.flatpickr-day.selected:focus,.flatpickr-day.selected:hover{background:#446cb3;color:#fff;border-color:#446cb3}.flatpickr-day.disabled,.flatpickr-day.disabled:hover,.flatpickr-day.nextMonthDay,.flatpickr-day.prevMonthDay{color:rgba(57,57,57,.3);background:0 0;border-color:transparent;cursor:default}span.flatpickr-weekday{cursor:default;font-size:90%;color:rgba(0,0,0,.54);height:24px;line-height:24px;margin:0;background:0 0;text-align:center;display:block;float:left;width:14.28%;font-weight:700}.flatpickr-weekwrapper{display:inline-block;float:left}.flatpickr-weekwrapper .flatpickr-weeks{padding:0 .25rem;border-right:1px solid #e6e6e6}.flatpickr-weekwrapper .flatpickr-weekday{float:none;width:100%}.flatpickr-weekwrapper span.flatpickr-day{display:block;width:100%}.flatpickr-rContainer{display:inline-block;max-width:249px}.flatpickr-time{overflow:auto;text-align:center;border-top:0;outline:0;display:block;display:flex}.flatpickr-am-pm,.flatpickr-time input,.flatpickr-time-separator{height:38px;display:inline-block;line-height:38px;color:#393939}.flatpickr-time input{background:0 0;box-shadow:none;border:0;border-radius:0;flex:1;width:33%;min-width:33%;text-align:center;margin:0;padding:0;cursor:pointer;font-weight:700}.flatpickr-am-pm:focus,.flatpickr-am-pm:hover,.flatpickr-time input:focus,.flatpickr-time input:hover{background:#f0f0f0}.flatpickr-time input.flatpickr-minute{width:26%;font-weight:300}.flatpickr-time input.flatpickr-second{font-weight:300}.flatpickr-time input:focus{outline:0;border:0}.flatpickr-time.has-seconds input[type=number]{width:25%;min-width:25%}.hasTime .flatpickr-days,.hasWeeks .flatpickr-days{border-bottom:0;border-bottom-right-radius:0;border-bottom-left-radius:0}.hasWeeks .flatpickr-days{border-left:0}.flatpickr-rContainer+.flatpickr-time{border-top:1px solid #e6e6e6}.flatpickr-am-pm{outline:0;width:21%;padding:0 2%;cursor:pointer;text-align:left;font-weight:300}@media all and (-ms-high-contrast:none){.flatpickr-month{padding:0}}";
	var style = document.createElement('style');
	style.type="text/css";
	if(style.styleSheet) // IE does it this way
		style.styleSheet.cssText = css;
	else // other browsers
		style.appendChild(document.createTextNode(css));
	document.getElementsByTagName("head")[0].appendChild(style);
}

/*
locals for flatpickr 
以下是本地化和自定义部分
*/
Flatpickr.l10n.weekdays = {
	shorthand: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
	longhand: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
};

Flatpickr.l10n.months = {
	shorthand: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
	longhand: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
};
Flatpickr.l10n.firstDayOfWeek = 1;
Flatpickr.l10n.scrollTitle = "- 鼠标滚轮 +";
Flatpickr.l10n.toggleTitle = "点击切换";
Flatpickr.l10n.clearInput = "清空";
Flatpickr.l10n.setToday = "今天";
Flatpickr.l10n.closeMe = "关闭";


// 激活所有class为 flatpickr 的 input，作为 datetime-picker
window.addEventListener('load', function() {
	var inputs = document.querySelectorAll(".flatpickr");
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].readOnly) continue; // 忽略只读的input
		inputs[i].flatpickr();
	}
});
