define(['./ComponentButton', 'tantaman/web/widgets/ItemImportModal', 'jquery-seq/jquery-seq'],
function(ComponentButton, ItemImportModal, jquerySeq) {
	'use strict';

	return ComponentButton.extend({
		initialize: function() {
			ComponentButton.prototype.initialize.apply(this, arguments);

			this.options.ignoreErrors = true;
			this._modal = ItemImportModal.get(this.options);
			var modal = this._modal;

			window.responseFlickr = document.responseFlickr = function(results){
				var thumbnails = [];

				// see http://www.flickr.com/services/api/misc.urls.html
				var url = "http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_s.jpg";
				var result = '';
				var images = [],imagesBigger = [];

				$.each(results.photos.photo, function(index, photo){
					var imageUrl = url.replace('{farm-id}', photo.farm)
						 .replace('{server-id}', photo.server)
						 .replace('{id}', photo.id) 
						 .replace('{secret}', photo.secret);

					images.push(imageUrl);
					thumbnails.push(
						'<li class="span3"><a href="#" class="thumbnail"><img src="' + imageUrl + '"/></a></li>'
					);
					if(thumbnails.length == 4 || index == results.photos.photo.length -1){
						result += '<div class="row-fluid"><ul class="thumbnails">' + thumbnails.join('') + '</ul></div>';
						thumbnails = [];
					}
				});

				var result = $(result);
				result.find('.thumbnail').click(function(){
						result.find('.thumbnail').css('border-color', '').data('selected', false);
						$(this).css('border-color', '#0088cc').data('selected', true);
						var src = $(this).find('img').attr('src').replace('_s', '_n');
						modal.src = src;
						getImages([src]);
				});
				getImages(images, function(){
					$('#itemSearchResults').html(result);
				});
			};

			$('#itemQuery').change(function(){
				$('#itemSearchResults').html('Loading ...');
				$.getScript('http://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=17ae7843136128df92d1b0421783f717&per_page=8&page=1&format=json&text=' + $('#itemQuery').val() + '&jsoncallback=responseFlickr');
			});

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

		constructor: function ImportingComponentButton() {
			ComponentButton.prototype.constructor.apply(this, arguments);
		}
	});
})
