define(["./AbstractDrawer"], function(AbstractDrawer) {
    var TextBoxDrawer, newlineReg, spaceReg;
    newlineReg = /<[^>]+>|<\/[^>]+>/;
    spaceReg = /&nbsp;/g;
    return TextBoxDrawer = (function(_super) {

      __extends(TextBoxDrawer, _super);

      function TextBoxDrawer(g2d) {
        AbstractDrawer.apply(this, arguments);
        this.g2d = g2d;
      }

      TextBoxDrawer.prototype.paint = function(textBox) {
        var bbox, cnt, lineHeight, lines, text, txtWidth,
          _this = this;
        this.g2d.fillStyle = "#" + textBox.get("color");
        lineHeight = textBox.get("size") * this.scale.y;
        this.g2d.font = lineHeight + "px " + textBox.get("family");
        text = this._convertSpaces(textBox.get("text"));
        lines = this._extractLines(text);
        txtWidth = this._findWidestWidth(lines) * this.scale.x;
        bbox = {
          x: textBox.get("x") * this.scale.x,
          y: textBox.get("y") * this.scale.y,
          width: txtWidth + txtWidth,
          height: textBox.get("size") * this.scale.y
        };
        this.applyTransforms(textBox, bbox);
        cnt = 0;
        return lines.forEach(function(line) {
          if (line !== "") {
            _this.g2d.fillText(line, bbox.x, bbox.y + bbox.height + cnt * lineHeight);
            return ++cnt;
          }
        });
      };

      TextBoxDrawer.prototype._extractLines = function(text) {
        return text.split(newlineReg);
      };

      TextBoxDrawer.prototype._convertSpaces = function(text) {
        return text.replace(spaceReg, " ");
      };

      TextBoxDrawer.prototype._findWidestWidth = function(lines) {
        var widestWidth,
          _this = this;
        widestWidth = 0;
        lines.forEach(function(line) {
          var width;
          width = _this.g2d.measureText(line).width;
          if (width > widestWidth) {
            return widestWidth = width;
          }
        });
        return widestWidth;
      };

      return TextBoxDrawer;

    })(AbstractDrawer);
  });
