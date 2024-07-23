export interface LogExecutionTimeConfig {
    logger?: any;
    loggerLevel?: string;
    loggerVerbosity?: LoggerVerbosity,
    loggerFunction?: LoggerFunction
}

export enum LoggerVerbosity  {
    Normal,
    High
}

type LoggerFunction = (
    operation: string,
    collectionName: string,
    executionTimeMS: number,
    filter: Object | null,
    update: Object | null,
    additionalLogProperties: any,
    aggregationPipeline?: Array<Object> | null | undefined,
    queryStack?: String | null | undefined
    ) => void;


let logger : any = console;
let loggerLevel: string = 'debug';
let loggerVerbosity : LoggerVerbosity = LoggerVerbosity.High;
let loggerFunction : LoggerFunction = defaultLoggingFunction;

export function logExecutionTime (targetSchema : any, config ?: LogExecutionTimeConfig) {

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
    if(config.loggerVerbosity != null) {
        loggerVerbosity = config.loggerVerbosity;
    }

    if(config.loggerFunction) {
        loggerFunction = config.loggerFunction;
    }

    const targetMethods = [
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
    ]

    targetMethods.forEach( method => {
        targetSchema.pre(method, preQueryHook);
        targetSchema.post(method, postQueryHook);
    })
}

function preQueryHook() {
    // @ts-ignore
    this.__startTime = Date.now();
    // Capture stack trace
    const err = new Error();
    // @ts-ignore
    Error.captureStackTrace(err);
    let stack = err.stack;
    if(typeof stack=='string' && stack.search('Error')==0) {
        stack = stack.replace('Error', 'Trace');
    }
    // @ts-ignore
    this.__queryStack = stack;
}
function postQueryHook() {

    // @ts-ignore
    const target = this;

    if (target.__startTime != null) {

        const op = target.constructor.name === 'Aggregate' ? 'aggregate' : target.op;
        const collectionName = target._collection ? target._collection.collectionName : target._model.collection.collectionName;

        loggerFunction(
            op,
            collectionName,
            Date.now() - target.__startTime,
            target._conditions,
            target._update,
            target.__additionalProperties,
            target._pipeline,
            target.__queryStack
        )
    }
}
function defaultLoggingFunction(
    operation: string,
    collectionName: string,
    executionTimeMS: number,
    filter: Object | null,
    update: Object | null,
    additionalLogProperties: any,
    aggregationPipeline: Array<Object> | null | undefined,
    queryStack: String | null | undefined) {

    let logProperties: any = null;

    if(loggerVerbosity == LoggerVerbosity.High) {

        logProperties = {}

        if(filter) {
            logProperties.filter = filter
        }

        if(update) {
            logProperties.update = update
        }

        if(aggregationPipeline) {
            logProperties.aggregationPipeline = JSON.stringify(aggregationPipeline)
        }

        if(queryStack){
            logProperties.queryStack = queryStack
        }
    }

    if(additionalLogProperties) {
        logProperties = logProperties
            ? { ...logProperties, additionalLogProperties }
            : { additionalLogProperties }
    }

    logger[loggerLevel](`Query: ${operation} in ${collectionName} completed in: ${executionTimeMS} ms`, logProperties)
}




