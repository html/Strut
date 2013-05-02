/*
@author Matt Crinklaw-Vogt
*/
define(['libs/backbone'], function(Backbone) {
  var modalCache = {};

  var Modal = Backbone.View.extend({
    className: "itemGrabber modal hide",
    events: {
      "click .ok": "okClicked",
      "click div[data-option='browse']": "browseClicked",
      "change input[type='file']": "fileChosen",
      "keyup input[name='itemUrl']": "urlChanged",
      "paste input[name='itemUrl']": "urlChanged",
      "hidden": "hidden"
    },
    initialize: function() {
      this.loadItem = _.debounce(this.loadItem.bind(this), 200);
    },
    show: function(cb) {
      this.cb = cb;
      return this.$el.modal('show');
    },
    okClicked: function() {
      if (!this.$el.find(".ok").hasClass("disabled")) {
        this.cb(this.src);
        return this.$el.modal('hide');
      }
    },
    fileChosen: function(e) {
      var f, reader,
        _this = this;
      f = e.target.files[0];
      if (!f.type.match('image.*')) {
        return;
      }
      reader = new FileReader();

			var th = this;
      reader.onload = function(e) {
				th.item2.src = e.target.result;
				return th.src = th.item.src;
      };
      return reader.readAsDataURL(f);
    },
    browseClicked: function() {
      return this.$el.find('input[type="file"]').click();
    },
    hidden: function() {
      if (this.$input != null) {
        return this.$input.val("");
      }
    },
    urlChanged: function(e) {
      if (e.which === 13) {
        this.src = this.$input.val();
        return this.okClicked();
      } else {
        this.loadItem();
      }
    },
    loadItem: function() {
      this.item.src = this.$input.val();
      return this.src = this.item.src;
    },
    _itemLoadError: function() {
      this.$el.find(".ok").addClass("disabled");
      return this.$el.find(".alert").removeClass("dispNone");
    },
    _itemLoaded: function() {
      this.$el.find(".ok").removeClass("disabled");
      return this.$el.find(".alert").addClass("dispNone");
    },
    render: function() {
      var _this = this;
      this.$el.html(JST["tantaman.web.widgets/ItemImportModal"](this.options));
      this.$el.modal();
      this.$el.modal("hide");
      this.item = this.$el.find(this.options.tag).filter('.imagePreview')[0];
      this.item2 = this.$el.find(this.options.tag).filter('.filePreview')[0];
      if (this.options.tag === "video") {
        this.$el.find(".modal-body").prepend("<div class='alert alert-success'>Supports <strong>webm & YouTube</strong>.<br/>Try out: http://www.youtube.com/watch?v=vHUsdkmr-SM</div>");
      }
      if (!this.options.ignoreErrors) {
        this.item.onerror = function() {
          return _this._itemLoadError();
        };
        this.item.onload = function() {
          return _this._itemLoaded();
        };
      }
      this.$input = this.$el.find("input[name='itemUrl']");

      return this.$el;
    },
    constructor: function ItemImportModal() {
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
