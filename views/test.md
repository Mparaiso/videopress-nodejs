##Helper classes

###Contextual colors

Convey meaning through color with a handful of emphasis utility classes. These may also be applied to links and will darken on hover just like our default link styles.


    <p class="text-muted">...</p>
    <p class="text-primary">...</p>
    <p class="text-success">...</p>
    <p class="text-info">...</p>
    <p class="text-warning">...</p>
    <p class="text-danger">...</p>

###Dealing with specificity

Sometimes emphasis classes cannot be applied due to the specificity of another selector. In most cases, a sufficient workaround is to wrap your text in a <span> with the class.
Contextual backgrounds
Similar to the contextual text color classes, easily set the background of an element to any contextual class. Anchor components will darken on hover, just like the text classes.


    <p class="bg-primary">...</p>
    <p class="bg-success">...</p>
    <p class="bg-info">...</p>
    <p class="bg-warning">...</p>
    <p class="bg-danger">...</p>

###Dealing with specificity

Sometimes contextual background classes cannot be applied due to the specificity of another selector. In some cases, a sufficient workaround is to wrap your element's content in a <div> with the class.
Close icon
Use the generic close icon for dismissing content like modals and alerts.

    <button type="button" class="close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>

###Carets

Use carets to indicate dropdown functionality and direction. Note that the default caret will reverse automatically in dropup menus.


    <span class="caret"></span>

###Quick floats

Float an element to the left or right with a class. !important is included to avoid specificity issues. Classes can also be used as mixins.

    <div class="pull-left">...</div>
    <div class="pull-right">...</div>


    // Classes
    .pull-left {
      float: left !important;
    }
    .pull-right {
      float: right !important;
    }

    // Usage as mixins
    .element {
      .pull-left();
    }
    .another-element {
      .pull-right();
    }

###Not for use in navbars

To align components in navbars with utility classes, use .navbar-left or .navbar-right instead. See the navbar docs for details.

###Center content blocks

Set an element to display: block and center via margin. Available as a mixin and class.

    <div class="center-block">...</div>

    // Classes
    .center-block {
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    // Usage as mixins
    .element {
      .center-block();
    }

###Clearfix

Easily clear floats by adding .clearfix to the parent element. Utilizes the micro clearfix as popularized by Nicolas Gallagher. Can also be used as a mixin.

    <!-- Usage as a class -->
    <div class="clearfix">...</div>
    Copy
    // Mixin itself
    .clearfix() {
      &:before,
      &:after {
        content: " ";
        display: table;
      }
      &:after {
        clear: both;
      }
    }

    // Usage as a Mixin
    .element {
      .clearfix();
    }

###Showing and hiding content

Force an element to be shown or hidden (including for screen readers) with the use of .show and .hidden classes. These classes use !important to avoid specificity conflicts, just like the quick floats. They are only available for block level toggling. They can also be used as mixins.

.hide is available, but it does not always affect screen readers and is deprecated as of v3.0.1. Use .hidden or .sr-only instead.

Furthermore, .invisible can be used to toggle only the visibility of an element, meaning its display is not modified and the element can still affect the flow of the document.

    <div class="show">...</div>
    <div class="hidden">...</div>

    // Classes
    .show {
      display: block !important;
    }
    .hidden {
      display: none !important;
      visibility: hidden !important;
    }
    .invisible {
      visibility: hidden;
    }

    // Usage as mixins
    .element {
      .show();
    }
    .another-element {
      .hidden();
    }

###Screen reader and keyboard navigation content

Hide an element to all devices except screen readers with .sr-only. Combine .sr-only with .sr-only-focusable to show the element again when it's focused (e.g. by a keyboard-only user). Necessary for following accessibility best practices. Can also be used as mixins.

    <a class="sr-only sr-only-focusable" href="#content">Skip to main content</a>

    // Usage as a Mixin
    .skip-navigation {
      .sr-only();
      .sr-only-focusable();
    }

###Image replacement

Utilize the .text-hide class or mixin to help replace an element's text content with a background image.

    Copy
    <h1 class="text-hide">Custom heading</h1>
    Copy
    // Usage as a Mixin
    .heading {
      .text-hide();
    }