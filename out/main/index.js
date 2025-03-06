"use strict";
const electron = require("electron");
const path$1 = require("path");
const fs$1 = require("fs");
const require$$2 = require("events");
const require$$0 = require("util");
const uploadDir = path$1.join(electron.app.getPath("userData"), "uploads");
if (!fs$1.existsSync(uploadDir)) {
  fs$1.mkdirSync(uploadDir, { recursive: true });
}
function setupFileHandlers() {
  electron.ipcMain.handle("save-file", async (_, file, filename) => {
    const filePath = path$1.join(uploadDir, filename);
    await fs$1.promises.writeFile(filePath, file);
    return { filename, path: filePath };
  });
  electron.ipcMain.handle("delete-file", async (_, filePath) => {
    if (fs$1.existsSync(filePath)) {
      await fs$1.promises.unlink(filePath);
    }
  });
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var Statement$1 = {};
var formatError$1 = {};
Object.defineProperty(formatError$1, "__esModule", { value: true });
formatError$1.formatError = void 0;
function formatError(err) {
  if (err instanceof Error) {
    return err;
  }
  if (typeof err === "object") {
    const newError = new Error();
    for (let prop in err) {
      newError[prop] = err[prop];
    }
    if (err.message) {
      newError.message = err.message;
    }
    return newError;
  }
  if (typeof err === "string") {
    return new Error(err);
  }
  return new Error(err);
}
formatError$1.formatError = formatError;
Object.defineProperty(Statement$1, "__esModule", { value: true });
Statement$1.Statement = void 0;
const format_error_1$1 = formatError$1;
class Statement {
  constructor(stmt) {
    this.stmt = stmt;
  }
  /**
   * Returns the underlying sqlite3 Statement instance
   */
  getStatementInstance() {
    return this.stmt;
  }
  /**
   * Binds parameters to the prepared statement.
   *
   * Binding parameters with this function completely resets the statement object and row cursor
   * and removes all previously bound parameters, if any.
   */
  bind(...params) {
    return new Promise((resolve, reject) => {
      this.stmt.bind(...params, (err) => {
        if (err) {
          return reject((0, format_error_1$1.formatError)(err));
        }
        resolve();
      });
    });
  }
  /**
   * Resets the row cursor of the statement and preserves the parameter bindings.
   * Use this function to re-execute the same query with the same bindings.
   */
  reset() {
    return new Promise((resolve) => {
      this.stmt.reset(() => {
        resolve();
      });
    });
  }
  /**
   * Finalizes the statement. This is typically optional, but if you experience long delays before
   * the next query is executed, explicitly finalizing your statement might be necessary.
   * This might be the case when you run an exclusive query (see section Control Flow).
   * After the statement is finalized, all further function calls on that statement object
   * will throw errors.
   */
  finalize() {
    return new Promise((resolve, reject) => {
      this.stmt.finalize((err) => {
        if (err) {
          return reject((0, format_error_1$1.formatError)(err));
        }
        resolve();
      });
    });
  }
  /**
   * Binds parameters and executes the statement.
   *
   * If you specify bind parameters, they will be bound to the statement before it is executed.
   * Note that the bindings and the row cursor are reset when you specify even a single bind parameter.
   *
   * The execution behavior is identical to the Database#run method with the difference that the
   * statement will not be finalized after it is run. This means you can run it multiple times.
   *
   * @param {any} [params, ...] When the SQL statement contains placeholders, you
   * can pass them in here. They will be bound to the statement before it is
   * executed. There are three ways of passing bind parameters: directly in
   * the function's arguments, as an array, and as an object for named
   * parameters. This automatically sanitizes inputs.
   */
  run(...params) {
    return new Promise((resolve, reject) => {
      const stmt = this;
      this.stmt.run(...params, function(err) {
        if (err) {
          return reject((0, format_error_1$1.formatError)(err));
        }
        resolve({
          stmt,
          lastID: this.lastID,
          changes: this.changes
        });
      });
    });
  }
  /**
   * Binds parameters, executes the statement and retrieves the first result row.
   * The parameters are the same as the Statement#run function, with the following differences:
   *
   * Using this method can leave the database locked, as the database awaits further
   * calls to Statement#get to retrieve subsequent rows. To inform the database that you
   * are finished retrieving rows, you should either finalize (with Statement#finalize)
   * or reset (with Statement#reset) the statement.
   *
   * @param {any} [params, ...] When the SQL statement contains placeholders, you
   * can pass them in here. They will be bound to the statement before it is
   * executed. There are three ways of passing bind parameters: directly in
   * the function's arguments, as an array, and as an object for named
   * parameters. This automatically sanitizes inputs.
   */
  get(...params) {
    return new Promise((resolve, reject) => {
      this.stmt.get(...params, (err, row) => {
        if (err) {
          return reject((0, format_error_1$1.formatError)(err));
        }
        resolve(row);
      });
    });
  }
  /**
   * Binds parameters, executes the statement and calls the callback with all result rows.
   * The parameters are the same as the Statement#run function, with the following differences:
   *
   * If the result set is empty, it will resolve to an empty array, otherwise it contains an
   * object for each result row which in turn contains the values of that row.
   * Like with Statement#run, the statement will not be finalized after executing this function.
   *
   * @param {any} [params, ...] When the SQL statement contains placeholders, you
   * can pass them in here. They will be bound to the statement before it is
   * executed. There are three ways of passing bind parameters: directly in
   * the function's arguments, as an array, and as an object for named
   * parameters. This automatically sanitizes inputs.
   *
   * @see https://github.com/mapbox/node-sqlite3/wiki/API#databaseallsql-param--callback
   */
  all(...params) {
    return new Promise((resolve, reject) => {
      this.stmt.all(...params, (err, rows) => {
        if (err) {
          return reject((0, format_error_1$1.formatError)(err));
        }
        resolve(rows);
      });
    });
  }
  each(...params) {
    return new Promise((resolve, reject) => {
      const callback = params.pop();
      if (!callback || typeof callback !== "function") {
        throw new Error("sqlite: Last param of Statement#each() must be a callback function");
      }
      if (params.length > 0) {
        const positional = params.pop();
        if (typeof positional === "function") {
          throw new Error("sqlite: Statement#each() should only have a single callback defined. See readme for usage.");
        }
        params.push(positional);
      }
      this.stmt.each(...params, (err, row) => {
        if (err) {
          return callback((0, format_error_1$1.formatError)(err), null);
        }
        callback(null, row);
      }, (err, count) => {
        if (err) {
          return reject((0, format_error_1$1.formatError)(err));
        }
        resolve(count);
      });
    });
  }
}
Statement$1.Statement = Statement;
var Database$1 = {};
var migrate$1 = {};
Object.defineProperty(migrate$1, "__esModule", { value: true });
migrate$1.migrate = migrate$1.readMigrations = void 0;
const fs = fs$1;
const path = path$1;
async function readMigrations(migrationPath) {
  const migrationsPath = migrationPath || path.join(process.cwd(), "migrations");
  const location = path.resolve(migrationsPath);
  const migrationFiles = await new Promise((resolve, reject) => {
    fs.readdir(location, (err, files) => {
      if (err) {
        return reject(err);
      }
      resolve(files.map((x) => x.match(/^(\d+).(.*?)\.sql$/)).filter((x) => x !== null).map((x) => ({ id: Number(x[1]), name: x[2], filename: x[0] })).sort((a, b) => Math.sign(a.id - b.id)));
    });
  });
  if (!migrationFiles.length) {
    throw new Error(`No migration files found in '${location}'.`);
  }
  return Promise.all(migrationFiles.map((migration) => new Promise((resolve, reject) => {
    const filename = path.join(location, migration.filename);
    fs.readFile(filename, "utf-8", (err, data) => {
      if (err) {
        return reject(err);
      }
      const [up, down] = data.split(/^--\s+?down\b/im);
      const migrationData = migration;
      migrationData.up = up.replace(/^-- .*?$/gm, "").trim();
      migrationData.down = down ? down.trim() : "";
      resolve(migrationData);
    });
  })));
}
migrate$1.readMigrations = readMigrations;
async function migrate(db2, config = {}) {
  config.force = config.force || false;
  config.table = config.table || "migrations";
  const { force, table } = config;
  const migrations = config.migrations ? config.migrations : await readMigrations(config.migrationsPath);
  await db2.run(`CREATE TABLE IF NOT EXISTS "${table}" (
  id   INTEGER PRIMARY KEY,
  name TEXT    NOT NULL,
  up   TEXT    NOT NULL,
  down TEXT    NOT NULL
)`);
  let dbMigrations = await db2.all(`SELECT id, name, up, down FROM "${table}" ORDER BY id ASC`);
  const lastMigration = migrations[migrations.length - 1];
  for (const migration of dbMigrations.slice().sort((a, b) => Math.sign(b.id - a.id))) {
    if (!migrations.some((x) => x.id === migration.id) || force && migration.id === lastMigration.id) {
      await db2.run("BEGIN");
      try {
        await db2.exec(migration.down);
        await db2.run(`DELETE FROM "${table}" WHERE id = ?`, migration.id);
        await db2.run("COMMIT");
        dbMigrations = dbMigrations.filter((x) => x.id !== migration.id);
      } catch (err) {
        await db2.run("ROLLBACK");
        throw err;
      }
    } else {
      break;
    }
  }
  const lastMigrationId = dbMigrations.length ? dbMigrations[dbMigrations.length - 1].id : 0;
  for (const migration of migrations) {
    if (migration.id > lastMigrationId) {
      await db2.run("BEGIN");
      try {
        await db2.exec(migration.up);
        await db2.run(`INSERT INTO "${table}" (id, name, up, down) VALUES (?, ?, ?, ?)`, migration.id, migration.name, migration.up, migration.down);
        await db2.run("COMMIT");
      } catch (err) {
        await db2.run("ROLLBACK");
        throw err;
      }
    }
  }
}
migrate$1.migrate = migrate;
var strings = {};
Object.defineProperty(strings, "__esModule", { value: true });
strings.toSqlParams = void 0;
function toSqlParams(sql, params = []) {
  if (typeof sql === "string") {
    return {
      sql,
      params
    };
  }
  return {
    sql: sql.sql,
    params: sql.values
  };
}
strings.toSqlParams = toSqlParams;
Object.defineProperty(Database$1, "__esModule", { value: true });
Database$1.Database = void 0;
const Statement_1 = Statement$1;
const migrate_1 = migrate$1;
const strings_1 = strings;
const format_error_1 = formatError$1;
class Database {
  constructor(config) {
    this.config = config;
    this.db = null;
  }
  /**
   * Event handler when verbose mode is enabled.
   * @see https://github.com/mapbox/node-sqlite3/wiki/Debugging
   */
  on(event, listener) {
    this.db.on(event, listener);
  }
  /**
   * Returns the underlying sqlite3 Database instance
   */
  getDatabaseInstance() {
    return this.db;
  }
  /**
   * Opens the database
   */
  open() {
    return new Promise((resolve, reject) => {
      let { filename, mode, driver } = this.config;
      if (filename === null || filename === void 0) {
        throw new Error("sqlite: filename cannot be null / undefined");
      }
      if (!driver) {
        throw new Error("sqlite: driver is not defined");
      }
      if (mode) {
        this.db = new driver(filename, mode, (err) => {
          if (err) {
            return reject((0, format_error_1.formatError)(err));
          }
          resolve();
        });
      } else {
        this.db = new driver(filename, (err) => {
          if (err) {
            return reject((0, format_error_1.formatError)(err));
          }
          resolve();
        });
      }
    });
  }
  /**
   * Closes the database.
   */
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          return reject((0, format_error_1.formatError)(err));
        }
        resolve();
      });
    });
  }
  /**
   * @see https://github.com/mapbox/node-sqlite3/wiki/API#databaseconfigureoption-value
   */
  configure(option, value) {
    this.db.configure(option, value);
  }
  /**
   * Runs the SQL query with the specified parameters. It does not retrieve any result data.
   * The function returns the Database object for which it was called to allow for function chaining.
   *
   * @param {string} sql The SQL query to run.
   *
   * @param {any} [params, ...] When the SQL statement contains placeholders, you
   * can pass them in here. They will be bound to the statement before it is
   * executed. There are three ways of passing bind parameters: directly in
   * the function's arguments, as an array, and as an object for named
   * parameters. This automatically sanitizes inputs.
   *
   * @see https://github.com/mapbox/node-sqlite3/wiki/API#databaserunsql-param--callback
   */
  run(sql, ...params) {
    return new Promise((resolve, reject) => {
      const sqlObj = (0, strings_1.toSqlParams)(sql, params);
      this.db.run(sqlObj.sql, ...sqlObj.params, function(err) {
        if (err) {
          return reject((0, format_error_1.formatError)(err));
        }
        resolve({
          stmt: new Statement_1.Statement(this.stmt),
          lastID: this.lastID,
          changes: this.changes
        });
      });
    });
  }
  /**
   * Runs the SQL query with the specified parameters and resolves with
   * with the first result row afterwards. If the result set is empty, returns undefined.
   *
   * The property names correspond to the column names of the result set.
   * It is impossible to access them by column index; the only supported way is by column name.
   *
   * @param {string} sql The SQL query to run.
   *
   * @param {any} [params, ...] When the SQL statement contains placeholders, you
   * can pass them in here. They will be bound to the statement before it is
   * executed. There are three ways of passing bind parameters: directly in
   * the function's arguments, as an array, and as an object for named
   * parameters. This automatically sanitizes inputs.
   *
   * @see https://github.com/mapbox/node-sqlite3/wiki/API#databasegetsql-param--callback
   */
  get(sql, ...params) {
    return new Promise((resolve, reject) => {
      const sqlObj = (0, strings_1.toSqlParams)(sql, params);
      this.db.get(sqlObj.sql, ...sqlObj.params, (err, row) => {
        if (err) {
          return reject((0, format_error_1.formatError)(err));
        }
        resolve(row);
      });
    });
  }
  each(sql, ...params) {
    return new Promise((resolve, reject) => {
      const callback = params.pop();
      if (!callback || typeof callback !== "function") {
        throw new Error("sqlite: Last param of Database#each() must be a callback function");
      }
      if (params.length > 0) {
        const positional = params.pop();
        if (typeof positional === "function") {
          throw new Error("sqlite: Database#each() should only have a single callback defined. See readme for usage.");
        }
        params.push(positional);
      }
      const sqlObj = (0, strings_1.toSqlParams)(sql, params);
      this.db.each(sqlObj.sql, ...sqlObj.params, (err, row) => {
        if (err) {
          return callback((0, format_error_1.formatError)(err), null);
        }
        callback(null, row);
      }, (err, count) => {
        if (err) {
          return reject((0, format_error_1.formatError)(err));
        }
        resolve(count);
      });
    });
  }
  /**
   * Runs the SQL query with the specified parameters. The parameters are the same as the
   * Database#run function, with the following differences:
   *
   * If the result set is empty, it will be an empty array, otherwise it will
   * have an object for each result row which
   * in turn contains the values of that row, like the Database#get function.
   *
   * Note that it first retrieves all result rows and stores them in memory.
   * For queries that have potentially large result sets, use the Database#each
   * function to retrieve all rows or Database#prepare followed by multiple
   * Statement#get calls to retrieve a previously unknown amount of rows.
   *
   * @param {string} sql The SQL query to run.
   *
   * @param {any} [params, ...] When the SQL statement contains placeholders, you
   * can pass them in here. They will be bound to the statement before it is
   * executed. There are three ways of passing bind parameters: directly in
   * the function's arguments, as an array, and as an object for named
   * parameters. This automatically sanitizes inputs.
   *
   * @see https://github.com/mapbox/node-sqlite3/wiki/API#databaseallsql-param--callback
   */
  all(sql, ...params) {
    return new Promise((resolve, reject) => {
      const sqlObj = (0, strings_1.toSqlParams)(sql, params);
      this.db.all(sqlObj.sql, ...sqlObj.params, (err, rows) => {
        if (err) {
          return reject((0, format_error_1.formatError)(err));
        }
        resolve(rows);
      });
    });
  }
  /**
   * Runs all SQL queries in the supplied string. No result rows are retrieved. If a query fails,
   * no subsequent statements will be executed (wrap it in a transaction if you want all
   * or none to be executed).
   *
   * Note: This function will only execute statements up to the first NULL byte.
   * Comments are not allowed and will lead to runtime errors.
   *
   * @param {string} sql The SQL query to run.
   * @param {any} [params, ...] Same as the `params` parameter of `all`
   * @see https://github.com/mapbox/node-sqlite3/wiki/API#databaseexecsql-callback
   */
  exec(sql, ...params) {
    return new Promise((resolve, reject) => {
      const sqlObj = (0, strings_1.toSqlParams)(sql, params);
      this.db.exec(sqlObj.sql, (err) => {
        if (err) {
          return reject((0, format_error_1.formatError)(err));
        }
        resolve();
      });
    });
  }
  /**
   * Prepares the SQL statement and optionally binds the specified parameters.
   * When bind parameters are supplied, they are bound to the prepared statement.
   *
   * @param {string} sql The SQL query to run.
   * @param {any} [params, ...] When the SQL statement contains placeholders, you
   * can pass them in here. They will be bound to the statement before it is
   * executed. There are three ways of passing bind parameters: directly in
   * the function's arguments, as an array, and as an object for named
   * parameters. This automatically sanitizes inputs.
   * @returns Promise<Statement> Statement object
   */
  prepare(sql, ...params) {
    return new Promise((resolve, reject) => {
      const sqlObj = (0, strings_1.toSqlParams)(sql, params);
      const stmt = this.db.prepare(sqlObj.sql, ...sqlObj.params, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(new Statement_1.Statement(stmt));
      });
    });
  }
  /**
   * Loads a compiled SQLite extension into the database connection object.
   *
   * @param {string} path Filename of the extension to load
   */
  loadExtension(path2) {
    return new Promise((resolve, reject) => {
      this.db.loadExtension(path2, (err) => {
        if (err) {
          return reject((0, format_error_1.formatError)(err));
        }
        resolve();
      });
    });
  }
  /**
   * Performs a database migration.
   */
  async migrate(config) {
    await (0, migrate_1.migrate)(this, config);
  }
  /**
   * The methods underneath requires creative work to implement. PRs / proposals accepted!
   */
  /*
   * Unsure if serialize can be made into a promise.
   */
  serialize() {
    throw new Error("sqlite: Currently not implemented. Use getDatabaseInstance().serialize() instead.");
  }
  /*
   * Unsure if parallelize can be made into a promise.
   */
  parallelize() {
    throw new Error("sqlite: Currently not implemented. Use getDatabaseInstance().parallelize() instead.");
  }
}
Database$1.Database = Database;
async function open(config) {
  const db2 = new Database$1.Database(config);
  await db2.open();
  return db2;
}
var sqlite3$1 = { exports: {} };
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var bindings = { exports: {} };
var sep = path$1.sep || "/";
var fileUriToPath_1 = fileUriToPath;
function fileUriToPath(uri) {
  if ("string" != typeof uri || uri.length <= 7 || "file://" != uri.substring(0, 7)) {
    throw new TypeError("must pass in a file:// URI to convert to a file path");
  }
  var rest = decodeURI(uri.substring(7));
  var firstSlash = rest.indexOf("/");
  var host = rest.substring(0, firstSlash);
  var path2 = rest.substring(firstSlash + 1);
  if ("localhost" == host)
    host = "";
  if (host) {
    host = sep + sep + host;
  }
  path2 = path2.replace(/^(.+)\|/, "$1:");
  if (sep == "\\") {
    path2 = path2.replace(/\//g, "\\");
  }
  if (/^.+\:/.test(path2))
    ;
  else {
    path2 = sep + path2;
  }
  return host + path2;
}
(function(module, exports) {
  var fs2 = fs$1, path2 = path$1, fileURLToPath = fileUriToPath_1, join = path2.join, dirname = path2.dirname, exists = fs2.accessSync && function(path3) {
    try {
      fs2.accessSync(path3);
    } catch (e) {
      return false;
    }
    return true;
  } || fs2.existsSync || path2.existsSync, defaults = {
    arrow: process.env.NODE_BINDINGS_ARROW || " → ",
    compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
    platform: process.platform,
    arch: process.arch,
    nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
    version: process.versions.node,
    bindings: "bindings.node",
    try: [
      // node-gyp's linked version in the "build" dir
      ["module_root", "build", "bindings"],
      // node-waf and gyp_addon (a.k.a node-gyp)
      ["module_root", "build", "Debug", "bindings"],
      ["module_root", "build", "Release", "bindings"],
      // Debug files, for development (legacy behavior, remove for node v0.9)
      ["module_root", "out", "Debug", "bindings"],
      ["module_root", "Debug", "bindings"],
      // Release files, but manually compiled (legacy behavior, remove for node v0.9)
      ["module_root", "out", "Release", "bindings"],
      ["module_root", "Release", "bindings"],
      // Legacy from node-waf, node <= 0.4.x
      ["module_root", "build", "default", "bindings"],
      // Production "Release" buildtype binary (meh...)
      ["module_root", "compiled", "version", "platform", "arch", "bindings"],
      // node-qbs builds
      ["module_root", "addon-build", "release", "install-root", "bindings"],
      ["module_root", "addon-build", "debug", "install-root", "bindings"],
      ["module_root", "addon-build", "default", "install-root", "bindings"],
      // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
      ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
    ]
  };
  function bindings2(opts) {
    if (typeof opts == "string") {
      opts = { bindings: opts };
    } else if (!opts) {
      opts = {};
    }
    Object.keys(defaults).map(function(i2) {
      if (!(i2 in opts))
        opts[i2] = defaults[i2];
    });
    if (!opts.module_root) {
      opts.module_root = exports.getRoot(exports.getFileName());
    }
    if (path2.extname(opts.bindings) != ".node") {
      opts.bindings += ".node";
    }
    var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
    var tries = [], i = 0, l = opts.try.length, n, b, err;
    for (; i < l; i++) {
      n = join.apply(
        null,
        opts.try[i].map(function(p) {
          return opts[p] || p;
        })
      );
      tries.push(n);
      try {
        b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
        if (!opts.path) {
          b.path = n;
        }
        return b;
      } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND" && e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(e.message)) {
          throw e;
        }
      }
    }
    err = new Error(
      "Could not locate the bindings file. Tried:\n" + tries.map(function(a) {
        return opts.arrow + a;
      }).join("\n")
    );
    err.tries = tries;
    throw err;
  }
  module.exports = exports = bindings2;
  exports.getFileName = function getFileName(calling_file) {
    var origPST = Error.prepareStackTrace, origSTL = Error.stackTraceLimit, dummy = {}, fileName;
    Error.stackTraceLimit = 10;
    Error.prepareStackTrace = function(e, st) {
      for (var i = 0, l = st.length; i < l; i++) {
        fileName = st[i].getFileName();
        if (fileName !== __filename) {
          if (calling_file) {
            if (fileName !== calling_file) {
              return;
            }
          } else {
            return;
          }
        }
      }
    };
    Error.captureStackTrace(dummy);
    dummy.stack;
    Error.prepareStackTrace = origPST;
    Error.stackTraceLimit = origSTL;
    var fileSchema = "file://";
    if (fileName.indexOf(fileSchema) === 0) {
      fileName = fileURLToPath(fileName);
    }
    return fileName;
  };
  exports.getRoot = function getRoot(file) {
    var dir = dirname(file), prev;
    while (true) {
      if (dir === ".") {
        dir = process.cwd();
      }
      if (exists(join(dir, "package.json")) || exists(join(dir, "node_modules"))) {
        return dir;
      }
      if (prev === dir) {
        throw new Error(
          'Could not find module root given file: "' + file + '". Do you have a `package.json` file? '
        );
      }
      prev = dir;
      dir = join(dir, "..");
    }
  };
})(bindings, bindings.exports);
var bindingsExports = bindings.exports;
var sqlite3Binding = bindingsExports("node_sqlite3.node");
var trace = {};
var hasRequiredTrace;
function requireTrace() {
  if (hasRequiredTrace)
    return trace;
  hasRequiredTrace = 1;
  const util = require$$0;
  function extendTrace(object, property, pos) {
    const old = object[property];
    object[property] = function() {
      const error = new Error();
      const name = object.constructor.name + "#" + property + "(" + Array.prototype.slice.call(arguments).map(function(el) {
        return util.inspect(el, false, 0);
      }).join(", ") + ")";
      if (typeof pos === "undefined")
        pos = -1;
      if (pos < 0)
        pos += arguments.length;
      const cb = arguments[pos];
      if (typeof arguments[pos] === "function") {
        arguments[pos] = function replacement() {
          const err = arguments[0];
          if (err && err.stack && !err.__augmented) {
            err.stack = filter(err).join("\n");
            err.stack += "\n--> in " + name;
            err.stack += "\n" + filter(error).slice(1).join("\n");
            err.__augmented = true;
          }
          return cb.apply(this, arguments);
        };
      }
      return old.apply(this, arguments);
    };
  }
  trace.extendTrace = extendTrace;
  function filter(error) {
    return error.stack.split("\n").filter(function(line) {
      return line.indexOf(__filename) < 0;
    });
  }
  return trace;
}
(function(module, exports) {
  const path2 = path$1;
  const sqlite32 = sqlite3Binding;
  const EventEmitter = require$$2.EventEmitter;
  module.exports = sqlite32;
  function normalizeMethod(fn) {
    return function(sql) {
      let errBack;
      const args = Array.prototype.slice.call(arguments, 1);
      if (typeof args[args.length - 1] === "function") {
        const callback = args[args.length - 1];
        errBack = function(err) {
          if (err) {
            callback(err);
          }
        };
      }
      const statement = new Statement2(this, sql, errBack);
      return fn.call(this, statement, args);
    };
  }
  function inherits(target, source) {
    for (const k in source.prototype)
      target.prototype[k] = source.prototype[k];
  }
  sqlite32.cached = {
    Database: function(file, a, b) {
      if (file === "" || file === ":memory:") {
        return new Database2(file, a, b);
      }
      let db2;
      file = path2.resolve(file);
      if (!sqlite32.cached.objects[file]) {
        db2 = sqlite32.cached.objects[file] = new Database2(file, a, b);
      } else {
        db2 = sqlite32.cached.objects[file];
        const callback = typeof a === "number" ? b : a;
        if (typeof callback === "function") {
          let cb = function() {
            callback.call(db2, null);
          };
          if (db2.open)
            process.nextTick(cb);
          else
            db2.once("open", cb);
        }
      }
      return db2;
    },
    objects: {}
  };
  const Database2 = sqlite32.Database;
  const Statement2 = sqlite32.Statement;
  const Backup = sqlite32.Backup;
  inherits(Database2, EventEmitter);
  inherits(Statement2, EventEmitter);
  inherits(Backup, EventEmitter);
  Database2.prototype.prepare = normalizeMethod(function(statement, params) {
    return params.length ? statement.bind.apply(statement, params) : statement;
  });
  Database2.prototype.run = normalizeMethod(function(statement, params) {
    statement.run.apply(statement, params).finalize();
    return this;
  });
  Database2.prototype.get = normalizeMethod(function(statement, params) {
    statement.get.apply(statement, params).finalize();
    return this;
  });
  Database2.prototype.all = normalizeMethod(function(statement, params) {
    statement.all.apply(statement, params).finalize();
    return this;
  });
  Database2.prototype.each = normalizeMethod(function(statement, params) {
    statement.each.apply(statement, params).finalize();
    return this;
  });
  Database2.prototype.map = normalizeMethod(function(statement, params) {
    statement.map.apply(statement, params).finalize();
    return this;
  });
  Database2.prototype.backup = function() {
    let backup;
    if (arguments.length <= 2) {
      backup = new Backup(this, arguments[0], "main", "main", true, arguments[1]);
    } else {
      backup = new Backup(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
    }
    backup.retryErrors = [sqlite32.BUSY, sqlite32.LOCKED];
    return backup;
  };
  Statement2.prototype.map = function() {
    const params = Array.prototype.slice.call(arguments);
    const callback = params.pop();
    params.push(function(err, rows) {
      if (err)
        return callback(err);
      const result = {};
      if (rows.length) {
        const keys = Object.keys(rows[0]);
        const key = keys[0];
        if (keys.length > 2) {
          for (let i = 0; i < rows.length; i++) {
            result[rows[i][key]] = rows[i];
          }
        } else {
          const value = keys[1];
          for (let i = 0; i < rows.length; i++) {
            result[rows[i][key]] = rows[i][value];
          }
        }
      }
      callback(err, result);
    });
    return this.all.apply(this, params);
  };
  let isVerbose = false;
  const supportedEvents = ["trace", "profile", "change"];
  Database2.prototype.addListener = Database2.prototype.on = function(type) {
    const val = EventEmitter.prototype.addListener.apply(this, arguments);
    if (supportedEvents.indexOf(type) >= 0) {
      this.configure(type, true);
    }
    return val;
  };
  Database2.prototype.removeListener = function(type) {
    const val = EventEmitter.prototype.removeListener.apply(this, arguments);
    if (supportedEvents.indexOf(type) >= 0 && !this._events[type]) {
      this.configure(type, false);
    }
    return val;
  };
  Database2.prototype.removeAllListeners = function(type) {
    const val = EventEmitter.prototype.removeAllListeners.apply(this, arguments);
    if (supportedEvents.indexOf(type) >= 0) {
      this.configure(type, false);
    }
    return val;
  };
  sqlite32.verbose = function() {
    if (!isVerbose) {
      const trace2 = requireTrace();
      [
        "prepare",
        "get",
        "run",
        "all",
        "each",
        "map",
        "close",
        "exec"
      ].forEach(function(name) {
        trace2.extendTrace(Database2.prototype, name);
      });
      [
        "bind",
        "get",
        "run",
        "all",
        "each",
        "map",
        "reset",
        "finalize"
      ].forEach(function(name) {
        trace2.extendTrace(Statement2.prototype, name);
      });
      isVerbose = true;
    }
    return sqlite32;
  };
})(sqlite3$1);
var sqlite3Exports = sqlite3$1.exports;
const sqlite3 = /* @__PURE__ */ getDefaultExportFromCjs(sqlite3Exports);
let db = null;
const dbDir = path$1.join(electron.app.getPath("userData"), "database");
if (!fs$1.existsSync(dbDir)) {
  fs$1.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path$1.join(dbDir, "error_reporting.db");
async function getDbConnection() {
  if (db)
    return db;
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  return db;
}
async function initializeDatabase() {
  const db2 = await getDbConnection();
  await db2.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await db2.exec(`
    CREATE TABLE IF NOT EXISTS error_reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      reporter TEXT NOT NULL,
      assignee TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (reporter) REFERENCES users(id),
      FOREIGN KEY (assignee) REFERENCES users(id)
    )
  `);
  await db2.exec(`
    CREATE TABLE IF NOT EXISTS report_attachments (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES error_reports(id) ON DELETE CASCADE
    )
  `);
  await db2.exec(`
    CREATE TABLE IF NOT EXISTS report_history (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      action TEXT NOT NULL,
      user_id TEXT NOT NULL,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES error_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  const adminExists = await db2.get(
    "SELECT id FROM users WHERE username = ?",
    ["admin"]
  );
  if (!adminExists) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db2.run(
      `INSERT INTO users (id, username, password, role, department, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["1", "admin", "admin123", "admin", "管理部门", now, now]
    );
  }
}
async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}
async function createWindow() {
  const win = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path$1.join(__dirname, "../preload/index.js")
    }
  });
  {
    await win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  }
}
electron.app.whenReady().then(async () => {
  await initializeDatabase();
  setupFileHandlers();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", async () => {
  await closeDatabase();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
