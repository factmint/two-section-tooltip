define(['multitext'],
function(multitext) {

	var TOOLTIP_OFFSET_X = 10;
	var TOOLTIP_OFFSET_Y = 20;
	var TOOLTIP_PADDING_TOP = 10;
	var TOOLTIP_PADDING_BOTTOM = 10;
	var TOOLTIP_PADDING_LEFT = 10;
	var TOOLTIP_PADDING_RIGHT = 10;
	var TOOLTIP_BORDER_RADIUS = 4;

	var TEXT_SIZE_SMALL = "12px";
	var FONT_FAMILY = "'Lato', sans-serif";

	function Tooltip(paper, colorClass) {

		this.colorClass = colorClass;
		this._paper = paper;
		this._parent = paper.node;
		this._tooltipArrow = null;
		this._tooltipBG = null;
		this._tooltipPlacement = "right";
		this._tooltipText = null;

		this.node = null;

	}

	Tooltip.prototype = {

		/**
		 * Repositions the arrow based on the tooltipPlacement
		 * @private
		 * @param {String} tooltipPlacement Can be left, right, top or bottom
		 */
		"_positionTooltipArrow": function(tooltipPlacement) {

			var transformMatrix = Snap.matrix();
			var tooltipBGBBox = this._tooltipBG.getBBox();

			switch(tooltipPlacement){

				case "left":
					transformMatrix.translate(tooltipBGBBox.width + 4, tooltipBGBBox.height / 2);
					transformMatrix.rotate(180);
					this._tooltipArrow.transform( transformMatrix.toTransformString() );
					break;

				case "right":
					transformMatrix.translate(-4, tooltipBGBBox.height / 2);
					this._tooltipArrow.transform( transformMatrix.toTransformString() );
					break;

				case "top":
					transformMatrix.translate(tooltipBGBBox.width / 2, tooltipBGBBox.height + 4);
					transformMatrix.rotate(-90);
					this._tooltipArrow.transform(transformMatrix.toTransformString());
					break;

				case "bottom":
					transformMatrix.translate(tooltipBGBBox.width / 2, -4);
					transformMatrix.rotate(90);
					this._tooltipArrow.transform(transformMatrix.toTransformString());
					break;

			}

			this._tooltipPlacement = tooltipPlacement;

		},

		/**
		 * @constructor
		 */
		"constructor": Tooltip,

		/**
		 * Hides the tooltip
		 */
		"hide": function() {
			if (!this.node) {
				return;
			}
			this.node.attr("display", "none");
		},

		/**
		 * Removes the tooltip from the dom
		 */
		"remove": function() {
			this._tooltipArrow = null;
			this._tooltipBG = null;
			this._tooltipText = null;
			this.node.remove();
			this.node = null;
		},

		/**
		 * Renders the tooltip
		 * @param {String/Number} name	
		 * @param {String/Number} value
		 */
		"render": function(title, details) {

			var paper = this._paper;
			var tmpBBox = null;

			if (this.node !== null) {
				this.remove();
			}
			this.node = paper.g();

			// Render the text
			var tooltipText;
			var isMultiLineLabel = (Object.prototype.toString.call(details) === '[object Array]') ? true : false;
			if (! isMultiLineLabel) {
				var tooltipText = paper.text(
					TOOLTIP_PADDING_LEFT,
					TOOLTIP_PADDING_TOP,
					title + ": " + details
				)
				tooltipText.attr({
					"dy": parseInt(TEXT_SIZE_SMALL, 10)
				});
			} else {
				var tooltipText = paper.g();

				var titleText = paper.text(TOOLTIP_PADDING_LEFT, TOOLTIP_PADDING_TOP, title)
				titleText.attr({
					"dy": parseInt(TEXT_SIZE_SMALL, 10),
				});
				tooltipText.append(titleText);

				var detailTitles = [];
				var detailValues = [];
				details.forEach(function(detail) {
					detailTitles.push(detail.title + ':');
					detailValues.push(detail.value);
				});

				var detailTitlesElement = paper.multitext(
					TOOLTIP_PADDING_LEFT,
					TOOLTIP_PADDING_TOP * 2 + titleText.getBBox().height,
					detailTitles.join('\n'),
					'1.2em'
				);

				var detailValuesElement = paper.multitext(
					TOOLTIP_PADDING_LEFT,
					TOOLTIP_PADDING_TOP * 2 + titleText.getBBox().height,
					detailValues.join('\n'),
					'1.2em',
					'end'
				);

				detailValuesElement.transform('t ' + (detailTitlesElement.getBBox().width + detailValuesElement.getBBox().width) + ' 0');
				
				tooltipText.append(detailTitlesElement);
				tooltipText.append(detailValuesElement);

			}

			tooltipText.attr({
				"fill": "#fff",
				"font-family": FONT_FAMILY,
				"font-size": TEXT_SIZE_SMALL
			});

			this._tooltipText = tooltipText;

			// Render the background
			tmpBBox = tooltipText.getBBox();
			var tooltipBG = paper.rect(
				0,
				0,
				tmpBBox.width + TOOLTIP_PADDING_RIGHT + TOOLTIP_PADDING_LEFT,
				tmpBBox.height + TOOLTIP_PADDING_TOP + TOOLTIP_PADDING_BOTTOM,
				TOOLTIP_BORDER_RADIUS
			);
			tooltipBG.addClass(this.colorClass);
			this._tooltipBG = tooltipBG;

			if (isMultiLineLabel) {
				titleText.transform('t ' + (tmpBBox.width / 2 - titleText.getBBox().width / 2) + ' 0');
			}

			// Render the arrow
			var tooltipArrow = paper.polygon([-3.5, 0.2, 6.5, -5, 6.5, 5]);
			var tooltipArrowMask = paper.rect(-6, -6, 11, 12).attr("fill", "#fff");
			tooltipArrow.attr({
				"mask": tooltipArrowMask
			})
				.addClass(this.colorClass);
			this._tooltipArrow = tooltipArrow;
			this._positionTooltipArrow(this._tooltipPlacement);

			// Add to the group
			this.node.append(tooltipBG);
			this.node.append(tooltipText);
			this.node.append(tooltipArrow);

			this.node.addClass('fm-tooltip');

			this.hide();

			return this.node;
		},

		/**
		 * Sets the position for the tooltip to go
		 * @param {Number} x								
		 * @param {Number} y								
		 * @param {String} tooltipPlacement The position for the tooltip to go
		 */
		"setPosition": function(x, y, tooltipPlacement) {

			if (!this.node) {
				return;
			}

			if( tooltipPlacement === undefined ){
				tooltipPlacement = this._tooltipPlacement;
			} else if(tooltipPlacement !== this._tooltipPlacement) {
				this._positionTooltipArrow(tooltipPlacement);
			}

			var tooltipArrowBBox = this._tooltipArrow.getBBox(),
					tooltipBGBBox = this._tooltipBG.getBBox();

			switch(tooltipPlacement) {

				case "left":
					x = x - tooltipArrowBBox.width - tooltipBGBBox.width - TOOLTIP_OFFSET_X;
					y = y - tooltipBGBBox.height / 2;
					break;

				case "right":
					x = x + tooltipArrowBBox.width + TOOLTIP_OFFSET_X;
					y = y - tooltipBGBBox.height / 2;
					break;
				
				case "bottom":
					x = x - tooltipBGBBox.width / 2;
					y = y + tooltipArrowBBox.height + TOOLTIP_OFFSET_Y;
					break;

				case "top":
					x = x - tooltipBGBBox.width / 2;
					y = y - tooltipBGBBox.height - tooltipArrowBBox.height - TOOLTIP_OFFSET_Y + 10;
					break;

			}

			this.node.transform("T" + x + "," + y);

		},

		/**
		 * Show the tooltip
		 */
		"show": function() {
			if (!this.node) {
				return;
			}
			this.node.parent().append(this.node);
			this.node.attr("display", "block");
		}

	};

	return Tooltip;

});