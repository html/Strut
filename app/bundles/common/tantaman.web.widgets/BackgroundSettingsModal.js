/*
@author Matt Crinklaw-Vogt
*/
define(['libs/backbone'], function(Backbone) {
  var modalCache = {};

  var Modal = Backbone.View.extend({
    className: "itemGrabber modal hide BackgroundSettings",
    events: {
      "click div[data-option='browse']": "browseClicked",
      "hidden": "hidden"
    },
    initialize: function() {
    },
    show: function(cb) {
      this.cb = cb;
			var editorModel = this.options.editorModel;

			var $colorChooser = $('.colorpicker-holder');
			var hex = 'FFFFFF';
			var el = this.el;

			var updateSliderColor = function(hex){
					hex = '#' + hex.replace(/^#/, '');
					editorModel.setSlidesBackground(hex);
					$('.slideContainer').css('background', hex);
					$('.slideSnapshot').css('background', hex);
			};

			this.color = editorModel.get('background');
			if(!this.color){
				this.color = "#FFFFFF";
			}
			var th = this;

			picker = $colorChooser.ColorPicker({
				flat: true,
				'color': this.color,
				onSubmit: function(){
					$(el).modal('hide');
					th.color = null;
				},
				onCancel: function(){
					updateSliderColor(th.color);
					$colorChooser.find('div:first').show();
					$(el).modal('hide');
					th.color = null;
				},
				onChange: function (hsb, hex, rgb) {
					updateSliderColor(hex);
				}
			});

      return this.$el.modal('show');
    },
    browseClicked: function() {
      return this.$el.find('input[type="file"]').click();
    },
    hidden: function() {
      if (this.$input != null) {
        return this.$input.val("");
      }
    },
    render: function() {
      var _this = this;
      this.$el.html(JST["tantaman.web.widgets/BackgroundSettingsModal"](this.options));
      this.$el.modal();
      this.$el.modal("hide");
      this.item = this.$el.find(this.options.tag)[0];

      return this.$el;
    },
    constructor: function BackgroundSettingsModal() {
		Backbone.View.prototype.constructor.apply(this, arguments);
	}
  });

  return {
    get: function(options) {
      var previous = modalCache[options.tag];

      if (!previous) {
        previous = new Modal(options);
        previous.$el.bind('destroyed', function() {
          delete modalCache[options.tag];
        });

        modalCache[options.tag] = previous;

        previous.render();
        $('#modals').append(previous.$el);
      }

      return previous;
    },

    ctor: Modal
  };
});
