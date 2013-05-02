define(['libs/backbone',
		'strut/slide_snapshot/SlideSnapshot',
		'strut/new_slide_button/NewSlideButton',
		'common/Throttler',
		'./WellContextMenu',
		'tantaman/web/interactions/Sortable',
		'strut/editor/GlobalEvents',
		'css!styles/slide_editor/slideWell.css'],
function(Backbone, SlideSnapshot, NewSlideButton, Throttler, WellContextMenu, Sortable, GlobalEvents, empty) {
	'use strict';

	return Backbone.View.extend({
		events: {
			mousemove: '_showContextMenu',
			mouseleave: '_hideContextMenu',
			destroyed: 'dispose',
			mousedown: '_focused'
		},

		className: 'slideWell',

		initialize: function() {
			this._deck.on('slideAdded', this._slideAdded, this);
			this._deck.on('slidesReset', this._slidesReset, this);
			this._doShowContextMenu = this._doShowContextMenu.bind(this);
			this._throttler = new Throttler(100);
			this._contextMenu = new WellContextMenu(this._editorModel);
			this._contextMenu.render();
			this.$slides = $('<div>');
			this._sortable = new Sortable({
				container: this.$slides,
				selector: '> .slideSnapshot',
				scrollParent: this.$el[0]
			});

			this._sortable.on('sortstop', this._sortStopped, this);

			GlobalEvents.on('cut', this._cut, this);
			GlobalEvents.on('copy', this._copy, this);
			GlobalEvents.on('paste', this._paste, this);

			this._clipboard = this._editorModel.clipboard;
		},

		_focused: function() {
			this._editorModel.set('scope', 'slideWell');
		},

		_cut: function() {
			if (this._editorModel.get('scope') == 'slideWell') {
				var slide = this._deck.get('activeSlide');
				this._deck.removeSlide(slide);
				this._clipboard.item = slide.clone();
				slide.dispose();
			}
		},

		_copy: function() {
			if (this._editorModel.get('scope') == 'slideWell') {
				var slide = this._deck.get('activeSlide');
				this._clipboard.item = slide;
			}
		},

		_paste: function() {
			var item = this._clipboard.item;
			if (item != null && item.type == 'slide')
				this._deck.addSlide(item.clone());

			// TODO: scroll to the new item...
		},

		_sortStopped: function(startIndex, endIndex) {
			this._deck.moveSlide(startIndex, endIndex);
		},

		_showContextMenu: function(e) {
			//if (e.target != this.$el[0]) return;
			this._throttler.submit(this._doShowContextMenu, {
				rejectionPolicy: 'runLast',
				arguments: [e]
			});
		},

		_hideContextMenu: function(e) {
			if (e.target == this.$el[0]) {
				this._throttler.cancel();
				this._contextMenu.hide();
			}
		},

		_doShowContextMenu: function(e) {
			var offsetY = e.pageY - this.$slides.position().top;
			// if (offsetY == null)
				// offsetY = e.originalEvent.layerY;

			var newPos = (((offsetY+40) / 112) | 0) * 112 - 5;
			this._contextMenu.slideIndex(Math.ceil(newPos / 112));
			this._contextMenu.reposition({x: this.$slides.width() / 2 - this._contextMenu.$el.outerWidth() / 2, y: newPos, slidesCount: this.$slides.find('.slideSnapshot').length});
		},

		_slidesReset: function(newSlides) {
			var i = 0;
			newSlides.forEach(function(slide) {
				this._slideAdded(slide, i);
				i += 1;
			}, this);

			if(!$('.newSlideButton').length){
				this.$slides.parent().append((new NewSlideButton({editor: this})).render().$el);
			}
		},

		_slideAdded: function(slide, index) {
			// Append it in the correct position in the well
      		var snapshot = new SlideSnapshot({model: slide, deck: this._deck, registry: this._registry});
      		if (index == 0) {
        		this.$slides.prepend(snapshot.render().$el);
      		} else {
        		var $slides = $('.slideSnapshot');
        		if (index >= $slides.length) {
          			this.$slides.append(snapshot.render().$el);
        		} else {
          			$($slides[index]).before(snapshot.render().$el);
        		}
      		}
		},

		render: function() {
			this.$slides.html('');
			this.$el.html(this.$slides);
			this._deck.get('slides').forEach(function(slide) {
				var snapshot = new SlideSnapshot({model: slide, deck: this._deck, registry: this._registry});
				this.$slides.append(snapshot.render().$el);
			}, this);
			this.$el.append(this._contextMenu.$el);
			return this;
		},

		dispose: function() {
			console.log('DISPOING WELL');
			this._deck.off(null, null, this);
			this._contextMenu.dispose();
			this._sortable.dispose();
			GlobalEvents.off(null, null, this);
		},

		constructor: function SlideWell(editorModel) {
			this._deck = editorModel.deck();
			this._registry = editorModel.registry;
			this._editorModel = editorModel;
			Backbone.View.prototype.constructor.call(this);
		}
	});
});
