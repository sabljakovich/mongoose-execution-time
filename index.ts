

export interface LogExecutionTimeConfig {
    logger: any;
    loggerLevel: string;
    loggerVerbosity: LoggerVerbosity
}

export enum LoggerVerbosity  {
    Normal,
    High
}

let logger : any = console;
let loggerLevel: string = 'debug';
let loggerVerbosity : LoggerVerbosity = LoggerVerbosity.High;

export function logExecutionTimePlugin (targetSchema : any, config ?: LogExecutionTimeConfig) {

    targetSchema.query.additionalLogProperties = function(additionalProperties: Object | string | number | boolean) {
        this.__additionalProperties = additionalProperties;
        return this;
    };

    if(!config) {
        config  = {} as LogExecutionTimeConfig;
    }
    if(config.logger) {
        logger = config.logger;
    }
    if(config.loggerLevel) {
        loggerLevel = config.loggerLevel;
    }
    if(config.loggerVerbosity) {
        loggerVerbosity = config.loggerVerbosity;
    }

    // TODO: Support more methods
    const targetMethods = ['find', 'findOne']

    targetMethods.forEach( method => {
        targetSchema.pre(method, preQueryHook);
        targetSchema.post(method, postQueryHook);
    })
}

function preQueryHook() {
    // @ts-ignore
    this.__startTime = Date.now();
}
function postQueryHook() {
    // @ts-ignore
    if (this.__startTime != null) {
        // @ts-ignore
        loggingFunction(this.op, this._collection.collectionName, Date.now() - this.__startTime, this._conditions, this.options, this.__additionalProperties)
    }
}

// TODO: options
function loggingFunction(
    operation: string,
    collectionName: string,
    executionTimeMS: number,
    filter: Object | null,
    options: Object,
    additionalLogProperties: any) {

    let logProperties: any = loggerVerbosity == LoggerVerbosity.High
        ? { filter, options }
        : null

    if(additionalLogProperties) {
        logProperties = logProperties
            ? { ...logProperties, additionalLogProperties }
            : { additionalLogProperties }
    }

    logger[loggerLevel](`Query: ${operation} in ${collectionName} completed in: ${executionTimeMS} ms`, logProperties)
}




