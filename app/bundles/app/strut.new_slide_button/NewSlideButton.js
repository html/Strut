define(['libs/backbone'],
function(Backbone) {
	'use strict';

	return Backbone.View.extend({
		className: 'newSlideButton',
		events: {
			'click': '_clicked',
            'mousemove': '_mouseover'
		},

		initialize: function(opts) {
            this.editor = opts.editor;
			this._template = JST['strut.new_slide_button/NewSlideButton'];
		},

        _mouseover: function(e){
            this.editor._throttler.cancel();
            this.editor._contextMenu.hide();
        },

		_clicked: function() {
            this.editor._editorModel.addSlide(
              this.editor._editorModel.slides().length -1 
            );
		},

		remove: function(removeModel) {
			this._slideDrawer.dispose();
			this.off();
			this.$el.data('jsView', null);
			this.model.off(null, null, this);
			this.options.deck.off(null, null, this);
			Backbone.View.prototype.remove.apply(this, arguments);

			if (removeModel)
				this.options.deck.removeSlide(this.model);
		},

		render: function() {
			this.$el.html(this._template({}));
              return this;
			if (this._slideDrawer)
				this._slideDrawer.dispose();

			var g2d = this.$el.find('canvas')[0].getContext('2d');
			this._slideDrawer = new SlideDrawer(this.model, g2d, this.options.registry);
			var self = this;
			setTimeout(function() {
				self._slideDrawer.repaint();
			});

			if (this.model.get('active'))
				this.$el.addClass('active');

//			this.$el.data('js')


			return this;
		},

		constructor: function SlideSnapshot() {
			Backbone.View.prototype.constructor.apply(this, arguments);
		}
	});
});
