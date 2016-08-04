"use strict";

const fs = require('fs');
const fse = require('fs-extra');
const debounce = require('debounce');

class FSNotifier {
  constructor(options) {
    this.ui = options.ui;
    this.targetDir = options.targetDir;
    this.sourceDir = options.sourceDir;
    this.watchDir = this.sourceDir || this.targetDir;
  }

  subscribe(notify) {
    // Debounce Notify so it's only called once, filesystem change will shoot
    // off multiple notifiers otherwise.
    this.notify = debounce(notify, 200);

    return this.initWatcher();
  }

  initWatcher() {
    return new Promise((resolve, reject) => {
      fs.watch(this.watchDir, {}, (event, filename) => {
        this.hasWatcher = true;
        if (event === 'error') {
          this.ui.writeError(`error while watching ${this.watchDir}`);
          reject(err);
        } else if (event === 'change') {
          if (this.sourceDir) {
            fse.copy(this.sourceDir, this.targetDir, (error) => {
              if (error) {
                this.ui.writeError(`error while copying ${this.sourceDir} to ${this.targetDir}`);
                reject(error);
              } else {
                this.notify();
              }
            });
          } else {
            this.notify();
          }
        }
      });

      resolve();
    });
  }
}

module.exports = FSNotifier;
