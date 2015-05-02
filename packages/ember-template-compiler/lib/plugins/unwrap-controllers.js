/**
@module ember
@submodule ember-htmlbars
*/

/**
  An HTMLBars AST transformation that unwraps any controllers
  passed into the link-to and action helpers.

  For example

  ```handlebars
  {{#link-to 'my.route' foo}} ... {{/link-to}}
  {{action 'save' foo}}
  ```

  becomes

  ```handlebars
  {{#link-to 'my.route' (-unwrap-controller foo)}} ... {{/link-to}}
  {{action 'save' (-unwrap-controller foo)}}
  ```

  The sole exception is the controller keyword, which is not unwrapped.
  As in

  ```
  {{action 'save' controller}}
  ```

  @private
  @class UnwrapControllers
*/
function UnwrapControllers(options) {
  // set later within HTMLBars to the syntax package
  this.syntax = null;
  this.options = options || {};
}

/**
  @private
  @method transform
  @param {AST} The AST to be transformed.
*/
UnwrapControllers.prototype.transform = function UnwrapProxies_transform(ast) {
  var walker = new this.syntax.Walker();
  var b = this.syntax.builders;
  var options = this.options;

  function unwrapParams(params, startIndex, line) {
    for (var i = startIndex; i < params.length; i++) {
      var param = params[i];
      if (!isControllerKeyword(param)) {
        var hash;
        if (options.debug) {
          hash = b.hash([
            b.pair('_debugModuleName', b.string(options.moduleName)),
            b.pair('_debugLine', b.number(line))
          ]);
        }
        params[i] = b.sexpr(b.path('-unwrap-controller'), [param], hash);
      }
    }
  }

  walker.visit(ast, function(node) {
    if (isBlockLinkTo(node)) {
      unwrapParams(node.params, 1, node.path.loc.start.line);
    } else if (isInlineLinkTo(node)) {
      unwrapParams(node.params, 2, node.path.loc.start.line);
    } else if (node.type === 'ElementNode') {
      for (var i = 0; i < node.modifiers.length; i++) {
        var modifier = node.modifiers[i];
        if (modifier.path.original === 'action') {
          unwrapParams(modifier.params, 1, node.loc.start.line);
        }
      }
    }
  });

  return ast;
};


function isControllerKeyword(expr) {
  return expr.type === 'PathExpression' && expr.original === 'controller';
}

function isBlockLinkTo(node) {
  return node.type === 'BlockStatement' && node.path.original === 'link-to';
}

function isInlineLinkTo(node) {
  return node.type === 'MustacheStatement' && node.path.original === 'link-to';
}

export default UnwrapControllers;
