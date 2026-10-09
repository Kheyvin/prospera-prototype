/* core/commands — command registry (CONTRACTS §5.6b, §6).
 *
 * Merges the `commands` object of every command module and refuses duplicates so two
 * modules can never silently compete for the same command name. Also defines
 * CommandError, the only exception a command may throw on purpose (through ctx.fail). */
Primus.module('core/commands', function (require) {
  'use strict';

  var MODULE_IDS = [
    'core/commands/app',
    'core/commands/web',
    'core/commands/tracking',
    'core/commands/security',
    'core/commands/desktop'
  ];

  function CommandError(code, message, extra) {
    var err = Error.call(this, message || code);
    this.name = 'CommandError';
    this.isCommandError = true;
    this.message = message || code || 'Command failed';
    this.code = code || 'error';
    if (extra && typeof extra === 'object') {
      var self = this;
      Object.keys(extra).forEach(function (key) {
        if (extra[key] !== undefined) self[key] = extra[key];
      });
    }
    if (err && err.stack) this.stack = err.stack;
  }
  CommandError.prototype = Object.create(Error.prototype);
  CommandError.prototype.constructor = CommandError;
  CommandError.prototype.toJSON = function () {
    var out = { code: this.code, message: this.message };
    var self = this;
    ['field', 'messageId', 'action', 'cta', 'details'].forEach(function (key) {
      if (self[key] !== undefined) out[key] = self[key];
    });
    return out;
  };

  function isCommandError(err) {
    return !!err && (err instanceof CommandError || err.isCommandError === true || err.name === 'CommandError');
  }

  function mergeCommands(moduleIds) {
    var merged = {};
    var owners = {};
    moduleIds.forEach(function (id) {
      var mod = require(id);
      var commands = mod && mod.commands;
      if (!commands || typeof commands !== 'object') {
        throw new Error('core/commands: module ' + id + ' does not export a commands object');
      }
      Object.keys(commands).forEach(function (name) {
        if (typeof commands[name] !== 'function') {
          throw new Error('core/commands: ' + id + '.' + name + ' is not a function');
        }
        if (Object.prototype.hasOwnProperty.call(merged, name)) {
          throw new Error('core/commands: duplicate command "' + name + '" in ' + id + ' (already defined by ' + owners[name] + ')');
        }
        merged[name] = commands[name];
        owners[name] = id;
      });
    });
    return { commands: merged, owners: owners };
  }

  var registry = mergeCommands(MODULE_IDS);

  return {
    commands: registry.commands,
    owners: registry.owners,
    commandNames: Object.keys(registry.commands),
    CommandError: CommandError,
    isCommandError: isCommandError,
    MODULE_IDS: MODULE_IDS.slice()
  };
});
