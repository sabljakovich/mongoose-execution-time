"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logExecutionTime = exports.LoggerVerbosity = void 0;
var LoggerVerbosity;
(function (LoggerVerbosity) {
    LoggerVerbosity[LoggerVerbosity["Normal"] = 0] = "Normal";
    LoggerVerbosity[LoggerVerbosity["High"] = 1] = "High";
})(LoggerVerbosity = exports.LoggerVerbosity || (exports.LoggerVerbosity = {}));
var logger = console;
var loggerLevel = 'debug';
var loggerVerbosity = LoggerVerbosity.High;
var loggerFunction = defaultLoggingFunction;
function logExecutionTime(targetSchema, config) {
    targetSchema.query.additionalLogProperties = function (additionalProperties) {
        this.__additionalProperties = additionalProperties;
        return this;
    };
    if (!config) {
        config = {};
    }
    if (config.logger) {
        logger = config.logger;
    }
    if (config.loggerLevel) {
        loggerLevel = config.loggerLevel;
    }
    if (config.loggerVerbosity != null) {
        loggerVerbosity = config.loggerVerbosity;
    }
    if (config.loggerFunction) {
        loggerFunction = config.loggerFunction;
    }
    var targetMethods = [
        'find',
        'findOne',
        'count',
        'countDocuments',
        'estimatedDocumentCount',
        'findOneAndUpdate',
        'findOneAndRemove',
        'findOneAndDelete',
        'deleteOne',
        'deleteMany',
        'remove',
        'aggregate',
    ];
    targetMethods.forEach(function (method) {
        targetSchema.pre(method, preQueryHook);
        targetSchema.post(method, postQueryHook);
    });
}
exports.logExecutionTime = logExecutionTime;
function preQueryHook() {
    // @ts-ignore
    this.__startTime = Date.now();
}
function postQueryHook() {
    // @ts-ignore
    var target = this;
    if (target.__startTime != null) {
        var op = target.constructor.name === 'Aggregate' ? 'aggregate' : target.op;
        var collectionName = target._collection ? target._collection.collectionName : target._model.collection.collectionName;
        loggerFunction(op, collectionName, Date.now() - target.__startTime, target._conditions, target._update, target.__additionalProperties);
    }
}
function defaultLoggingFunction(operation, collectionName, executionTimeMS, filter, update, additionalLogProperties) {
    var logProperties = null;
    if (loggerVerbosity == LoggerVerbosity.High) {
        logProperties = {
            filter: filter
        };
        if (update) {
            logProperties.update = update;
        }
    }
    if (additionalLogProperties) {
        logProperties = logProperties
            ? __assign(__assign({}, logProperties), { additionalLogProperties: additionalLogProperties }) : { additionalLogProperties: additionalLogProperties };
    }
    logger[loggerLevel]("Query: ".concat(operation, " in ").concat(collectionName, " completed in: ").concat(executionTimeMS, " ms"), logProperties);
}
