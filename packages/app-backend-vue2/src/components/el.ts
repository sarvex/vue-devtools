import { inDoc, isBrowser, target } from '@vue-devtools/shared-utils'

function createRect () {
  const rect = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    get width () { return rect.right - rect.left },
    get height () { return rect.bottom - rect.top }
  }
  return rect
}

function mergeRects (a, b) {
  if (!a.top || b.top < a.top) {
    a.top = b.top
  }
  if (!a.bottom || b.bottom > a.bottom) {
    a.bottom = b.bottom
  }
  if (!a.left || b.left < a.left) {
    a.left = b.left
  }
  if (!a.right || b.right > a.right) {
    a.right = b.right
  }
}

/**
 * Get the client rect for an instance.
 */
export function getInstanceOrVnodeRect (instance) {
  const el = instance.subTree ? instance.subTree.el : instance.$el || instance.elm

  if (!isBrowser) {
    // TODO: Find position from instance or a vnode (for functional components).

    return
  }
  if (!inDoc(el)) {
    return
  }

  if (instance._isFragment) {
    return getLegacyFragmentRect(instance)
  } else if (el.nodeType === 1) {
    return el.getBoundingClientRect()
  }
}

/**
 * Highlight a fragment instance.
 * Loop over its node range and determine its bounding box.
 */
function getLegacyFragmentRect ({ _fragmentStart, _fragmentEnd }) {
  const rect = createRect()
  util().mapNodeRange(_fragmentStart, _fragmentEnd, function (node) {
    let childRect
    if (node.nodeType === 1 || node.getBoundingClientRect) {
      childRect = node.getBoundingClientRect()
    } else if (node.nodeType === 3 && node.data.trim()) {
      childRect = getTextRect(node)
    }
    if (childRect) {
      mergeRects(rect, childRect)
    }
  })
  return rect
}

let range: Range
/**
 * Get the bounding rect for a text node using a Range.
 */
function getTextRect (node: Text) {
  if (!isBrowser) return
  if (!range) range = document.createRange()

  range.selectNode(node)

  return range.getBoundingClientRect()
}

/**
 * Get Vue's util
 */
function util () {
  return target.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue.util
}

export function findRelatedComponent (el) {
  while (!el.__vue__ && el.parentElement) {
    el = el.parentElement
  }
  return el.__vue__
}