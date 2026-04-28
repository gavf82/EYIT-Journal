/**
 * Session-level store for the last imported FileSystemFileHandle.
 *
 * FileSystemFileHandle objects cannot be serialised to localStorage, so we
 * keep them in a module-level variable that lives for the lifetime of the tab.
 * When the user imports a .db file via showOpenFilePicker the handle is stored
 * here, and the save functions check it first so they can write back to the
 * same file without showing a new "Save As" dialog.
 */

let _handle: FileSystemFileHandle | null = null;

export function setImportHandle(h: FileSystemFileHandle | null): void {
  _handle = h;
}

export function getImportHandle(): FileSystemFileHandle | null {
  return _handle;
}
