define(['./ComponentButton', 'tantaman/web/widgets/BackgroundSettingsModal', 'jquery-seq/jquery-seq'],
function(ComponentButton, BackgroundSettingsModal, jquerySeq) {
	'use strict';

	return ComponentButton.extend({
		initialize: function() {
			ComponentButton.prototype.initialize.apply(this, arguments);

			this.options.ignoreErrors = true;
			this._modal = BackgroundSettingsModal.get(this.options);
			var modal = this._modal;
			this._itemImported = this._itemImported.bind(this);
		},

		_clicked: function() {
			this._modal.show(this._itemImported);
		},

		_itemImported: function(src) {
			this.options.editorModel.addComponent({
				src: src,
				type: this.options.componentType
			});
		},

		constructor: function BackgroundSettingsButton() {
			ComponentButton.prototype.constructor.apply(this, arguments);
		}
	});
})
