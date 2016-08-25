/*
 * jQuery One Page Nav Plugin
 * http://github.com/davist11/jQuery-One-Page-Nav
 *
 * Copyright (c) 2010 Trevor Davis (http://trevordavis.net)
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * @version 3.0.0
 *
 * Example usage:
 * $('#nav').onePageNav({
 *   currentClass: 'current',
 *   changeHash: false,
 *   scrollSpeed: 750
 * });
 */
(function (factory) {
  if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function( root, jQuery ) {
      if ( jQuery === undefined ) {
        // require('jQuery') returns a factory that requires window to
        // build a jQuery instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined (how jquery works)
        if ( typeof window !== 'undefined' ) {
          jQuery = require('../jquery.js');
        }
        else {
          jQuery = require('../jquery.js')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['../jquery.js'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  // our plugin constructor
	var OnePageNav = function(elem, options){
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = this.$elem.data('plugin-options');
		this.$win = $(window);
		this.sections = {};
		this.didScroll = false;
		this.$doc = $(document);
		this.docHeight = this.$doc.height();
		this.disabled = false;
	};

	// the plugin prototype
	OnePageNav.prototype = {
		defaults: {
			navItems: 'a',
			currentClass: 'current',
			changeHash: false,
			easing: 'swing',
			filter: '',
			scrollSpeed: 750,
			scrollOffset: 0,
			scrollThreshold: 0.5,
			begin: false,
			end: false,
			scrollChange: false,
			navScrollSpeed: 300
		},

		init: function() {
			// Introduce defaults that can be extended either
			// globally or using an object literal.
			this.config = $.extend({}, this.defaults, this.options, this.metadata);

			this.$nav = this.$elem.find(this.config.navItems);

			//Filter any links out of the nav
			if(this.config.filter !== '') {
				this.$nav = this.$nav.filter(this.config.filter);
			}

			//Handle clicks on the nav
			this.$nav.on('click.onePageNav', $.proxy(this.handleClick, this));

			//Get the section positions
			this.getPositions();

			//Handle scroll changes
			this.bindInterval();

			//Update the positions on resize too
			this.$win.on('resize.onePageNav', $.proxy(this.getPositions, this));

			return this;
		},

		adjustNav: function(self, $parent) {
			self.$elem.find('.' + self.config.currentClass).removeClass(self.config.currentClass);
			$parent.addClass(self.config.currentClass);

		},

		bindInterval: function() {
			var self = this;
			var docHeight;

			self.$win.on('scroll.onePageNav', function() {
				self.didScroll = true;
			});

			self.t = setInterval(function() {
				docHeight = self.$doc.height();

				//If it was scrolled
				if(self.didScroll) {
					self.didScroll = false;
					self.scrollChange();
				}

				//If the document height changes
				if(docHeight !== self.docHeight) {
					self.docHeight = docHeight;
					self.getPositions();
				}
			}, 250);
		},

		getHash: function($link) {
			return $link.attr('href').split('#')[1];
		},

		getPositions: function() {
			var self = this;
			var linkHref;
			var topPos;
			var $target;

			self.$nav.each(function() {
				linkHref = self.getHash($(this));
				$target = $('#' + linkHref);

				if($target.length) {
					topPos = $target.offset().top;
					self.sections[linkHref] = Math.round(topPos);
				}
			});
		},

		getSection: function(windowPos) {
			var returnValue = null;
			var windowHeight = Math.round(this.$win.height() * this.config.scrollThreshold);
			var endPos = this.config.endSelector ? $(this.config.endSelector).offset().top + $(this.config.endSelector).height() : null;
			for(var section in this.sections) {
				if((this.sections[section] - this.config.scrollOffset - windowHeight) < windowPos && (null === endPos || windowPos < endPos)) {
					returnValue = section;
				}
			}

			return returnValue;
		},

		handleClick: function(e) {
			e.preventDefault();
			var self = this;
			var $link = $(e.currentTarget);
			var $parent = $link.parent();
			var newLoc = '#' + self.getHash($link);
			var navInternalOffset = $parent[0].offsetTop - (self.$elem.height() / 2 - 50);

			if(!$parent.hasClass(self.config.currentClass)) {
				//Start callback
				if(self.config.begin) {
					self.config.begin();
				}

				//Change the highlighted nav item
				self.adjustNav(self, $parent);

				//Removing the auto-adjust on scroll
				self.unbindInterval();
				if (this.disabled) {

					return $('html, body').animate({
						scrollTop: this.$win.scrollTop()
					}, this.config.scrollSpeed, this.config.easing, function() {
						//Do we need to change the hash?
						if(self.config.changeHash) {
							window.location.hash = newLoc;
						}
						var backup = self.config.navScrollSpeed;
						self.config.navScrollSpeed = 1;
						self.scrollChange();
						self.config.navScrollSpeed = backup;
						//Add the auto-adjust on scroll back in
						self.bindInterval();

						//End callback
						if(self.config.end) {
							self.config.end();
						}
					});

				}
				//Scroll to the correct position
				self.scrollTo(newLoc, function() {
					//Do we need to change the hash?
					if(self.config.changeHash) {
						window.location.hash = newLoc;
					}

					self.$elem.animate({
						scrollTop: navInternalOffset
					}, self.config.navScrollSpeed, 'swing', undefined);

					//Add the auto-adjust on scroll back in
					self.bindInterval();

					//End callback
					if(self.config.end) {
						self.config.end();
					}
				});
			}

			
		},

		scrollChange: function() {
			var windowTop = this.$win.scrollTop();
			var position = this.getSection(windowTop);
			var $parent;

			//If the position is set
			if(position !== null) {
				$parent = this.$elem.find('a[href$="#' + position + '"]').parent();

				//If it's not already the current section
				if(!$parent.hasClass(this.config.currentClass)) {
					

					var navInternalOffset = $parent[0].offsetTop - (this.$elem.height() / 2 - 50);
					this.$elem.animate({
						scrollTop: navInternalOffset
					}, this.config.navScrollSpeed, 'swing', undefined);

					//Change the highlighted nav item
					this.adjustNav(this, $parent);

					//If there is a scrollChange callback
					if(this.config.scrollChange) {
						this.config.scrollChange($parent);
					}
				}
			} else {
				var $parent = this.$elem.find('.' + this.config.currentClass);
				$parent.removeClass(this.config.currentClass);
				var navInternalOffset = 0;
				var endPos = this.config.endSelector ? $(this.config.endSelector).offset().top + $(this.config.endSelector).height() : null;
				if (endPos !== null && windowTop > endPos) navInternalOffset = this.$nav.last().parent()[0].offsetTop;
				if (navInternalOffset != this.$elem.scrollTop() + this.$elem.height() - this.$nav.last().parent().height()) this.$elem.animate({
					scrollTop: navInternalOffset
				}, this.config.navScrollSpeed, 'swing', undefined);
			}
		},

		scrollTo: function(target, callback) {
			var offset = $(target).offset().top - this.config.scrollOffset + 10;

			$('html, body').animate({
				scrollTop: offset
			}, this.config.scrollSpeed, this.config.easing, callback);
		},

		unbindInterval: function() {
			clearInterval(this.t);
			this.$win.unbind('scroll.onePageNav');
		}
	};

	OnePageNav.defaults = OnePageNav.prototype.defaults;

	$.fn.onePageNav = function(options) {
		var ret = null;
		this.each(function() {
			ret = new OnePageNav(this, options).init();
		});
		if (options.unbindSelector) {
			$(options.unbindSelector).bind('DOMNodeRemoved', function(objEvent) {
          if (objEvent.target.nodeName == 'UI-VIEW') {
          	ret.unbindInterval();
          	$(options.unbindSelector).unbind('DOMNodeRemoved', arguments.callee);
          }
          
        }
      );
		}
			
		return ret;
	};
}));