/*
 * trailing_p.ts
 *
 * Copyright (C) 2019-20 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import { EditorState, Transaction, Selection } from 'prosemirror-state';
import { Node as ProsemirrorNode, Schema } from 'prosemirror-model';

import { Extension } from '../api/extension';
import { editingRootNode } from '../api/node';
import { FixupContext } from '../api/fixup';

const extension: Extension = {

  fixups: (schema: Schema) => {
    return [
      (tr: Transaction, context: FixupContext) => {
        if (context === FixupContext.Load) {
          if (requiresTrailingP(tr.selection)) {
            insertTrailingP(tr);
          }
        }
        return tr;
      }
    ];
  },

  appendTransaction: (schema: Schema) => {
    return [
      {
        name: 'trailing_p',
        append: (tr: Transaction) => {
          if (requiresTrailingP(tr.selection)) {
            insertTrailingP(tr);
          }
          return tr;
        }
      }
    ];
  }
};

function insertTrailingP(tr: Transaction) {
  const schema = tr.doc.type.schema;
  const editingNode = editingRootNode(tr.selection);
  if (editingNode) {
    tr.insert(
      editingNode.pos + editingNode.node.nodeSize - 1, 
      schema.nodes.paragraph.create()
    );
  }
}


function requiresTrailingP(selection: Selection) {
  const editingRoot = editingRootNode(selection);
  if (editingRoot) {
    return !isParagraphNode(editingRoot.node.lastChild);
  } else {
    return false;
  }
}

function isParagraphNode(node: ProsemirrorNode | null | undefined) {
  if (node) {
    const schema = node.type.schema;
    return node.type === schema.nodes.paragraph;
  } else {
    return false;
  }
}

export default extension;
