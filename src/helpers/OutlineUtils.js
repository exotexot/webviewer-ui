const OutlineUtils = {
  setDoc(doc) {
    this.doc = doc;
  },
  async setOutlineName(path, newName) {
    const target = await this.findPDFNetOutline(path);

    if (!target) {
      return;
    }

    await target.setTitle(newName);

    return path;
  },
  async addRootOutline(newName, pageNum) {
    const newOutline = await this.createOutline(newName, pageNum);
    const doc = await this.doc.getPDFDoc();

    await doc.addRootBookmark(newOutline);

    return '0';
  },
  async addNewOutline(newName, path, pageNum) {
    let target;

    if (path) {
      target = await this.findPDFNetOutline(path);
    } else {
      target = await this.getLastOutline();
    }

    if (!target) {
      return null;
    }

    const newOutline = await this.createOutline(newName, pageNum);
    await target.addNext(newOutline);

    return this.findPathInTree(newOutline);
  },
  createOutline(newName, pageNum) {
    const PDFNet = window.PDFNet;

    return PDFNet.runWithCleanup(async() => {
      const doc = await this.doc.getPDFDoc();
      const newOutline = await PDFNet.Bookmark.create(doc, newName);

      const page = await doc.getPage(pageNum);
      const dest = await PDFNet.Destination.createFit(page);
      newOutline.setAction(await PDFNet.Action.createGoto(dest));

      return newOutline;
    });
  },
  async deleteOutline(path) {
    const target = await this.findPDFNetOutline(path);

    if (target) {
      await target.delete();
    }

    return null;
  },
  async moveOutlineUp(path) {
    const target = await this.findPDFNetOutline(path);

    if (!target) {
      return;
    }

    const prev = await target.getPrev();
    if (!(await this.isValid(prev))) {
      return path;
    }

    const copy = await target.copy();
    await target.delete();
    await prev.addPrev(copy);

    return this.findPathInTree(copy);
  },
  async moveOutlineDown(path) {
    const target = await this.findPDFNetOutline(path);

    if (!target) {
      return path;
    }

    const next = await target.getNext();
    if (!(await this.isValid(next))) {
      return path;
    }

    const copy = await target.copy();
    await target.delete();
    await next.addNext(copy);

    return this.findPathInTree(copy);
  },
  async moveOutlineOutward(path) {
    const target = await this.findPDFNetOutline(path);

    if (!target || (await target.getIndent()) === 1) {
      return path;
    }

    const parent = await target.getParent();
    const copy = await target.copy();
    await target.delete();

    await parent.addNext(copy);

    return this.findPathInTree(copy);
  },
  async moveOutlineInward(path) {
    const target = await this.findPDFNetOutline(path);

    if (!target) {
      return path;
    }

    const prev = await target.getPrev();
    if (!(await this.isValid(prev))) {
      return path;
    }

    const copy = await target.copy();
    await target.delete();

    if (await prev.hasChildren()) {
      const lastChild = await prev.getLastChild();
      await lastChild.addNext(copy);
    } else {
      await prev.addChild(copy);
    }

    return this.findPathInTree(copy);
  },
  async getCanMoveState(path) {
    const state = { up: false, down: false, outward: false, inward: false };
    const target = await this.findPDFNetOutline(path);

    if (!target) {
      return state;
    }

    const prev = await target.getPrev();
    if (await this.isValid(prev)) {
      state.up = true;
      state.inward = true;
    }

    const next = await target.getNext();
    if (await this.isValid(next)) {
      state.down = true;
    }

    const parent = await target.getParent();
    if ((await this.isValid(parent)) && (await target.getIndent()) > 1) {
      state.outward = true;
    }

    return state;
  },
  getOutlineId(outline) {
    const name = outline.getName();
    const path = this.getPath(outline);

    return `${path}${this.getSplitter()}${name}`;
  },
  getLastOutline() {
    return window.PDFNet.runWithCleanup(async() => {
      const doc = await this.doc.getPDFDoc();
      const root = await doc.getFirstBookmark();

      let curr = root;
      while ((await this.isValid(curr)) && (await this.isValid(await curr.getNext()))) {
        curr = await curr.getNext();
      }

      return (await this.isValid(curr)) ? curr : null;
    });
  },
  async findPathInTree(target) {
    const doc = await this.doc.getPDFDoc();
    const root = await doc.getFirstBookmark();
    const queue = [];

    // add all the bookmarks in the first level to the queue
    // this includes the root bookmark and all of its siblings
    let i = 0;
    let curr = root;
    while (await this.isValid(curr)) {
      queue.push([curr, `${i}`]);
      curr = await curr.getNext();
      i++;
    }

    // start a BFS to find the target
    while (queue.length > 0) {
      const node = queue.shift();
      const [outline, path] = node;

      if (outline.id === target.id) {
        return path;
      }

      if (!(await outline.hasChildren())) {
        continue;
      }

      let childIdx = 0;
      let child = await outline.getFirstChild();
      while (await this.isValid(child)) {
        queue.push([child, `${path}${this.getSplitter()}${childIdx}`]);

        child = await child.getNext();
        childIdx++;
      }
    }

    return null;
  },
  findPDFNetOutline(path) {
    if (!path) {
      return Promise.resolve(null);
    }

    const paths = path.split(this.getSplitter());

    return window.PDFNet.runWithCleanup(async() => {
      const doc = await this.doc.getPDFDoc();
      const rootOutline = await doc.getFirstBookmark();

      let curr = rootOutline;
      for (let level = 0; level < paths.length; level++) {
        for (let i = 0; i < paths[level]; i++) {
          curr = await curr.getNext();
        }

        if (level !== paths.length - 1) {
          curr = await curr.getFirstChild();
        }
      }

      if (await this.isValid(curr)) {
        return curr;
      }

      return (await this.isValid(curr)) ? curr : null;
    });
  },
  getPath(outline) {
    const paths = [];

    let curr = outline;
    while (curr) {
      paths.push(curr.getIndex());
      curr = curr.getParent();
    }

    return paths.reverse().join(this.getSplitter());
  },
  getSplitter() {
    return '-';
  },
  async isValid(pdfnetOutline) {
    return pdfnetOutline && (await pdfnetOutline.isValid());
  },
};

export default Object.create(OutlineUtils);
