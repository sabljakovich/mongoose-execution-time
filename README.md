
# Mongoose execution time

Mongoose plugin for measuring and logging query execution time.

```sh
npm i mongoose-execution-time
```

Output example:

```
Query: find in customers completed in: 7 ms { filter: {} }

Query: find in blogposts completed in: 4 ms { filter: { title: 'Post 1' },
  additionalLogProperties: { bruh: 1 } }

Query: findOne in blogposts completed in: 4 ms { filter: {} }

Query: estimatedDocumentCount in blogposts completed in: 3 ms { filter: {} }

```

## How to use

```js
const mongoose = require('mongoose');
const { logExecutionTime } = require('mongoose-execution-time');

mongoose.plugin(logExecutionTime);
```


## Configuration


The plugin can be easily adjusted via the following configuration options.

```ts
interface LogExecutionTimeConfig {
    logger?: any;
    loggerLevel?: string;
    loggerVerbosity?: LoggerVerbosity
}
```


| Option  | Description  | Default  |
|---|---|---|
| logger  | logger provider  | console   |
| loggerLevel  | logger level used by the logger above  | debug  |
| loggerVerbosity  | controls how much information gets logged  | High  |


Code example:

```js
const mongoose = require('mongoose');
const { logExecutionTime, LoggerVerbosity } = require('mongoose-execution-time');

mongoose.plugin(logExecutionTime, {
    loggerVerbosity: LoggerVerbosity.Normal,
    loggerLevel: 'info'
});
```
## Logging additional information

The plugin exposes a method for logging additional information in the same log line as the execution time.

Code example:

```ts
await BlogPostModel.find({ title: 'Title' }).additionalLogProperties({ message: 'My custom message'});
```

Output example:

```
Query: find in blogposts completed in: 8 ms { additionalLogProperties: { message: 'My custom message' } }
```