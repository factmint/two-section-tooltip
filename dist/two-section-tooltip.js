define(['tooltip'],
function(Tooltip) {

	var TOOLTIP_PADDING_TOP = 5;
	var TOOLTIP_PADDING_BOTTOM = 10;
	var TOOLTIP_PADDING_LEFT = 10;
	var TOOLTIP_PADDING_RIGHT = 10;
	var TOOLTIP_BORDER_RADIUS = 4;

	var GROUP_SPACING = 10;
	var TOOLTIP_LINE_HEIGHT = 1.4;

	var TEXT_SIZE_SMALL = "12px";
	var FONT_FAMILY = "'Lato', sans-serif";

	function TwoSectionTooltip(paper, colorClass) {

		Tooltip.call(this, paper, colorClass);

	}

	TwoSectionTooltip.prototype = Object.create(Tooltip.prototype);

	TwoSectionTooltip.prototype.render = function(mainText, secondaryText) {

		var paper = this._paper;
		var tmpBBox = null;

		if (this.node !== null) {
			this.remove();
		}
		this.node = paper.g();

		// Render the text
		var tooltipText;
		var tooltipText = paper.g();

		var titleText = paper.text(
			TOOLTIP_PADDING_LEFT,
			TOOLTIP_PADDING_TOP,
			mainText
		)
			.attr({
				"dy": parseInt(TEXT_SIZE_SMALL, 10),
			});
		tooltipText.append(titleText);

		if (secondaryText) {
			var valueText = paper.text(
				TOOLTIP_PADDING_LEFT + titleText.getBBox().width + GROUP_SPACING,
				TOOLTIP_PADDING_TOP,
				secondaryText
			)
				.attr({
					"dy": parseInt(TEXT_SIZE_SMALL, 10),
				});
			tooltipText.append(valueText);
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
			tmpBBox.height + TOOLTIP_PADDING_TOP + TOOLTIP_PADDING_BOTTOM - 3,
			TOOLTIP_BORDER_RADIUS
		);

		tooltipBG.addClass(this.colorClass);
		this._tooltipBG = tooltipBG;
		var tooltipBGBBox = tooltipBG.getBBox();

		if (secondaryText) {
			var tooltipBGBBox = tooltipBG.getBBox();
			this.groupBoundary = TOOLTIP_PADDING_LEFT + GROUP_SPACING + titleText.getBBox().width;

			var separator = paper.line(
				this.groupBoundary,
				0,
				this.groupBoundary,
				tooltipBGBBox.height
			)
				.attr({
					stroke: 'white'
				});
		}

		var tooltipBGOverlay = paper.rect(
			tooltipBGBBox.x,
			tooltipBGBBox.y,
			tooltipBGBBox.width,
			tooltipBGBBox.height,
			TOOLTIP_BORDER_RADIUS
		);
		var tooltipBGMask = paper.rect(
			this.groupBoundary,
			tooltipBGBBox.y,
			tooltipBGBBox.width - this.groupBoundary,
			tooltipBGBBox.height
		)
			.attr('fill', 'white');
		tooltipBGOverlay.attr('mask', tooltipBGMask);
		tooltipBGOverlay.addClass(this.colorClass + ' tint-1');


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
		this.node.append(tooltipBGOverlay);
		this.node.append(tooltipText);
		this.node.append(tooltipArrow);
		this.node.append(separator);

		this.node.addClass('fm-tooltip');

		this.hide();

		return this.node;
	};

	/**
	 * Repositions the arrow based on the tooltipPlacement
	 * @private
	 * @param {String} tooltipPlacement Can be left, right, top or bottom
	 */
	TwoSectionTooltip.prototype._positionTooltipArrow = function(tooltipPlacement) {

		var transformMatrix = Snap.matrix();
		var tooltipBGBBox = this._tooltipBG.getBBox();

		switch(tooltipPlacement){

			case "left":
				transformMatrix.translate(tooltipBGBBox.width + 4, tooltipBGBBox.height / 2);
				transformMatrix.rotate(180);
				this._tooltipArrow.transform( transformMatrix.toTransformString() );
				this._tooltipArrow.addClass('tint-1');
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

			case "topRight":
				transformMatrix.translate(this.groupBoundary / 2, tooltipBGBBox.height + 4);
				transformMatrix.rotate(-90);
				this._tooltipArrow.transform(transformMatrix.toTransformString());
				break;

			case "topLeft":
				transformMatrix.translate((tooltipBGBBox.width + this.groupBoundary) / 2, tooltipBGBBox.height + 4);
				transformMatrix.rotate(-90);
				this._tooltipArrow.transform(transformMatrix.toTransformString());
				this._tooltipArrow.addClass('tint-1');
				break;

			case "bottomRight":
				transformMatrix.translate(this.groupBoundary / 2, -4);
				transformMatrix.rotate(90);
				this._tooltipArrow.transform(transformMatrix.toTransformString());
				break;

			case "bottomLeft":
				transformMatrix.translate((tooltipBGBBox.width + this.groupBoundary) / 2, -4);
				transformMatrix.rotate(90);
				this._tooltipArrow.transform(transformMatrix.toTransformString());
				this._tooltipArrow.addClass('tint-1');
				break;

		}

		this._tooltipPlacement = tooltipPlacement;

	};

	/**
	 * Sets the position for the tooltip to go
	 * @param {Number} x								
	 * @param {Number} y								
	 * @param {String} tooltipPlacement The position for the tooltip to go
	 */
	TwoSectionTooltip.prototype.setPosition = function(x, y, tooltipPlacement) {

		if (!this.node) {
			return;
		}

		if( tooltipPlacement === undefined ){
			tooltipPlacement = this._tooltipPlacement;
		} else if(tooltipPlacement !== this._tooltipPlacement) {
			this._positionTooltipArrow(tooltipPlacement);
		}

		var tooltipArrowBBox = this._tooltipArrow.getBBox();
		var tooltipBGBBox = this._tooltipBG.getBBox();

		switch(tooltipPlacement) {

			case "left":
				x = x - tooltipArrowBBox.width - tooltipBGBBox.width;
				y = y - tooltipBGBBox.height / 2;
				break;

			case "right":
				x = x + tooltipArrowBBox.width;
				y = y - tooltipBGBBox.height / 2;
				break;

			case "top":
				x = x - tooltipBGBBox.width / 2;
				y = y - tooltipBGBBox.height - tooltipArrowBBox.height;
				break;

			case "topRight":
				x = x - this.groupBoundary / 2;
				y = y - tooltipBGBBox.height - tooltipArrowBBox.height;
				break;

			case "topLeft":
				x = x - (tooltipBGBBox.width + this.groupBoundary) / 2;
				y = y - tooltipBGBBox.height - tooltipArrowBBox.height;
				break;

			case "bottomRight":
				x = x - this.groupBoundary / 2;
				y = y + tooltipArrowBBox.height;
				break;

			case "bottomLeft":
				x = x - (tooltipBGBBox.width + this.groupBoundary) / 2;
				y = y + tooltipArrowBBox.height;
				break;

		}

		this.node.transform("T" + x + "," + y);

	};

	return TwoSectionTooltip;

});