const mongoose = require('mongoose');
const { logExecutionTime } = require('mongoose-execution-time');

mongoose.plugin(logExecutionTime, {
    // loggerFunction: (operation, collectionName, executionTimeMS, filter, update, additionalLogProperties) => {
    //     console.log(`My custom logger function | ${operation} | ${collectionName} | ${executionTimeMS}`, { filter, update, additionalLogProperties })
    // }
});

const Schema = mongoose.Schema;

const BlogPost = new Schema({
    title: String,
    body: String,
});

const Customer = new Schema({
    customerId: String,
    name: String
})


const BlogPostModel = mongoose.model('blogPost', BlogPost);
const CustomerModel = mongoose.model('customer', Customer);



const run = async () => {

    console.log('Running...')

    await mongoose.connect('mongodb://localhost:27017/my_database', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });

    await BlogPostModel.insertMany([{
        title: 'Post 1',
        body: 'Body 1'
    }])


    await BlogPostModel.find({ title: 'Title' }).additionalLogProperties({ message: 'My custom message'});

    await CustomerModel.find({});


    await new BlogPostModel({title: 'SAVED'}).save();

    await BlogPostModel.find({ title: 'Post 1' }).additionalLogProperties({bruh: 1});
    await BlogPostModel.findOne();

    // await BlogPostModel.count({ title:  'Post 1' });
    await BlogPostModel.estimatedDocumentCount({ title:  'Post 1' });
    await BlogPostModel.countDocuments({ title:  'Post 1' });
    await BlogPostModel.findOneAndUpdate({ title: 'Post 1' }, { title: 'updated' })
    await BlogPostModel.findOneAndDelete({ title: 'Post 1' })
    await BlogPostModel.findOneAndRemove({ title: 'Post 1' })
    await BlogPostModel.deleteOne({ title: 'Post 1' })
    await BlogPostModel.deleteMany({ title: 'Post 1' })
    // await BlogPostModel.remove({ title: 'Post 1' })

    await BlogPostModel.aggregate([{$match: {title: 'Post 1'}}])
    await BlogPostModel.aggregate([{ $match: { title: 'Post 1' } }, { $project: { title: 1 } }])
    console.log('Completed')
}

run().then(_ => console.log('Executed'));

