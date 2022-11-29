const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'post'
    },
    user: {
        type: String,
        required: true,
        unique: false
    },
    password: {
        type: String,
        required: true,
        unique: false,
    },
    content: {
        type: String,
        required: true,
        unique: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { 
    versionKey: false
});

module.exports = mongoose.model('comments', commentSchema);